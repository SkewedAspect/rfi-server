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
