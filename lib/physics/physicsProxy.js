//----------------------------------------------------------------------------------------------------------------------
/// Brief description for physicsProxy.js module.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var rfiPhysics = require('rfi-physics');

var mathLib = require('../math');
var ObjectProxy = require('../ObjectProxy');

//----------------------------------------------------------------------------------------------------------------------

class PhysicsProxy
{
    constructor(model, body)
    {
        this.model = model;
        this.body = body;

        // Define the model's state, taking the template into account
        Object.defineProperties(this, {
            state: { value: new ObjectProxy(model.state, model.template.baseState), writable: false }
        });

        // Create a target velocity controller
        this.targetVelocityController = new rfiPhysics.TargetVelocityController(this.body, {
            maxLinearThrust: {
                x: this.state.maxSpeed.x,
                y: this.state.maxSpeed.y,
                z: this.state.maxSpeed.z
            },
            linearTargetVelocityScaling: {
                x: this.state.maxSpeed.x,
                y: this.state.maxSpeed.y,
                z: this.state.maxSpeed.z
            },
            linearResponsiveness: {
                x: this.state.linearResponsiveness.x,
                y: this.state.linearResponsiveness.y,
                z: this.state.linearResponsiveness.z
            },

            maxAngularThrust: {
                x: mathLib.degreesToRadians(this.state.turnRate),
                y: mathLib.degreesToRadians(this.state.turnRate),
                z: mathLib.degreesToRadians(this.state.turnRate)
            },
            angularTargetVelocityScaling: {
                x: mathLib.degreesToRadians(this.state.turnRate),
                y: mathLib.degreesToRadians(this.state.turnRate),
                z: mathLib.degreesToRadians(this.state.turnRate)
            },
            angularResponsiveness: {
                x: this.state.angularResponsiveness.x,
                y: this.state.angularResponsiveness.y,
                z: this.state.angularResponsiveness.z
            }
        });
    } // end constructor

    get position(){ return this.body.position; }
    set position(pos){ this.body.position.set(pos.x, pos.y, pos.z); }

    get orientation(){ return this.body.quaternion; }
    set orientation(orientation){ this.body.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w); }

    get linearVelocity(){ return this.body.velocity; }
    set linearVelocity(velocity){ this.body.velocity.set(velocity.x, velocity.y, velocity.z); }

    get angularVelocity(){ return this.body.angularVelocity; }
    set angularVelocity(velocity){ this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z); }

    get targetLinearVelocity() { return this.targetVelocityController.targetLinearVelocity; }
    set targetLinearVelocity(linVel)
    {
        this.targetVelocityController.targetLinearVelocity.x = linVel.x;
        this.targetVelocityController.targetLinearVelocity.y = linVel.y;
        this.targetVelocityController.targetLinearVelocity.z = linVel.z;

        this.state.targetLinearVelocity = linVel;
    }

    get targetAngularVelocity() { return this.targetVelocityController.targetAngularVelocity; }
    set targetAngularVelocity(angVel)
    {
        this.targetVelocityController.targetAngularVelocity.x = angVel.x;
        this.targetVelocityController.targetAngularVelocity.y = angVel.y;
        this.targetVelocityController.targetAngularVelocity.z = angVel.z;

        this.state.targetAngularVelocity = angVel;
    }

    syncToModel()
    {
        this.state.position = { x: this.position.x, y: this.position.y, z: this.position.z };
        this.state.orientation = { x: this.orientation.x, y: this.orientation.y, z: this.orientation.z, w: this.orientation.w };
        this.state.linearVelocity = { x: this.linearVelocity.x, y: this.linearVelocity.y, z: this.linearVelocity.z };
        this.state.angularVelocity = { x: this.angularVelocity.x, y: this.angularVelocity.y, z: this.angularVelocity.z };

        return this.model.save();
    } // end syncToModel

    syncToPhysicsBody()
    {
        this.position = this.state.position || this.position;
        this.orientation = this.state.orientation || this.orientation;
        this.linearVelocity = this.state.linearVelocity || this.linearVelocity;
        this.angularVelocity = this.state.angularVelocity || this.angularVelocity;
    } // end syncToPhysicsBody
} // end class PhysicsProxy

//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicsProxy;

//----------------------------------------------------------------------------------------------------------------------
