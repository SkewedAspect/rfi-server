// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the client.js module.
//
// @module client.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var EventEmitter = require('events').EventEmitter;

var sinon = require('sinon');
var Promise = require('bluebird');

var RFIClient = require('../lib/client');
var entityMan = require('../lib/entities/manager');
var models = require('../lib/models');
var hash = require('../lib/hash');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

var password = 'test';

describe('RFIClient', function()
{
    var client;
    var socket;
    var accountMock;
    var characterMock;
    var entManMock;
    var hashMock;
    var notfound = false;
    var char_notfound = false;

    beforeEach(function()
    {
        socket = new EventEmitter();
        client = new RFIClient(socket);

        // Mock entityMan.createEntity
        entManMock = sinon.mock(entityMan);
        entManMock.expects('createEntity');

        // Mock hash.verifyHash
        hashMock = sinon.mock(hash);
        hashMock.expects('verifyHash').returns(Promise.resolve(true));

        // Mock models.Account.get
        accountMock = sinon.mock(models.Account);
        accountMock.expects('get').returns({
            getJoin: function()
            {
                return {
                    run: function()
                    {
                        if(notfound)
                        {
                            return new Promise(function(){ throw new models.errors.DocumentNotFound() });
                        }
                        else
                        {
                            return Promise.resolve({
                                email: 'test@test.com',
                                password: {
                                    hash: "some-hash",
                                    salt: "some-salt",
                                    iterations: 10000
                                },
                                characters: [
                                    {
                                        name: "Foobar the Magnificent",
                                        faction: "Freelance",
                                        race: "Human",
                                        account_id: "test@test.com"
                                    }
                                ]
                            });
                        } // end if
                    } // end run
                };
            } // end getJoin
        });

        // Mock models.Character.get
        characterMock = sinon.mock(models.Character);
        characterMock.expects('get').returns({
            getJoin: function()
            {
                return {
                    run: function()
                    {
                        if(char_notfound)
                        {
                            return new Promise(function(){ throw new models.errors.DocumentNotFound() });
                        }
                        else
                        {
                            return Promise.resolve({
                                name: "Foobar the Magnificent",
                                faction: "Freelance",
                                race: "Human",
                                account_id: "test@test.com",
                                activeShip: {
                                    zone: 'some-zone'
                                }
                            });
                        } // end if
                    } // end run
                };
            } // end getJoin
        });
    });

    afterEach(function()
    {
        socket.removeAllListeners();
        accountMock.restore();
        characterMock.restore();
        hashMock.restore();
        entManMock.restore();

        notfound = false;
        char_notfound = false;
    });

    describe('Authentication', function()
    {
        it('authenticates existing users', function(done)
        {
            socket.emit('request', 'login', {
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
            socket.emit('request', 'login', {
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
            // We don't want to find what we're looking for.
            notfound = true;

            socket.emit('request', 'login', {
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
            hashMock.restore();
            hashMock = sinon.mock(hash);
            hashMock.expects('verifyHash').returns(Promise.resolve(false));

            socket.emit('request', 'login', {
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
            // We don't want to find what we're looking for.
            char_notfound = true;

            socket.emit('request', 'login', {
                account: 'test@test.com',
                password: password
            }, function(response)
            {
                socket.emit('request', 'select character', {
                    character: '1234'
                }, function(response)
                {
                    assert(!response.confirm, "Incorrectly selected character.");
                    assert.equal(response.reason, 'not_found');
                    done()
                });
            });
        });

        it('selects an existing character when authenticated', function(done)
        {
            socket.emit('request', 'login', {
                account: 'test@test.com',
                password: password
            }, function(response)
            {
                socket.emit('request', 'select character', {
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

// ---------------------------------------------------------------------------------------------------------------------