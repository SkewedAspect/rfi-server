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
    } // end constructor

    toJSON()
    {
        var entity = super.toJSON();

        _.assign(entity, {
            turnRate: this.state.turnRate,
            maxSpeed: this.state.maxSpeed,
            position: this.state.position,
            orientation: this.state.orientation,
            linearResponsiveness: this.state.linearResponsiveness,
            angularResponsiveness: this.state.angularResponsiveness,
            targetLinearVelocity: this.targetLinearVelocity,
            targetAngularVelocity: this.targetAngularVelocity
        });

        return entity;
    } // end toJSON
} // end PhysicalEntity


//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicalEntity;

//----------------------------------------------------------------------------------------------------------------------
