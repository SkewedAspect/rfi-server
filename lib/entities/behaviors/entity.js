//----------------------------------------------------------------------------------------------------------------------
/// The base `Entity` behavior class.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var ObjectProxy = require('../../ObjectProxy');

//var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

/**
 * An entity.
 */
class Entity
{
    /**
     * Create a new entity instance.
     *
     * @param {models.Entity} model - The entity's data: a model that has been _subscribed to its point changefeed_ and
     *          has _had its template populated_.
     */
    constructor(model)
    {
        // These should never be changed after instantiation; make them read-only to prevent undefined behavior if
        // someone tries to change one of them.
        Object.defineProperties(this, {
            id: { value: model.id, writable: false },
            model: { value: model, writable: false },
            template: { value: model.template, writable: false },
            state: { value: ObjectProxy(model.state, template.baseState), writable: false }
        });
    } // end constructor

    /**
     * Fired when an entity instance is unloaded from its entity manager.
     *
     * @event Entity.unloaded
     */

    /**
     * Controls how we generate our JSON representation. Returns a plain object with all properties of our model.
     *
     * @returns {object} - A simple object representation of this entity.
     */
    toJSON()
    {
        return this.model.toJSON();
    } // end if

    /**
     * Handle an incoming event from our controller. (usually either a Client or an AI)
     *
     * Override this in subclasses to implement event handling.
     * @virtual
     *
     * @param {...object} args - The parameters of the incoming event.
     */
    handleEvent(...args)
    {
        logger.error(`Unrecognized event: ${args}`);
    } // end handleEvent

    /**
     * Handle an incoming request from our controller. (usually either a Client or an AI)
     *
     * Override this in subclasses to implement request handling.
     * @virtual
     *
     * @param {...object} args - The parameters of the incoming request.
     *
     * @returns {Promise.<object>} A promise for the response to return to the controller.
     */
    handleRequest(...args)
    {
        new errors.UnrecognizedRequestError(args);
    } // end handleRequest

    /**
     * Handle entity unload.
     *
     * Called when this entity instance has been unloaded from its entity manager.
     *
     * Override this in subclasses to implement any necessary cleanup for this entity to be properly garbage collected.
     * @virtual
     *
     * @fires Entity.unloaded
     *
     * @returns {Promise} A promise for when the teardown process has finished.
     */
    handleUnload()
    {
        return Promise.resolve();
    } // end handleUnload

    /**
     * Handle an 'event' event from our controller. (usually either a Client or an AI)
     *
     * This is an **internal** function; to implement event handling in a subclass, see {@linkcode Entity#handleEvent}.
     *
     * @listens Controller.event
     *
     * @param {...object} args - The parameters of the incoming event.
     */
    onEvent(...args)
    {
        try
        {
            this.handleEvent(...args);
        }
        catch(error)
        {
            var errorMessage = error.stack || error.toString();
            logger.error(`Error processing request: ${errorMessage}`);
        } // end try
    } // end onEvent

    /**
     * Handle a 'request' event from our controller. (usually either a Client or an AI)
     *
     * This is an **internal** function; to implement request handling in a subclass, see {@linkcode Entity#handleRequest}.
     *
     * @listens Controller.request
     *
     * @param {...object} args - The parameters of the incoming request.
     * @param {function} callback - The callback to return a response to the client.
     */
    onRequest(...args)
    {
        var callback = args.pop(); // Pop the callback off the args.

        Promise.try(this.handleRequest, args)
            .then((response) => callback(null, response))
            .catch((error) => {
                var errorMessage = error.stack || error.toString();
                logger.error(`Error processing request: ${errorMessage}`);
                callback(error);
            });
    } // end onRequest
} // end Entity

//----------------------------------------------------------------------------------------------------------------------

module.exports = Entity;

//----------------------------------------------------------------------------------------------------------------------
