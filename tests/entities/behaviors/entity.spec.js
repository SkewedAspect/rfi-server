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
        foo: 'bar',
        bleh: 'baz',
        template: {
            behavior: './behaviors/entity'
        }
    };

    var controller = new EventEmitter();
    controller.event = controller.emit.bind(controller, 'event');

    beforeEach(function()
    {
        entity = new BaseEntity(entityDef, controller);
        entityMan.createEntity(entityDef, controller);
    });

    describe('Creation', function()
    {
        it('generates an id if one was not present in the entity definition', function()
        {
            // Make sure we didn't overwrite the id when we created the entity
            assert.equal(entity.id, 'test-id');

            entity = new BaseEntity({}, controller);
            assert(entity.id !== undefined, "entity.id is undefined.");
        });

        it('renames the `save()` function if present in the entity definition', function()
        {
            assert.equal(entity.$save, undefined);

            var saveFunc = function(){};

            entity = new BaseEntity({ save: saveFunc }, controller);
            assert.equal(entity.$save, saveFunc);
        });

        it('merges properties from the entity definition with the new entity', function()
        {
            assert.equal(entity.foo, 'bar');
        });

    });

    describe('.update()', function()
    {
        it('performs a full update if no arguments were passed in', function(done)
        {
            controller.once('event', function(event, update)
            {
                assert.deepEqual(update, entity.toJSON());
                done();
            });

            entity.update();
        });

        it('performs a delta update if a filter was passed', function(done)
        {
            controller.once('event', function(event, update)
            {
                assert.deepEqual(update, { id: 'test-id', foo: 'bar' });
                done();
            });

            entity.update(['foo']);
        });

        it('supports a single string argument, instead of a list', function(done)
        {
            controller.once('event', function(event, update)
            {
                assert.deepEqual(update, { id: 'test-id', foo: 'bar' });
                done();
            });

            entity.update('foo');
        });

        it('throttles update calls to 100ms', function(done)
        {
            var start;
            var calls = 0;
            controller.on('event', function()
            {
                calls++;

                if(calls == 1)
                {
                    start = Date.now();
                }
                else if(calls == 2)
                {
                    // Allow for 10% inaccuracy in the throttling
                    assert(Date.now() > start + 90, "Throttling did not wait the full 100ms.");
                    done();
                } // end if
            });

            entity.update('foo');
            entity.update('foo');
        });

        it('combines delta updates that come in during the throttling period', function(done)
        {
            var calls = 0;
            controller.on('event', function(event, update)
            {
                calls++;

                if(calls == 2)
                {
                    assert.deepEqual(update, { id: 'test-id', foo: 'bar', bleh: 'baz' });
                    done();
                } // end if
            });

            // First call always sends immediately
            entity.update('foo');

            // Now, we test for queuing
            entity.update('foo');
            entity.update('bleh');
        });
    });

    describe('.save()', function()
    {
        it('instantly resolves if there was no `save()` in the entity definition', function(done)
        {
            assert.equal(entity.$save, undefined);

            entity.save().then(function(results)
            {
                assert.equal(results, undefined);
                done();
            });
        });

        it('calls `$save()` if there was a `save()` in the entity definition', function(done)
        {
            var saveFunc = function()
            {
                done();
            };

            entity = new BaseEntity({ save: saveFunc }, controller);
            entity.save();
        });
    });

    describe('.toJSON()', function()
    {
        it('returns an object with the properties `id` and `behavior`', function()
        {
            jsonEnt = entity.toJSON();
            assert.equal(jsonEnt.id, 'test-id');
            assert.equal(jsonEnt.behavior, './behaviors/entity');
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
