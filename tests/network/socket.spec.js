// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of socket.spec.js.
//
// @module socket.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var socketWrapper = require('../../lib/network/socket');

// ---------------------------------------------------------------------------------------------------------------------

describe("Wrapper Socket", function()
{
    var socket;

    beforeEach(function()
    {
        socket = socketWrapper.wrap(new EventEmitter());
    });

    it("forwards events", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('test', function(innerArg)
        {
            assert.deepEqual(innerArg, arg);
            done();
        });

        socket.socket.emit('event', 'test', arg);
    });

    it("forwards for requests", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('test', function(innerArg)
        {
            assert.deepEqual(innerArg, arg);
            done();
        });

        socket.socket.emit('request', 'test', arg);
    });

    it("fires 'incoming' event for events", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('incoming', function(event)
        {
            assert.equal(event.type, 'event');
            assert.equal(event.args[0], 'test');
            assert.equal(event.args[1], arg);
            done();
        });

        socket.socket.emit('event', 'test', arg);
    });

    it("fires 'incoming' event for requests", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('incoming', function(event)
        {
            assert.equal(event.type, 'request');
            assert.equal(event.args[0], 'test');
            assert.equal(event.args[1], arg);
            done();
        });

        socket.socket.emit('request', 'test', arg);
    });

    it("allows responding to requests", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('test request', function(innerArg, reply)
        {
            assert.deepEqual(innerArg, arg);

            reply({
                confirm: true
            });
        });

        socket.socket.emit('request', 'test request', arg, function(replyArgs)
        {
            assert.equal(replyArgs.confirm, true);
            done();
        });
    });

    it("allows sending of events", function(done)
    {
        var arg = { foo: "bar" };
        socket.socket.on('event', function(eventName, innerArg)
        {
            assert.equal(eventName, 'test event');
            assert.deepEqual(innerArg, arg);

            done();
        });

        socket.event('test event', arg);
    });

    it("fires the 'outgoing' event for sent events", function(done)
    {
        var arg = { foo: "bar" };
        socket.on('outgoing', function(event)
        {
            assert.equal(event.type, 'event');
            assert.equal(event.args[0], 'test');
            assert.equal(event.args[1], arg);
            done();
        });

        socket.event('test', arg);
    });
});

// ---------------------------------------------------------------------------------------------------------------------