//----------------------------------------------------------------------------------------------------------------------
// Actor Behavior - This represents an entity that can have/use powers, as well as have buffs/debuffs applied to it.
//
// @module actor.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var PhysicalEntity = require('./physical');

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

}; // end _buildPowers

//----------------------------------------------------------------------------------------------------------------------
// Event Handlers
//----------------------------------------------------------------------------------------------------------------------

ActorEntity.prototype.handleActivatePower = function(payload)
{
    logger.warn('Got activate power event:', logger.dump(payload));
}; // end handleInput

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

ActorEntity.prototype.toJSON = function()
{
    var entity = PhysicalEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        powers: this.powers
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------

module.exports = ActorEntity;

//----------------------------------------------------------------------------------------------------------------------
