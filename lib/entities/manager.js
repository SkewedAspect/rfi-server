//----------------------------------------------------------------------------------------------------------------------
// Entity Manager
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var Promise = require('bluebird');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function EntityManager()
{
    this.entities = {};
} // end EntityManager

/**
 * Creates an entity instance, and adds it to the manager. The entity definition **must** have a `behavior` property,
 * and that **must** be the path to a requireable module. The module must be an instantiable class, which either
 * inherits from `behaviors/entity.js`, or reimplements that behavior.
 *
 * @param {object} entityDef - Defines the properties of the entity. Any attributes or functions on this object are
 *          added to the resulting entity. If this entity can be persisted, `entityDef` should have a `save` function,
 *          which returns a `Promise`.
 *
 * @param {EventEmitter} controller - This is an event emitter on which we will listen for events inside the entity. It
 *          can be player input, or ai input; as long as it emits the events the behavior cares about, everything will
 *          work just fine.
 *
 * @returns {Promise} Returns a promise that resolves if the entity was successfully added, otherwise it is rejected
 *          with an error.
 */
EntityManager.prototype.createEntity = function(entityDef, controller)
{
    var self = this;

    // We do not allow for duplicate entity ids.
    if(entityDef.id in this.entities)
    {
        return Promise.reject(new Error("Can't add entity with ID " + entityDef.id + "! Entity already exists."));
    } // end if

    return new Promise(function(resolve)
    {
        // Attempt to get the correct behavior class
        var BehaviorClass = require(entityDef.template.behavior);

        // We instantiate the behavior class as the entity. This way, internally, behaviors can simply use `this` to
        // refer to the entity, as opposed to having to pass the entity into the behaviors. It's a bit more object
        // oriented, but it has the benefit of being less code and less places to make mistakes, IMHO.
        var entity = new BehaviorClass(entityDef, controller);

        // Add the newly created entity to our list of entities.
        self.entities[entity.id] = entity;

        // Send a create message to all clients, so they know to create the entity.
        self.broadcast('create entity', entity, [entity.id]);

        // Send an inhabit message to the new entity's client.
        entity.controller.event('inhabit entity', entity);

        // Tell the client about all the already created entities
        _.forIn(self.entities, function(ent)
        {
            logger.debug('Checking entity: %s for entity %s', ent.id, entity.id);
            if(ent.id !== entity.id)
            {
                console.log('sending create for entity:', ent.id);
                entity.controller.event('create entity', ent);
            } // end if
        });

        // Let the whoever know what the entity id is.
        resolve(entity.id);
    })
        .catch(function(ex)
        {
            logger.error('Failed to create entity:\n%s', ex.stack || ex.message);

            var error = new Error("Failed to create entity.");
            error.inner = ex;

            throw error;
        }); // end try
}; // end createEntity

/**
 * Removes an entity from the system. (Success is assumed.)
 *
 * @param {string} entityID - The id of the entity to remove.
 * @returns {Promise} Returns a promise that is always resolved. (This is useful for promise chaining, and consistency.)
 */
EntityManager.prototype.removeEntity = function(entityID)
{
    delete this.entities[entityID];

    return Promise.resolve();
}; // end removeEntity


/**
 * Broadcasts a message to all entity's controllers, possibly filtering the list.
 *
 * @param {String} event - The event to send.
 * @param {*} message - The message to send.
 * @param {Array} [filter] - A list of entity IDs not to send to.
 */
EntityManager.prototype.broadcast = function(event, message, filter)
{
    filter = filter || [];

    _.forIn(this.entities, function(entity)
    {
        if(!_.contains(filter, entity.id))
        {
            entity.controller.event(event, message);
        } // end if
    }); // end forIn
}; // end broadcast

//----------------------------------------------------------------------------------------------------------------------

module.exports = new EntityManager();

//----------------------------------------------------------------------------------------------------------------------
