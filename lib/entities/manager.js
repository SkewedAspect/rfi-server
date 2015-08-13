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

        /*
        //FIXME: Move this logic into the client class! (query existing entities from the EntityManager, and handle the
        // EntityManager's `created` event.

        // Send an inhabit message to the new entity's client.
        entity.controller.event('inhabit entity', entity);

        // Tell the client about all the already created entities
        _.forIn(self.entities, function(ent)
        {
            logger.debug('Checking entity: %s for entity %s', ent.id, entity.id);
            if(ent.id !== entity.id)
            {
                console.log('sending create for entity:', ent.id);
                entity.controller.event('create entity', ent);
            } // end if
        });
        */
    } // end create

    load(entityID)
    {
        return models.Entity.get(entityID).populate().changes()
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
        return this.entities[entityID].destroy()
            .then(() =>
            {
                delete this.entities[entityID];

                this.emit('unloaded', entity);
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

        if(model.entityManagerID != this.id)
        {
            BehaviorClass = behaviorProxy.get(BehaviorClass);
        } // end if

        // We instantiate the behavior class as the entity. This way, internally, behaviors can simply use `this` to
        // refer to the entity, as opposed to having to pass the entity into the behaviors. It's a bit more object
        // oriented, but it has the benefit of being less code and less places to make mistakes, IMHO.
        var entity = new BehaviorClass(model);

        // Add the newly created entity to our list of entities.
        this.entities[entity.id] = entity;

        this.emit('loaded', entity);

        return entity;
    } // end _build

    /*
    //TODO: Implement range changefeed in place of individual point changefeeds for each entity?
    _onEntityChanged(error, model)
    {
        if(!model.isSaved()) // If the model is no longer saved, this means it was deleted.
        {
            this.unload(model.getOldValue().id);
        }
        else if(model.getOldValue() === null) // If there is no old value, this means it was just created.
        {
        }
        else // The model existed already, and has changed.
        {
        } // end if
    } // end _onEntityChanged
    */
} // end EntityManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new EntityManager();

//----------------------------------------------------------------------------------------------------------------------
