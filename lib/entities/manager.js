//----------------------------------------------------------------------------------------------------------------------
// Entity Manager
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function EntityManager()
{
    this.entities = {};
} // end EntityManager

/**
 * Creates an entity instance, and adds it to the manager. The entity definition **must** have a `behavior` property,
 * and that **must** be the path to a requireable module. The module must be an instantiable class, which either
 * inherits from `behaviors/entity.js`, or reimplements that behavior.
 *
 * @param {object} entityDef - Defines the properties of the entity. Any attributes or functions on this object are
 *          added to the resulting entity. If this entity can be persisted, `entityDef` should have a `save` function,
 *          which returns a `Promise`.
 *
 * @param {EventEmitter} controller - This is an event emitter on which we will listen for events inside the entity. It
 *          can be player input, or ai input; as long as it emits the events the behavior cares about, everything will
 *          work just fine.
 *
 * @returns {Promise} Returns a promise that resolves if the entity was successfully added, otherwise it is rejected
 *          with an error.
 */
EntityManager.prototype.createEntity = function(entityDef, controller)
{
    //TODO: Override the behavior for testing/development purposes at the moment!
    entityDef.behavior = './behaviors/ship';

    var entity;

    try
    {
        // Attempt to get the correct behavior class
        var BehaviorClass = require(entityDef.behavior);

        // We instantiate the behavior class as the entity. This way, internally, behaviors can simply use `this` to
        // refer to the entity, as opposed to having to pass the entity into the behaviors. It's a bit more object
        // oriented, but it has the benefit of being less code and less places to make mistakes, IMHO.
        entity = new BehaviorClass(entityDef, controller);

        // Add the newly created entity to our list of entities.
        this.entities[entity.id] = entity;

        // Let the client know what the entity id is.
        return Promise.resolve(entity.id);
    }
    catch(ex)
    {
        logger.error('Failed to create entity:\n%s', logger.dump(ex.stack));

        var error = new Error("Failed to create entity.");
        error.inner = ex;

        return Promise.reject(error);
    } // end try
}; // end createEntity

/**
 * Removes an entity from the system. (Success is assumed.)
 *
 * @param {string} entityID - The id of the entity to remove.
 * @returns {Promise} Returns a promise that is always resolved. (This is useful for promise chaining, and consistency.)
 */
EntityManager.prototype.removeEntity = function(entityID)
{
    delete this.entities[entityID];

    return Promise.resolve();
}; // end removeEntity

//----------------------------------------------------------------------------------------------------------------------

module.exports = new EntityManager();

//----------------------------------------------------------------------------------------------------------------------