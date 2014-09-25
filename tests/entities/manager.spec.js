// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the manager.js module.
//
// @module manager.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var Promise = require('bluebird');

var entityManager = require('../../lib/entities/manager');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

describe('Entity Manager', function()
{
    var controller = new EventEmitter();

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
            entityManager.createEntity(entityDef, controller).then(function(id)
            {
                controller.once('create entity', function()
                {
                    done();
                });

                entityManager.createEntity(entityDef, new EventEmitter());
            });
        });

        it('sends the "inhabit entity" event with the new entity', function(done)
        {
            var controller2 = new EventEmitter();
            var inhabitEntity;

            entityManager.createEntity(entityDef, controller).then(function(id)
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
            var ctrl2 = new EventEmitter();
            var ctrl3 = new EventEmitter();

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
            var ctrl2 = new EventEmitter();
            var ctrl3 = new EventEmitter();

            var ctrlPromise = Promise.all([
                new Promise(function(resolve){ ctrl.on('test', resolve); }),
                new Promise(function(resolve){ ctrl2.on('test', resolve); }),
                new Promise(function(resolve, reject){ ctrl3.on('test', reject); setTimeout(resolve, 10);})
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
                    // Listen for the controller promise to finish
                    ctrlPromise
                        .then(function()
                        {
                            done();
                        })
                        .catch(function(error)
                        {
                            assert(false, "Filter did not work properly!");
                            done();
                        });

                    entityManager.broadcast('test', null, [id]);
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------