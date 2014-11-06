//----------------------------------------------------------------------------------------------------------------------
// Physical Entity - This behavior represents anything that moves in the 3D world and/or has the ability to be
// collided with. Physical entities are simulated, and as such, we need to keep the number of them in a given scene to
// as low as possible.
//
// @module physical.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');
var rfiPhysics = require('rfi-physics');

var BaseEntity = require('./entity');
var physics = require('../../physics/physics');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function PhysicalEntity()
{
    BaseEntity.apply(this, arguments);

    // Setup Physical
    this.max_speed = {
        x: this.template.max_speed.x / 10,
        y: this.template.max_speed.y / 10,
        z: this.template.max_speed.z / 10
    };

    this.body = physics.engine.addBody({ mass: 1 });

    Object.defineProperties(this, {
        turn_rate: {
            value: (this.template.turn_rate || 2) * (Math.PI / 180)
        },
        linear_responsiveness: {
            value: this.template.linear_responsiveness
        },
        angular_responsiveness: {
            value: this.template.angular_responsiveness
        },
        targetLinearVelocity: {
            get: function(){ return this.targetVelocityController.targetLinearVelocity; },
            set: function(linVel){ this.targetVelocityController.targetLinearVelocity = linVel; }
        },
        targetAngularVelocity: {
            get: function(){ return this.targetVelocityController.targetAngularVelocity; },
            set: function(angVel){ this.targetVelocityController.targetAngularVelocity = angVel; }
        }
    });

    // Create a target velocity controller
    this.targetVelocityController = new rfiPhysics.TargetVelocityController(this.body, {
        maxLinearThrust: {
            x: this.max_speed.x,
            y: this.max_speed.y,
            z: this.max_speed.z
        },
        linearTargetVelocityScaling: {
            x: this.max_speed.x,
            y: this.max_speed.y,
            z: this.max_speed.z
        },
        linearResponsiveness: {
            x: this.linear_responsiveness.x,
            y: this.linear_responsiveness.y,
            z: this.linear_responsiveness.z
        },

        maxAngularThrust: {
            x: this.turn_rate,
            y: this.turn_rate,
            z: this.turn_rate
        },
        angularTargetVelocityScaling: {
            x: this.turn_rate,
            y: this.turn_rate,
            z: this.turn_rate
        },
        angularResponsiveness: {
            x: this.angular_responsiveness.x,
            y: this.angular_responsiveness.y,
            z: this.angular_responsiveness.z
        }
    });
} // end PhysicalEntity

util.inherits(PhysicalEntity, BaseEntity);

PhysicalEntity.prototype.toJSON = function()
{
    var entity = BaseEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        turn_rate: this.turn_rate,
        max_speed: this.max_speed,
        linear_responsiveness: this.linear_responsiveness,
        angular_responsiveness: this.angular_responsiveness,
        targetLinearVelocity: this.targetLinearVelocity,
        targetAngularVelocity: this.targetAngularVelocity
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicalEntity;

//----------------------------------------------------------------------------------------------------------------------