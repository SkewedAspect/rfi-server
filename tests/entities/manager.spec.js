// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the manager.js module.
//
// @module manager.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var Promise = require('bluebird');

var entityManager = require('../../lib/entities/manager');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

describe('Entity Manager', function()
{
    var controller = new EventEmitter();
    controller.event = function(){ this.emit.apply(this, arguments); };

    var entityDef = {
        template: { behavior: './behaviors/entity' },
        name: "Foobar",
        hitpoints: 10
    };

    beforeEach(function()
    {
        // Clear our entities before each test.
        entityManager.entities = {};
    });

    describe.skip('.create()', function()
    {
        it('creates entities', function()
        {
            return entityManager.create(entityDef, controller)
                .then(function(id)
                {

                    assert.notEqual(id, undefined);
                    assert(id.length > 0, "id has no length.");

                    var entity = entityManager.entities[id];

                    assert.equal(entity.name, entityDef.name);
                });
        });

        it('broadcasts the entity creation to all other entities', function(done)
        {
            var controller2 = new EventEmitter();
            controller2.event = function(){ this.emit.apply(this, arguments); };

            entityManager.create(entityDef, controller)
                .then(function()
                {
                    controller.once('create entity', function()
                    {
                        done();
                    });

                    entityManager.create(entityDef, controller2);
                });
        });

        it('sends the "inhabit entity" event with the new entity', function()
        {
            var controller2 = new EventEmitter();
            controller2.event = function(){ this.emit.apply(this, arguments); };

            var inhabitEntity;

            return entityManager.create(entityDef, controller)
                .then(function()
                {
                    controller2.once('inhabit entity', function(entity)
                    {
                        inhabitEntity = entity;
                    });

                    return entityManager.create(entityDef, controller2)
                        .then(function(id)
                        {
                            assert(inhabitEntity, 'The "inhabit entity" event was not called.');
                            assert.equal(id, inhabitEntity.id);
                        });
                });

        });

        it('does not add duplicate entities with the same id', function()
        {
            return entityManager.create(entityDef, controller)
                .then(function(id)
                {
                    var entityDef2 = {
                        id: id
                    };

                    _.assign(entityDef2, entityDef);
                    entityDef2.name = "Barfoo";

                    return entityManager.create(entityDef2, controller)
                        .then(function(id2)
                        {
                            assert.equal(entityManager.entities[id2].name, 'Foobar');
                        });
                });
        });

        it('supports savable entities', function(done)
        {
            entityDef.save = function()
            {
                done();
            }; // end save

            entityManager.createEntity(entityDef, controller)
                .then(function(id)
                {
                    var entity = entityManager.entities[id];
                    entity.save();
                });
        });
    });

    describe.skip('.unload()', function()
    {
        it('removes entities', function()
        {
            return entityManager.create(entityDef, controller)
                .then(function(id)
                {
                    var entity = entityManager.entities[id];
                    assert.equal(entity.name, entityDef.name);

                    return entityManager.unload(entity.id)
                        .then(function()
                        {
                            assert.equal(entityManager.entities[id], undefined);
                        });
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
