//----------------------------------------------------------------------------------------------------------------------
// Actor Behavior - This represents an entity that can have/use powers, as well as have buffs/debuffs applied to it.
//
// @module actor.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var PhysicalEntity = require('./physical');
var entityMan = require('../manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ActorEntity()
{
    PhysicalEntity.apply(this, arguments);

    // We need to process our list of powers, and require the appropriate power modules
    this._buildPowers();

    // Listen for input events from the client
    this.controller.on('activate power', this.handleActivatePower.bind(this));
} // end ActorEntity

util.inherits(ActorEntity, PhysicalEntity);

//----------------------------------------------------------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------------------------------------------------------

ActorEntity.prototype._buildPowers = function()
{
    var self = this;
    this.powerModules = {};

    _.each(_.keys(this.powers), function(key)
    {
        self.powerModules[key] = require('../powers/' + key);
    });
}; // end _buildPowers

//----------------------------------------------------------------------------------------------------------------------
// Event Handlers
//----------------------------------------------------------------------------------------------------------------------

/**
 * Handles 'activate power' messages. Expects a payload of the following format:
 *
 * ```javascript
 * {
 *      power: "..."    // name of the power
 *      target: "..."   // the id of the target entity
 * }
 * ```
 *
 * @param {Object} payload - The payload of the event.
 * @private
 */
ActorEntity.prototype.handleActivatePower = function(payload)
{
    logger.debug('Activate power event:', logger.dump(payload));

    var state = this.powers[payload.power];
    var power = this.powerModules[payload.power];
    var target = entityMan.entities[payload.target];

    power.activate(state, this, target);
}; // end handleInput

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

ActorEntity.prototype.toJSON = function()
{
    var entity = PhysicalEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        powers: this.powers,
        model: this.template.model
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------

module.exports = ActorEntity;

//----------------------------------------------------------------------------------------------------------------------
