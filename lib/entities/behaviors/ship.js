//----------------------------------------------------------------------------------------------------------------------
// Brief description for ship module.
//
// @module ship
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var mixin = require('../mixins/mixin');
var ActorEntity = require('./actor');
var Damageable = require('../mixins/damageable');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ShipEntity()
{
    ActorEntity.apply(this, arguments);

    Object.defineProperties(ShipEntity.prototype, {
        max_hitpoints: {
            value: this.template.hull
        },
        stats: {
            value: this.template.stats
        }
    });

    // Listen for input events from the client
    this.controller.on('heading', this.handleHeading.bind(this));
    this.controller.on('pitch', this.handlePitch.bind(this));
    this.controller.on('roll', this.handleRoll.bind(this));
    this.controller.on('throttle', this.handleThrottle.bind(this));
    this.controller.on('all-stop', this.handleAllStop.bind(this));
} // end ShipEntity

util.inherits(ShipEntity, ActorEntity);
mixin(ShipEntity, Damageable);

ShipEntity.prototype.toJSON = function()
{
    var entity = ActorEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        max_hitpoints: this.max_hitpoints,
        stats: this.stats
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------
// Input Handlers
//----------------------------------------------------------------------------------------------------------------------

ShipEntity.prototype.handleHeading = function(payload)
{
    this.targetAngularVelocity.y = payload.value;

    this.update('targetAngularVelocity');
}; // end handleHeading

ShipEntity.prototype.handlePitch = function(payload)
{
    this.targetAngularVelocity.z = payload.value;

    this.update('targetAngularVelocity');
}; // end handlePitch

ShipEntity.prototype.handleRoll = function(payload)
{
    this.targetAngularVelocity.x = payload.value;

    this.update('targetAngularVelocity');
}; // end handleRoll

ShipEntity.prototype.handleThrottle = function(payload)
{
    this.targetLinearVelocity.x += payload.value;

    this.update('targetLinearVelocity');
}; // end handleThrottle

ShipEntity.prototype.handleAllStop = function(payload)
{
    this.targetLinearVelocity.x = 0;
    this.targetLinearVelocity.y = 0;
    this.targetLinearVelocity.z = 0;

    this.targetAngularVelocity.x = 0;
    this.targetAngularVelocity.y = 0;
    this.targetAngularVelocity.z = 0;

    this.update(['targetAngularVelocity', 'targetLinearVelocity']);
}; // end handleAllStop

//----------------------------------------------------------------------------------------------------------------------

module.exports = ShipEntity;

//----------------------------------------------------------------------------------------------------------------------