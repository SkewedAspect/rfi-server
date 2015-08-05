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

    // Throttle our syncState function
    //this.syncState = _.throttle(this.syncState, 1000, { leading: false });

    setInterval(this.syncState.bind(this), 1000);

    Object.defineProperties(this, {
        turn_rate: {
            value: (this.template.turn_rate || 2) * (Math.PI / 180)
        },
        position: {
            get: function(){ return this.body.position; },
            set: function(pos){ this.body.position.set(pos.x, pos.y, pos.z); }
        },
        orientation: {
            get: function(){ return this.body.quaternion; },
            set: function(orientation){ this.body.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w); }
        },
        linearVelocity: {
            get: function(){ return this.body.velocity; },
            set: function(velocity){ this.body.velocity.set(velocity.x, velocity.y, velocity.z); }
        },
        angularVelocity: {
            get: function(){ return this.body.angularVelocity; },
            set: function(velocity){ this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z); }
        },
        linear_responsiveness: {
            value: this.template.linear_responsiveness
        },
        angular_responsiveness: {
            value: this.template.angular_responsiveness
        },
        targetLinearVelocity: {
            get: function() { return this.targetVelocityController.targetLinearVelocity; },
            set: function(linVel)
            {
                this.targetVelocityController.targetLinearVelocity.x = linVel.x;
                this.targetVelocityController.targetLinearVelocity.y = linVel.y;
                this.targetVelocityController.targetLinearVelocity.z = linVel.z;

                // Schedule a position, linearVelocity, and targetLinearVelocity update.
                this.update(['position', 'linearVelocity', 'targetLinearVelocity']);
            }
        },
        targetAngularVelocity: {
            get: function() { return this.targetVelocityController.targetAngularVelocity; },
            set: function(angVel)
            {
                this.targetVelocityController.targetAngularVelocity.x = angVel.x;
                this.targetVelocityController.targetAngularVelocity.y = angVel.y;
                this.targetVelocityController.targetAngularVelocity.z = angVel.z;

                // Schedule an orientation, angularVelocity, and targetAngularVelocity update.
                this.update(['orientation', 'angularVelocity', 'targetAngularVelocity']);
            }
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
        position: this.position,
        orientation: this.orientation,
        linear_responsiveness: this.linear_responsiveness,
        angular_responsiveness: this.angular_responsiveness,
        targetLinearVelocity: this.targetLinearVelocity,
        targetAngularVelocity: this.targetAngularVelocity
    });

    return entity;
}; // end toJSON

PhysicalEntity.prototype.syncState = function()
{
    // Update the primary physical state
    this.update(['position', 'orientation', 'targetLinearVelocity', 'targetAngularVelocity']);
};

//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicalEntity;

//----------------------------------------------------------------------------------------------------------------------
