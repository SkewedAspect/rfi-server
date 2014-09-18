//----------------------------------------------------------------------------------------------------------------------
// Brief description for ship module.
//
// @module ship
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var BaseEntity = require('./entity');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ShipEntity()
{
    BaseEntity.apply(this, arguments);

    // Listen for input events from the client
    this.controller.on('input', this.handleInput.bind(this));
} // end ShipEntity

//TODO: This probably will not inherit from BaseEntity directly in the future; but for now this works.
util.inherits(ShipEntity, BaseEntity);

ShipEntity.prototype.handleInput = function(payload)
{
    logger.warn('Got input event:', logger.dump(payload));
}; // end handleInput

//----------------------------------------------------------------------------------------------------------------------

module.exports = ShipEntity;

//----------------------------------------------------------------------------------------------------------------------