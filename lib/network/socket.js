// ---------------------------------------------------------------------------------------------------------------------
// A wrapper around the Socket.io socket object. It handles the fact that over the wire we are sending 'event' and
// 'request' events, and instead translates them into proper events. The reason we do this is because we need to listen
// to every socket.io event, and there is no API for doing that. By abstracting the socket like this, it allows us to
// define our own API for socket usage, as well as allowing us in the future to back the socket communication by
// something like Redis, for sharding purposes.
//
// @module socket.js
// ---------------------------------------------------------------------------------------------------------------------

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var config = require('../../config');

var logger = require('omega-logger').loggerFor(module);

// ---------------------------------------------------------------------------------------------------------------------

function WrapperSocket(socket)
{
    EventEmitter.call(this);
    this.socket = socket;

    this.socket.on('event', this._handleEvent.bind(this));
    this.socket.on('request', this._handleRequest.bind(this));
} // end WrapperSocket

util.inherits(WrapperSocket, EventEmitter);

WrapperSocket.prototype.event = function()
{
    var args = Array.prototype.slice.apply(arguments);

    if(config.DEBUG)
    {
        logger.debug('Outgoing event: "%s" with args:\n%s', args[0], logger.dump(args.slice(1)));
    } // end if

    // Fire a special 'outgoing' event.
    this.emit('outgoing', { type: 'event', args: args });

    args.unshift('event');

    this.socket.emit.apply(this.socket, args);
}; // end event

WrapperSocket.prototype._handleEvent = function()
{
    var args = Array.prototype.slice.apply(arguments);

    if(config.DEBUG)
    {
        logger.debug('Incoming event: "%s" with args:\n%s', args[0], logger.dump(args.slice(1)));
    } // end if

    // Fire a special 'incoming' event.
    this.emit('incoming', { type: 'event', args: args });

    // Emit the event
    this.emit.apply(this, arguments);
}; // end _handleEvent

WrapperSocket.prototype._handleRequest = function()
{
    var args = Array.prototype.slice.apply(arguments);

    if(config.DEBUG)
    {
        logger.debug('Incoming event: "%s" with args:\n%s', args[0], logger.dump(args.slice(1)));
    } // end if

    // Fire a special 'incoming' event.
    this.emit('incoming', { type: 'request', args: args });

    // Emit the event
    this.emit.apply(this, arguments);
}; // end _handleRequest

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
    wrap: function(socket)
    {
        return new WrapperSocket(socket);
    }
}; // end exports

// ---------------------------------------------------------------------------------------------------------------------