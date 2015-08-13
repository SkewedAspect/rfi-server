//----------------------------------------------------------------------------------------------------------------------
// Brief description for actor.js module.
//
// @module actor.spec.js
//----------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var EventEmitter = require('events').EventEmitter;

var entityMan = require('../../../lib/entities/manager');
var ActorEntity = require('../../../lib/entities/behaviors/actor');

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

//----------------------------------------------------------------------------------------------------------------------

describe("ActorEntity", function()
{
    var entity;
    var target;

    var entityDef = {
        id: 'test-id',
        powers: {
            'basic_attack': {}
        },
        template: {
            behavior: './behaviors/actor',
            "turn_rate": 10,
            "max_speed": {
                "x": 300,
                "y": 50,
                "z": 50
            },
            "linear_responsiveness": {
                "x": 10,
                "y": 10,
                "z": 10
            },
            "angular_responsiveness": {
                "x": 10,
                "y": 10,
                "z": 10
            },
            "hull": 100,
            "stats": {
                "hit": 45,
                "crit": 5,
                "block": 15,
                "dodge": 35
            },
            "model": {
                "name": "Ares",
                "file": "models/ares/ares.babylon"
            }
        }
    };

    var targetDef = {
        powers: {
            'basic_attack': {}
        },
        template: {
            behavior: './behaviors/actor',
            "turn_rate": 10,
            "max_speed": {
                "x": 300,
                "y": 50,
                "z": 50
            },
            "linear_responsiveness": {
                "x": 10,
                "y": 10,
                "z": 10
            },
            "angular_responsiveness": {
                "x": 10,
                "y": 10,
                "z": 10
            },
            "hull": 100,
            "stats": {
                "hit": 45,
                "crit": 5,
                "block": 15,
                "dodge": 35
            },
            "model": {
                "name": "Ares",
                "file": "models/ares/ares.babylon"
            }
        }
    };

    var controller = new EventEmitter();
    controller.event = controller.emit.bind(controller, 'event');

    var controller2 = new EventEmitter();
    controller2.event = controller2.emit.bind(controller2, 'event');

    beforeEach(function()
    {
        entity = new ActorEntity(entityDef, controller);
        return entityMan.createEntity(targetDef, controller2)
            .then(function(id)
            {
                target = entityMan.entities[id];
            });
    });

    afterEach(function()
    {
        controller.removeAllListeners();
        controller2.removeAllListeners();
    });

    describe.skip("Powers", function()
    {
        it("creates a list of power modules", function()
        {
            assert(entity.powerModules.basic_attack !== undefined, "Failed to import basic attack power");
        });

        it("correctly activates powers", function(done)
        {
            entity.powerModules.basic_attack = {
                activate: function(state, ent)
                {
                    assert.equal(state, entity.powers.basic_attack);
                    assert.equal(ent.id, entity.id);
                    done();
                }
            };

            controller.emit('activate power', { power: 'basic_attack' });
        });

        it("supports activating powers with targets", function(done)
        {
            entity.powerModules.basic_attack = {
                activate: function(state, ent, tgt)
                {
                    assert.equal(state, entity.powers.basic_attack);
                    assert.equal(ent.id, entity.id);
                    assert.equal(tgt.id, target.id);
                    done();
                }
            };

            controller.emit('activate power', { power: 'basic_attack', target: target.id });
        });
    });
});

//----------------------------------------------------------------------------------------------------------------------
