//----------------------------------------------------------------------------------------------------------------------
/// The base `Entity` behavior class.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var Promise = require('bluebird');

var ObjectProxy = require('../../ObjectProxy');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

/**
 * The base representation for an entity; ostensibly this is the entity's behavior logic and state combined into one
 * useful object.
 *
 * This class is intended to be used primarily as a base class; other behaviors will inherit from this class in order to
 * add complexity.
 *
 * Entity interactions come in two form. Either an event/request is sent to the `onEvent`, `onRequest` handler
 * functions, or one of the functions it exposes is called directly. The event/request handlers are intended to be used
 * by 'untrusted' sources, such as clients, or AI. Functions, on the other hand, should be used by other entities.
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
        this.eventHandlers = {};
        this.requestHandlers = {};

        // These should never be changed after instantiation; make them read-only to prevent undefined behavior if
        // someone tries to change one of them.
        Object.defineProperties(this, {
            id: { value: model.id, writable: false },
            model: { value: model, writable: false },
            template: { value: model.template, writable: false },
            state: { value: ObjectProxy(model.state, template.baseState), writable: false }
        });

        // Bind all methods to this instance, so we don't have to store bound versions elsewhere when subscribing to /
        // unsubscribing from events.
        _.bindAll(this);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Registers a handler function for the given event.
     *
     * The last call to register for a particular event wins, meaning we do not follow typical event emitter semantics.
     *
     * @param {String} eventName - The name of the event to register for
     * @param {Function} handlerFunc
     */
    registerEventHandler(eventName, handlerFunc)
    {
        if(_.isFunction(handlerFunc))
        {
            this.eventHandlers[eventName] = handlerFunc;
        } // end if
    } // end registerEventHandler

    /**
     * Registers a handler function for the given request.
     *
     * The last call to register for a particular request wins, meaning we do not follow typical request emitter semantics.
     *
     * @param {String} requestName - The name of the request to register for
     * @param {Function} handlerFunc
     */
    registerRequestHandler(requestName, handlerFunc)
    {
        if(_.isFunction(handlerFunc))
        {
            this.requestHandlers[requestName] = handlerFunc;
        } // end if
    } // end registerRequestHandler

    /**
     * Removed the registered handler for a given event.
     *
     * @param {String} eventName - The name of the event to remove the handler for.
     */
    removeEventHandler(eventName)
    {
        delete this.eventHandlers[eventName];
    } // end removeEventHandler

    /**
     * Removed the registered handler for a given request.
     *
     * @param {String} requestName - The name of the request to remove the handler for.
     */
    removeRequestHandler(requestName)
    {
        delete this.requestHandlers[requestName];
    } // end removeRequestHandler

    /**
     * Controls how we generate our JSON representation. Returns a plain object with all properties of our model.
     *
     * @returns {object} - A simple object representation of this entity.
     */
    toJSON()
    {
        return this.model.toJSON();
    } // end toJSON()

    //------------------------------------------------------------------------------------------------------------------
    // Message Handling
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Handle an 'event' event from our controller (usually either a Client or an AI).
     *
     * @listens Controller.event
     *
     * @param {String} event - The name of the incoming event.
     * @param {...object} args - The parameters of the incoming event.
     */
    onEvent(event, ...args)
    {
        try
        {
            var handler = this.eventHandlers[event];
            if(_.isFunction(handler))
            {
                handler(...args);
            }
            else
            {
                logger.warn(`Unrecognized event: ${args}`);
            } // end if
        }
        catch(error)
        {
            var errorMessage = error.stack || error.toString();
            logger.error(`Error processing request: ${errorMessage}`);
        } // end try
    } // end onEvent

    /**
     * Handle a 'request' event from our controller (usually either a Client or an AI).
     *
     * @listens Controller.request
     *
     * @param {String} request - The name of the incoming request.
     * @param {...object} args - The parameters of the incoming request.
     */
    onRequest(request, ...args)
    {
        var callback = args.pop(); // Pop the callback off the args.

        var handler = this.requestHandlers[request];
        if(_.isFunction(handler))
        {
            Promise.try(handler, args)
                .then((response) => callback(null, response))
                .catch((error) => {
                    var errorMessage = error.stack || error.toString();
                    logger.error(`Error processing request: ${errorMessage}`);
                    callback({
                        confirm: false,
                        reason: error.reason || 'unknown_reason',
                        message: error.message || errorMessage || `Unknown Error: '${error}'`
                    });
                });
        }
        else
        {
            logger.error(`Unrecognized request: ${args}`);
            callback(new errors.UnrecognizedRequestError(args));
        } // end if

    } // end onRequest

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Fired when an entity instance is unloaded from its entity manager.
     *
     * @event Entity.unloaded
     */

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
    onUnload()
    {
        return Promise.resolve();
    } // end handleUnload
} // end Entity

//----------------------------------------------------------------------------------------------------------------------

module.exports = Entity;

//----------------------------------------------------------------------------------------------------------------------
