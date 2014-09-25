//----------------------------------------------------------------------------------------------------------------------
// Brief description for ship module.
//
// @module ship
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var BaseEntity = require('./entity');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ShipEntity()
{
    BaseEntity.apply(this, arguments);

    this._buildProperties();

    // Listen for input events from the client
    this.controller.on('input', this.handleInput.bind(this));
} // end ShipEntity

//TODO: This probably will not inherit from BaseEntity directly in the future; but for now this works.
util.inherits(ShipEntity, BaseEntity);

ShipEntity.prototype._buildProperties = function()
{
    Object.defineProperties(this, {
        max_hitpoints: {
            value: this.template.hull
        },
        turn_rate: {
            value: this.template.turn_rate
        },
        max_speed: {
            value: this.template.max_speed
        },
        stats: {
            value: this.template.stats
        }
    });
}; // end _buildProperties

ShipEntity.prototype.handleInput = function(payload)
{
    logger.warn('Got input event:', logger.dump(payload));
}; // end handleInput

ShipEntity.prototype.toJSON = function()
{
    var entity = BaseEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        max_hitpoints: this.max_hitpoints,
        turn_rate: this.turn_rate,
        max_speed: this.max_speed,
        stats: this.stats
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------

module.exports = ShipEntity;

//----------------------------------------------------------------------------------------------------------------------