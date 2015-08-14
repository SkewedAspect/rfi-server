//----------------------------------------------------------------------------------------------------------------------
// Represents a chat room.
//
// @module room.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');
var Promise = require('bluebird');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ChatRoom(roomID)
{
    this.id = roomID;
    this.clients = [];
} // end ChatRoom

ChatRoom.prototype._broadcast = function(message)
{
    _.each(this.clients, function(client)
    {
        client.socket.event('chat message', message);
    });
}; // end _broadcast

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

ChatRoom.prototype.handleMessage = function(message, client)
{
    this._broadcast({
        room: this.id,
        client: client.account.email,
        message: message
    });
}; // end _handleMessage

ChatRoom.prototype.handleCommand = function(payload)//, connection)
{
    //TODO: Implement some server commands!
    return new Promise(function(resolve, reject)
    {
        switch(payload.type)
        {
            default:
                logger.warn("Unknown command:", payload.type);
                reject({
                    confirm: false,
                    reason: 'unknown_command',
                    message: "Unknown command: '" + payload.type + "'."
                });
        } // end switch
    });
}; // end _handleCommand

ChatRoom.prototype.addClient = function(client)
{
    if(_.find(this.clients, { id: client.id }))
    {
        return Promise.reject({
            confirm: false,
            reason: 'already_in_room',
            message: util.format("Client already in room '%s'", this.id)
        });
    } // end if

    this.clients.push(client);
    return Promise.resolve();
}; // end addClient

ChatRoom.prototype.removeClient = function(client)
{
    // Remove the connection from our list of clients
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
