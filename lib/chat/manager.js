//----------------------------------------------------------------------------------------------------------------------
// This is the chat manager. It's sole job is to create and destroy chat rooms, as needed.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var Room = require('./room');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ChatManager()
{
    this.rooms = {};
} // end ChatManager

//----------------------------------------------------------------------------------------------------------------------
// Private API
//----------------------------------------------------------------------------------------------------------------------

ChatManager.prototype._handleMessage = function(client, payload, respond)
{
    var room = this.rooms[payload.room];
    room.handleMessage(payload.message, client);

    respond({ confirm: true });
}; // end _handleMessage

ChatManager.prototype._handleCommand = function(client, payload, respond)
{
    var room = this.rooms[payload.room];
    room.handleCommand(payload.message, client)
        .then(function(response)
        {
            respond(response);
        })
        .catch(function(error)
        {
            respond(error);
        });
}; // end _handleCommand

//----------------------------------------------------------------------------------------------------------------------
// Public API
//----------------------------------------------------------------------------------------------------------------------

/**
 * Listens for events on the connection's socket.
 * @param {object} client - The connection.
 */
ChatManager.prototype.bindSocket = function(client)
{
    client.socket.on('chat message', this._handleMessage.bind(this, client));
    client.socket.on('chat command', this._handleCommand.bind(this, client));
}; // end bindSocket

/**
 * Joins a chat room. If one doesn't exist for this ID, it is created.
 * @param {string} roomID - This is the unique ID of the room. It is also the socket.io namespace that the room will
 * use; this should be in the form of a path, i.e. `'/chat/room-name'`
 * @param {RFIConnection} client - The connection joining this room.
 */
ChatManager.prototype.joinRoom = function(roomID, client)
{
    var room = this.rooms[roomID];

    if(!room)
    {
        room = new Room(roomID, this);
        this.rooms[roomID] = room;
    } // end if

    return room.addClient(client);
}; // end joinRoom

/**
 * Leaves a chat room. If the connection leaving is the last member of the room, it is destroyed.
 * @param {string} roomID - This is the unique ID of the room. It should be in the form of a path, i.e. `/chat/room-name`.
 * @param {RFIConnection} client - The connection leaving the room.
 * @returns {*}
 */
ChatManager.prototype.leaveRoom = function(roomID, client)
{
    var self = this;
    var room = this.rooms[roomID];

    if(!room)
    {
        return Promise.reject(new Error("Room with id '" + roomID + "' not found."));
    } // end if

    // Remove the connection from the room
    return room.removeClient(client)
        .then(function()
        {
            client.socket.off('chat message', self._handleMessage.bind(self, client));
            client.socket.off('chat command', self._handleCommand.bind(self, client));

            if(room.clients.length == 0)
            {
                room.cleanup();
                delete self.rooms[roomID];
            } // end if
        });
}; // end leaveRoom

//----------------------------------------------------------------------------------------------------------------------

module.exports = new ChatManager();

//----------------------------------------------------------------------------------------------------------------------
