//----------------------------------------------------------------------------------------------------------------------
// Physical Entity - This behavior represents anything that moves in the 3D world and/or has the ability to be
// collided with. Physical entities are simulated, and as such, we need to keep the number of them in a given scene to
// as low as possible.
//
//  TODO: Fill this module out with acutal logic!
//
// @module physical.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var BaseEntity = require('./entity');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function PhysicalEntity()
{
    BaseEntity.apply(this, arguments);

    this._buildProperties();

    logger.warn("Creating PhysicalEntity. Note: PhysicalEntity currently is only a stub.");
} // end PhysicalEntity

util.inherits(PhysicalEntity, BaseEntity);

PhysicalEntity.prototype._buildProperties = function()
{
    Object.defineProperties(this, {
        //TODO: What properties do we need?
    });
}; // end _buildProperties

PhysicalEntity.prototype.toJSON = function()
{
    var entity = BaseEntity.prototype.toJSON.call(this);
    _.assign(entity, {
        //TODO: What properties do we need?
    });

    return entity;
}; // end toJSON

//----------------------------------------------------------------------------------------------------------------------

module.exports = PhysicalEntity;

//----------------------------------------------------------------------------------------------------------------------