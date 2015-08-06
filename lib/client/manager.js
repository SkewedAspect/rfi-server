//----------------------------------------------------------------------------------------------------------------------
// ClientManager - Keeps track of clients and notifies them when entities are loaded/unloaded.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var RFIClient = require('./client');
var entityMan = require('../entities/manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class RFIClientManager
{
    constructor()
    {
        this.clients = {};

        //TODO: In the future, this should be a range feed on all entities in the zone
        entityMan.on('loaded', this._onEntityLoaded);
        entityMan.on('unloaded', this._onEntityUnLoaded);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    _onEntityLoaded(entity)
    {
        logger.trace("Sending entity '%s' load to clients", entity.id);

        // Broadcast the creation to all clients
        _.each(this.clients, (client) =>
        {
            //TODO: Maybe 'create' is a bad term here? Should the message be 'load'?
            client.sendEvent('create entity', entity);
        });
    } // end onEntityLoaded

    _onEntityUnLoaded(entity)
    {
        logger.trace("Sending entity '%s' unload to clients", entity.id);

        // Broadcast the removal to all clients
        _.each(this.clients, (client) =>
        {
            //TODO: Maybe 'destroy' is a bad term here? Should the message be 'unload'?
            client.sendEvent('destroy entity', { id: entity.id });
        });
    } // end onEntityUnLoaded

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Creates a client instance, given a socket connection.
     *
     * @param {Socket} socket - the Socket.IO socket connection to use for communication.
     * @returns {RFIClient} the newly created client class
     */
    createClient(socket)
    {
        var client = new RFIClient(socket);
        this.clients[client.id] = client;

        return client;
    } // end createClient

    /**
     * Removes a client instance.
     *
     * @param {RFIClient} client - the client instance to remove.
     */
    removeClient(client)
    {
        delete this.clients[client.id];
    } // end removeClient
} // end RFIClientManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new RFIClientManager();

//----------------------------------------------------------------------------------------------------------------------
