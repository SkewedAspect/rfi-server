//----------------------------------------------------------------------------------------------------------------------
// Represents a chat room.
//
// @module room.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var Promise = require('bluebird');
var socketio = require('socket.io');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ChatRoom(roomID)
{
    this.id = roomID;
    this.namespace = socketio.of(roomID);
    this.clients = [];

    this._bindEvents();
} // end ChatRoom

CharRoom.prototype._bindEvents = function()
{
    this.namespace.on('connection', function(socket)
    {
        if(!this._validateSocket(socket))
        {
            logger.error("Invalid client has attempted to connect.", logger.dump(client));
            socket.close();
        }
        else
        {
            socket.on('message', this._handleMessage.bind(this));
            socket.on('command', this._handleCommand.bind(this));
        } // end if
    });
}; // end _bindEvents

ChatRoom.prototype._validateSocket = function(socket)
{
    // We need to match up the `client` objects of the socket.io socket objects. This leads to some fun name confusion!
    return !!_.find(this.clients, { socket: { client: socket.client } });
}; // end _validateSocket

//----------------------------------------------------------------------------------------------------------------------
// Event Handlers
//----------------------------------------------------------------------------------------------------------------------

ChatRoom.prototype._handleMessage = function(payload, respond)
{
    this.namespace.sockets.emit('message', payload);
    respond({ confirm: true });
}; // end _handleMessage

ChatRoom.prototype._handleCommand = function(payload, respond)
{
    //TODO: Implement some server commands!
    switch(payload.type)
    {
        default:
            logger.warn("Unknown command:", payload.type);
            respond({
                confirm: false,
                reason: 'unknown_command',
                message: "Unknown command: '" + payload.type + "'."
            });
    } // end switch
}; // end _handleCommand

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

ChatRoom.prototype.addClient = function(client)
{
    this.clients.push(client);
    return Promise.resolve();
}; // end addClient

ChatRoom.prototype.removeClient = function(client)
{
    // Remove event listeners
    client.socket.off('message', this._handleMessage.bind(this));
    client.socket.off('message', this._handleMessage.bind(this));

    // Close our socket connection
    client.socket.close();

    // Remove the client from our list of clients
    _.remove(this.clients, client);

    // Return a resolved promise
    return Promise.resolve();
}; // end removeClient

ChatRoom.prototype.cleanup = function()
{
    var self = this;

    // Make sure we cleanup any of our still connected clients
    return Promise.resolve(this.clients)
        .each(function(client)
        {
            return self.removeClient(client);
        });
}; // end cleanup

//----------------------------------------------------------------------------------------------------------------------

module.exports = ChatRoom;

//----------------------------------------------------------------------------------------------------------------------