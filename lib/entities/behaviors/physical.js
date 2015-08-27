//----------------------------------------------------------------------------------------------------------------------
// Physical Entity - This behavior represents anything that moves in the 3D world and/or has the ability to be
// collided with. Physical entities are simulated, and as such, we need to keep the number of them in a given scene to
// as low as possible.
//
// @module physical.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var BaseEntity = require('./entity');
var physics = require('../../physics/manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class PhysicalEntity extends BaseEntity
{
    constructor(model)
    {
        super(model);

        // Store our physics body
        this.body = physics.addBody(this.model);

        this.state.position = this.state.position || { x: 0, y: 0, z: 0 };
    } // end constructor

    toJSON()
    {
        var entity = super.toJSON();

        return _.assign(entity, {
            turnRate: this.state.turnRate,
            maxSpeed: this.state.maxSpeed,
            position: this.state.position,
            orientation: this.state.orientation,
            linearResponsiveness: this.state.linearResponsiveness,
            angularResponsiveness: this.state.angularResponsiveness,
            targetLinearVelocity: this.state.targetLinearVelocity,
            targetAngularVelocity: this.state.targetAngularVelocity
        });
    } // end toJSON

    unload()
    {
        physics.removeBody(this.body);

        return super.unload();
    } // end handleUnload
} // end PhysicalEntity


//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicalEntity;

//----------------------------------------------------------------------------------------------------------------------
