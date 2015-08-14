// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the entity.js module.
//
// @module entity.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var EventEmitter = require('events').EventEmitter;

var BaseEntity = require('../../../lib/entities/behaviors/entity');
var entityMan = require('../../../lib/entities/manager');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

describe('BaseEntity', function()
{

    var entity;
    var entityDef = {
        id: 'test-id',
        state: {
            foo: 123,
            bar: 456
        },
        template: {
            baseState: {
                bar: 123,
                baz: 123
            },
            behavior: './behaviors/entity'
        }
    };

    beforeEach(function()
    {
        entity = new BaseEntity(entityDef);
    });

    describe('Message Registration', function()
    {
        it('can register for events', function(done)
        {
            entity.registerEventHandler('test', function(args)
            {
                assert.equal(args.foo, 'bar');
                done();
            });

            entity.onEvent('test', { foo: 'bar' });
        });

        it('can register for requests', function(done)
        {
            entity.registerRequestHandler('test', function(args)
            {
                assert.equal(args.foo, 'bar');
                return Promise.resolve('worked!');
            });

            entity.onRequest('test', { foo: 'bar' }, function(resp)
            {
                assert.equal(resp, 'worked!');
                done();
            });
        });

        it('new registrations override previous registrations', function(done)
        {
            entity.registerEventHandler('test', function()
            {
                done(new Error('Did not override event handler!'));
            });

            entity.registerEventHandler('test', function()
            {
                done();
            });

            entity.onEvent('test');
        });

        it('can remove event registrations', function(done)
        {
            entity.registerEventHandler('test', function()
            {
                done(new Error('Did not remove event handler!'));
            });

            entity.removeEventHandler('test');

            entity.onEvent('test');

            // Wait, then call done.
            setTimeout(function()
            {
                done();
            }, 20);
        });

        it('can remove event registrations', function(done)
        {
            entity.registerRequestHandler('test', function()
            {
                done(new Error('Did not remove request handler!'));
            });

            entity.removeRequestHandler('test');

            entity.onRequest('test', function(){});

            // Wait, then call done.
            setTimeout(function()
            {
                done();
            }, 20);
        });
    });

    describe('.toJSON()', function()
    {
        it('returns an object with the properties `id` and `behavior`', function()
        {
            var jsonEnt = entity.toJSON();
            assert.equal(jsonEnt.id, 'test-id');
            assert.equal(jsonEnt.behavior, './behaviors/entity');
        });

        it('state correctly is a combination of the entity state and template state', function()
        {
            var jsonEnt = entity.toJSON();
            assert.equal(jsonEnt.state.foo, 123);
            assert.equal(jsonEnt.state.bar, 456);
            assert.equal(jsonEnt.state.baz, 123);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
