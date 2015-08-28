//----------------------------------------------------------------------------------------------------------------------
// ClientManager - Keeps track of clients and notifies them when entities are loaded/unloaded.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var RFIConnection = require('./connection');
var entityMan = require('../entities/manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class RFIConnectionManager
{
    constructor()
    {
        this.clients = {};

        //TODO: In the future, this should be a range feed on all entities in the zone
        entityMan.on('entity loaded', this._onEntityLoaded.bind(this));
        entityMan.on('entity unloaded', this._onEntityUnLoaded.bind(this));
        entityMan.on('entity updated', this._onEntityUpdated.bind(this));
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Event handlers
    //------------------------------------------------------------------------------------------------------------------

    _onEntityLoaded(entity)
    {
        logger.trace("Sending entity '%s' load to clients", entity.id);

        // Broadcast the creation to all clients
        logger.trace("this.clients:", logger.dump(this.clients));
        _.each(this.clients, (client) =>
        {
            this._sendEntity(client, entity);
        });
    } // end _onEntityLoaded

    _onEntityUnLoaded(entityID)
    {
        logger.trace("Sending entity '%s' unload to clients", entityID);

        // Broadcast the removal to all clients
        _.each(this.clients, (client) =>
        {
            //TODO: Maybe 'destroy' is a bad term here? Should the message be 'unload'?
            client.sendEvent('destroy entity', { id: entityID });
        });
    } // end _onEntityUnLoaded

    _onEntityUpdated(entity)
    {
        // Broadcast the update to all clients
        _.each(this.clients, (client) =>
        {
            client.sendEvent('update entity', entity);
        });
    } // end _onEntityUpdated

    _sendEntity(client, entity)
    {
        //TODO: Maybe 'create' is a bad term here? Should the message be 'load'?
        client.sendEvent('create entity', entity);
    } // end _sendEntity

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Creates a connection instance, given a socket connection.
     *
     * @param {Socket} socket - the Socket.IO socket connection to use for communication.
     * @returns {RFIConnection} the newly created connection class
     */
    createClient(socket)
    {
        var client = new RFIConnection(socket);

        logger.trace("New client with ID %s connected from some IP I don't care enough to find.",
            logger.dump(client.id));

        this.clients[client.id] = client;

        return client;
    } // end createClient

    /**
     * Removes a connection instance.
     *
     * @param {RFIConnection} client - the connection instance to remove.
     */
    removeClient(client)
    {
        delete this.clients[client.id];
    } // end removeClient

    sendEntities(client)
    {
        _.each(entityMan.entities, (entity) =>
        {
            this._sendEntity(client, entity);
        });
    } // end sendEntities
} // end RFIConnectionManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new RFIConnectionManager();

//----------------------------------------------------------------------------------------------------------------------
