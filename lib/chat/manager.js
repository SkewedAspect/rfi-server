//----------------------------------------------------------------------------------------------------------------------
// This is the chat manager. It's sole job is to create and destroy chat rooms, as needed.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var Promise = require('bluebird');

var Room = require('./room');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function ChatManager()
{
    this.rooms = {};
} // end ChatManager

/**
 * Joins a chat room. If one doesn't exist for this ID, it is created.
 * @param {string} roomID - This is the unique ID of the room. It is also the socket.io namespace that the room will
 * use; this should be in the form of a path, i.e. `'/chat/room-name'`
 * @param {RFIClient} client - The client joining this room.
 */
ChatManager.prototype.joinRoom = function(roomID, client)
{
    var room = this.rooms[roomID];

    if(!room)
    {
        room = new Room(roomID);
        this.rooms[roomID] = room;
    } // end if

    return room.addClient(client);
}; // end joinRoom

/**
 * Leaves a chat room. If the client leaving is the last member of the room, it is destroyed.
 * @param {string} roomID - This is the unique ID of the room. It should be in the form of a path, i.e. `/chat/room-name`.
 * @param {RFIClient} client - The client leaving the room.
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

    // Remove the client from the room
    return room.removeClient(client)
        .then(function()
        {
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