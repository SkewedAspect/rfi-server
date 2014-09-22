// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the manager.js module.
//
// @module manager.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var EventEmitter = require('events').EventEmitter;

var entityManager = require('../../lib/entities/manager');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

describe('Entity Manager', function()
{
    var controller = new EventEmitter();

    var entityDef = {
        name: "Foobar",
        hitpoints: 10
    };

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

// ---------------------------------------------------------------------------------------------------------------------