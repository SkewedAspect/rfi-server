//----------------------------------------------------------------------------------------------------------------------
// Holds on to the server created by Socket.io
//
// @module socketServer.js
//----------------------------------------------------------------------------------------------------------------------

var socketio = require('socket.io');

//----------------------------------------------------------------------------------------------------------------------

function SocketServer()
{
    var self = this;

    this.connected = new Promise(function(resolve) {
        self._resolveConnected = resolve;
    });
} // end SocketServer

SocketServer.prototype.listen = function(port)
{
    this.server = socketio.listen(port);
    this._resolveConnected(this.server);
    return this.server;
}; // end listen

//----------------------------------------------------------------------------------------------------------------------

module.exports = new SocketServer();

//----------------------------------------------------------------------------------------------------------------------