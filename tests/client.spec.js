// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the client.js module.
//
// @module client.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var EventEmitter = require('events').EventEmitter;

var RFIClient = require('../lib/client');
var models = require('../lib/models');
var hash = require('../lib/hash');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

var password = 'horse battery staple';

// Ensure that we have the database setup for our unit tests.
models.Account.get('test@test.com').run()
    .then(function()
    {
        runTests();
    })
    .catch(models.errors.DocumentNotFound, function()
    {
        hash.generateHash(password).then(function(hashObj)
        {
            var char = new models.Character({
                name: "Foobar the Magnificent",
                faction: "Freelance",
                race: "Human",
                account_id: "test@test.com"
            });

            var account = new models.Account({
                email: 'test@test.com',
                password: hashObj
            });

            char.save().then(function()
            {
                account.save().then(function()
                {
                    runTests();
                });
            });

        });
    });

// ---------------------------------------------------------------------------------------------------------------------

function runTests()
{
    describe('RFIClient', function()
    {
        var client;
        var socket;

        beforeEach(function()
        {
            socket = new EventEmitter();
            client = new RFIClient(socket);
        });

        afterEach(function()
        {
            socket.removeAllListeners();
        });

        describe('Authentication', function()
        {
            it('authenticates existing users', function(done)
            {
                socket.emit('login', {
                    account: 'test@test.com',
                    password: password
                }, function(response)
                {
                    assert(response.confirm, "Failed to authenticate account.");
                    done()
                });
            });

            it('returns a list of characters', function(done)
            {
                socket.emit('login', {
                    account: 'test@test.com',
                    password: password
                }, function(response)
                {
                    assert(response.characters.length > 0, "Failed to return characters.");
                    done()
                });
            });

            it('rejects non-existent users', function(done)
            {
                socket.emit('login', {
                    account: 'bar@not-real.com',
                    password: password
                }, function(response)
                {
                    assert(!response.confirm, "Incorrectly authenticated account.");
                    assert.equal(response.reason, 'not_found');
                    done()
                });
            });

            it('rejects bad passwords', function(done)
            {
                socket.emit('login', {
                    account: 'test@test.com',
                    password: password + '12345'
                }, function(response)
                {
                    assert(!response.confirm, "Incorrectly authenticated account.");
                    assert.equal(response.reason, 'bad_password');
                    done()
                });
            });
        });

        describe('Characters', function()
        {
            it('rejects selecting non-existent characters', function(done)
            {
                socket.emit('login', {
                    account: 'test@test.com',
                    password: password
                }, function(response)
                {
                    socket.emit('select character', {
                        character: '1234'
                    }, function(response)
                    {
                        assert(!response.confirm, "Incorrectly authenticated account.");
                        assert.equal(response.reason, 'not_found');
                        done()
                    });
                });
            });

            it('selects an existing character when authenticated', function(done)
            {
                socket.emit('login', {
                    account: 'test@test.com',
                    password: password
                }, function(response)
                {
                    socket.emit('select character', {
                        character: response.characters[0].id
                    }, function(response)
                    {
                        assert(response.confirm, "Failed to select character.");
                        done()
                    });
                });
            });
        });
    });
} // end runTests

// ---------------------------------------------------------------------------------------------------------------------