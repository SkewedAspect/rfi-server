//----------------------------------------------------------------------------------------------------------------------
// Brief description for entity.js module.
//
// @module entity.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var uuid = require('node-uuid');
var Promise = require('bluebird');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function BaseEntity(entityDef, controller)
{
    this.controller = controller;
    this.fullUpdate = false;

    // This is not an array so that we can automatically de-duplicate.
    this.updateFields = {};

    // Check for a .save function
    if(entityDef.save)
    {
        entityDef.$save = entityDef.save;
    } // end if

    // Merge the definition with our instance
    _.merge(this, entityDef);

    // If our entity definition didn't contain an ID, generate one.
    if(!this.id)
    {
        this.id = uuid.v4();
        logger.debug('Generating entity id:', this.id);
    } // end if

    // This must be build in the constructor so that instances don't share a global throttle!
    this._sendUpdate = _.throttle(this._sendUpdate, 100);
} // end BaseEntity

BaseEntity.prototype = {
    get behavior() {
        return this.template.behavior;
    }
}; // end prototype

//----------------------------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------------------------

/**
 * Sends the update event to our controller. This function is throttled to a maximum of once ever 100ms.
 *
 * @private
 */
BaseEntity.prototype._sendUpdate = function()
{
    if(!_.isEmpty(this.updateFields) || this.fullUpdate)
    {
        var update = this.toJSON();

        if(!this.fullUpdate)
        {
            update = _.pick(this, _.keys(this.updateFields));
            update.id = this.id;
        } // end if

        this.controller.event('entity update', update);
    } // end if

    this.updateFields = {};
    this.fullUpdate = false;
};

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

/**
 * Emits an event on this entity's controller. Updates are throttled to 1 every 100ms. You may pass in a list of strings,
 * and the update will only include those filter, instead of the full object. These field names are accumulated across
 * calls until an update event is fired.
 *
 * @param {string[]=} filter - A list of fields to include in the update. If undefined, we assume a full update is
 * requested.
 */
BaseEntity.prototype.update = function(filter)
{
    var self = this;
    if(filter !== undefined)
    {
        // Ensure filter is an array
        filter = [].concat(filter);

        _.each(filter, function(key)
        {
            self.updateFields[key] = true;
        });
    }
    else
    {
        this.fullUpdate = true;
    } // end if

    this._sendUpdate();
}; // end update

/**
 * Saves the entity's state. If the entity definition we were created with contains a `save()` function, then we store
 * that as `$save()` when we're constructed. Calling `save()` will then call `$save()` under the hood, allowing the
 * definition to control how it persists it's state. In the event that we don't have a `$save()` function, we simply
 * return an already resolved promise.
 *
 * @returns {Promise} Returns a promise that resolves if the save is successful.
 */
BaseEntity.prototype.save = function()
{
    if(this.$save)
    {
        return this.$save();
    }
    else
    {
        return Promise.resolve();
    } // end if
}; // end save

/**
 * Controls how we generate our JSON representation. Returns a plain object with only a sub-set of our actual
 * properties. It is up to all descendants of this class to override this method, and add in support for their own
 * properties.
 *
 * @returns {{id: String, behavior: String}} - A simple json representation of this entity.
 */
BaseEntity.prototype.toJSON = function()
{
    return {
        id: this.id,
        behavior: this.behavior
    }
}; // end if

//----------------------------------------------------------------------------------------------------------------------

module.exports = BaseEntity;

//----------------------------------------------------------------------------------------------------------------------