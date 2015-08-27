//----------------------------------------------------------------------------------------------------------------------
/// Entity Manager
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var events = require('events');

var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');

var errors = require('../errors');
var models = require('../models');
var behaviorProxy = {};//require('./behaviors/proxy');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class EntityManager extends events.EventEmitter
{
    constructor()
    {
        super();

        this.id = uuid.v4();
        this.entities = {};

        /*
        //TODO: Implement range changefeed in place of individual point changefeeds for each entity?
        models.Entity.changes()
            .then(feed =>
            {
                feed.each(this._onEntityChanged);
            });
        */
    } // end constructor

    create(templateName, ownerID, initialState={})
    {
        var model = new models.Entity({
            templateName: templateName,
            state: initialState,
            ownerID: ownerID,
            entityManagerID: this.id
        });

        return model.save()
            .then(() =>
            {
                return this.load(model.id);
            })
            .catch(function(exc)
            {
                logger.error('Failed to create entity:\n%s', exc.stack || exc.message);

                var error = new errors.EntityCreateFailedError(templateName, ownerID, initialState);
                error.inner = exc;

                throw error;
            }); // end try
    } // end create

    load(entityID)
    {
        return models.Entity
            .get(entityID)
            .changes()
            .then(model =>
            {
                // Since .getJoin() doesn't work with .changes(), we manually select and set the template.
                return models.Template
                    .get(model.templateName)
                    .then(template =>
                    {
                        model.template = template;
                        return model;
                    });
            })
            .then(model =>
            {
                return this._build(model);
            });
    } // end load

    /**
     * Unloads an entity from this entity manager.
     *
     * Unless this is called from {@linkcode EntityManager#delete}, the entity will still exist in the world.
     *
     * @param {string} entityID - The id of the entity to remove.
     * @returns {Promise} A promise that is resolved when this entity has been unloaded.
     */
    unload(entityID)
    {
        return this.entities[entityID].unload()
            .then(() =>
            {
                delete this.entities[entityID];

                this.emit('entity unloaded', entityID);
            });
    } // end unload

    /**
     * Deletes an entity from the world.
     *
     * @param {string} entityID - The ID of the entity to remove.
     * @returns {Promise} A promise that is resolved when this entity has been deleted and unloaded.
     */
    delete(entityID)
    {
        return models.Entity.delete(entityID).run()
            .then(() =>
            {
                this.unload(entityID);
            });
    } // end delete

    /**
     * @param {models.Entity} model - A model that has been _subscribed to its point changefeed_ and has _had its
     *          template populated_.
     */
    _build(model)
    {
        // Attempt to get the correct behavior class
        var BehaviorClass = require(model.template.behavior);

        /*
        // Once we add support for multiple entity managers...
        if(model.entityManagerID != this.id)
        {
            BehaviorClass = behaviorProxy.get(BehaviorClass);
        } // end if
        */

        // We instantiate the behavior class as the entity. This way, internally, behaviors can simply use `this` to
        // refer to the entity, as opposed to having to pass the entity into the behaviors. It's a bit more object
        // oriented, but it has the benefit of being less code and less places to make mistakes, IMHO.
        var entity = new BehaviorClass(model);

        // Add the newly created entity to our list of entities.
        this.entities[entity.id] = entity;

        this.emit('entity loaded', entity);
        model.on('change', () => this.emit('entity updated', entity));

        return entity;
    } // end _build
} // end EntityManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new EntityManager();

//----------------------------------------------------------------------------------------------------------------------
