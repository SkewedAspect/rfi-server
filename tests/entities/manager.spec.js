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

    describe('.createEntity()', function()
    {
        it('creates entities', function(done)
        {
            entityManager.createEntity(entityDef, controller).then(function(id)
            {

                assert.notEqual(id, undefined);
                assert(id.length > 0, "id has no length.");

                var entity = entityManager.entities[id];

                assert.equal(entity.name, entityDef.name);
                done();
            });
        });

        it('broadcasts the entity creation to all other entities', function(done)
        {
            var controller2 = new EventEmitter();
            controller2.event = function(){ this.emit.apply(this, arguments); };

            entityManager.createEntity(entityDef, controller).then(function()
            {
                controller.once('create entity', function()
                {
                    done();
                });

                entityManager.createEntity(entityDef, controller2);
            });
        });

        it('sends the "inhabit entity" event with the new entity', function(done)
        {
            var controller2 = new EventEmitter();
            controller2.event = function(){ this.emit.apply(this, arguments); };

            var inhabitEntity;

            entityManager.createEntity(entityDef, controller).then(function()
            {
                controller2.once('inhabit entity', function(entity)
                {
                    inhabitEntity = entity;
                });

                entityManager.createEntity(entityDef, controller2).then(function(id)
                {
                    assert(inhabitEntity, 'The "inhabit entity" event was not called.');
                    assert.equal(id, inhabitEntity.id);
                    done();
                });
            });

        });

        it('does not add duplicate entities with the same id', function(done)
        {
            entityManager.createEntity(entityDef, controller).then(function(id)
            {
                var entityDef2 = {
                    id: id
                };

                _.assign(entityDef2, entityDef);
                entityDef2.name = "Barfoo";

                entityManager.createEntity(entityDef2, controller).then(function(id2)
                {
                    assert.equal(entityManager.entities[id2].name, 'Foobar');
                    done();
                });
            });
        });

        it('supports savable entities', function(done)
        {
            entityDef.save = function()
            {
                done();
            }; // end save

            entityManager.createEntity(entityDef, controller).then(function(id)
            {
                var entity = entityManager.entities[id];
                entity.save();
            });
        });
    });

    describe('.removeEntity()', function()
    {
        it('removes entities', function(done)
        {
            entityManager.createEntity(entityDef, controller).then(function(id)
            {
                var entity = entityManager.entities[id];
                assert.equal(entity.name, entityDef.name);

                entityManager.removeEntity(entity.id).then(function()
                {
                    assert.equal(entityManager.entities[id], undefined);
                    done();
                });
            });
        });
    });

    describe('.broadcast()', function()
    {
        it('sends the message to all entities', function(done)
        {
            var ctrl = new EventEmitter();
            ctrl.event = function(){ this.emit.apply(this, arguments); };

            var ctrl2 = new EventEmitter();
            ctrl2.event = function(){ this.emit.apply(this, arguments); };

            var ctrl3 = new EventEmitter();
            ctrl3.event = function(){ this.emit.apply(this, arguments); };

            var ctrlPromise = Promise.all([
                new Promise(function(resolve){ ctrl.on('test', resolve); }),
                new Promise(function(resolve){ ctrl2.on('test', resolve); }),
                new Promise(function(resolve){ ctrl3.on('test', resolve); })
            ]);

            entityManager.createEntity(entityDef, ctrl)
                .then(function()
                {
                    return entityManager.createEntity(entityDef, ctrl2);
                })
                .then(function()
                {
                    return entityManager.createEntity(entityDef, ctrl3);
                })
                .then(function()
                {
                    // Listen for the controller promise to finish
                    ctrlPromise.then(function()
                    {
                        done();
                    });

                    entityManager.broadcast('test');
                });
        });

        it('supports filtering by entity id', function(done)
        {
            var ctrl = new EventEmitter();
            ctrl.event = function(){ this.emit.apply(this, arguments); };

            var ctrl2 = new EventEmitter();
            ctrl2.event = function(){ this.emit.apply(this, arguments); };

            var ctrl3 = new EventEmitter();
            ctrl3.event = function(){ this.emit.apply(this, arguments); };

            var ctrlPromise = Promise.all([
                new Promise(function(resolve){ ctrl.on('test', resolve); }),
                new Promise(function(resolve){ ctrl2.on('test', resolve); }),
                new Promise(function(resolve, reject){ ctrl3.on('test', reject); setTimeout(resolve, 10); })
            ]);

            entityManager.createEntity(entityDef, ctrl)
                .then(function()
                {
                    return entityManager.createEntity(entityDef, ctrl2);
                })
                .then(function()
                {
                    return entityManager.createEntity(entityDef, ctrl3);
                })
                .then(function(id)
                {
                    entityManager.broadcast('test', null, [id]);

                    // Listen for the controller promise to finish
                    return ctrlPromise;
                })
                .then(function()
                {
                    done();
                })
                .catch(function(error)
                {
                    done(error);
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
