// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the basic_heal.js module.
//
// @module basicHeal.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var basicHealPower = require('../../../lib/entities/powers/basicHeal');

// ---------------------------------------------------------------------------------------------------------------------

describe('Basic Heal Power', function()
{
    var entity, target;

    var entityDef = {
        id: 'attacker',
        max_hitpoints: 100,
        hitpoints: 100,
        stats: {
            crit: 10,
            hit: 40,
            block: 30,
            dodge: 20
        },
        tier: 1
    };

    var targetDef = {
        id: 'target',
        max_hitpoints: 100,
        hitpoints: 100,
        stats: {
            crit: 10,
            hit: 40,
            block: 30,
            dodge: 20
        },
        tier: 1
    };

    beforeEach(function()
    {
        entity = JSON.parse(JSON.stringify(entityDef));
        target = JSON.parse(JSON.stringify(targetDef));
    });

    describe("Target", function()
    {
        it('target can be self', function(done)
        {
            entity.attack = function(){ return ['hit', 1]; };
            entity.update = function(){};

            entity.heal = function()
            {
                done();
            }; // end heal

            basicHealPower.activate({}, entity, entity);
        });

        it('targets self if no target provided', function(done)
        {
            entity.attack = function(){ return ['hit', 1]; };
            entity.update = function(){};

            entity.heal = function()
            {
                done();
            }; // end heal

            basicHealPower.activate({}, entity);
        });

        it('applies healing to the target', function(done)
        {
            entity.attack = function(){ return ['hit', 1]; };
            entity.update = function()
            {
                done();
            }; // end update


            target.heal = function(heal)
            {
                assert(heal > 0, "No healing applied");
            }; // end heal

            basicHealPower.activate({}, entity, target);
        });
    });

    describe("Cooldown", function()
    {
        it('starts a cooldown once successfully activated', function(done)
        {
            var powerState = {};

            entity.update = function()
            {
                assert(powerState.coolDownEnds, "Power state not updated.");
                assert(powerState.coolDownEnds > Date.now(), "Cooldown ends in the past.");
                done();
            }; // end update

            entity.attack = function(){ return ['hit', 1]; };
            target.heal = function(){};

            basicHealPower.activate(powerState, entity, target);
        });

        it('notifies the entity that it\'s in cooldown', function(done)
        {
            entity.update = function(field)
            {
                assert.equal(field, 'powers');
                done();
            }; // end update

            entity.attack = function(){ return ['hit', 1]; };
            target.heal = function(){};

            basicHealPower.activate({}, entity, target);
        });

        it('ignores activations while in cooldown', function(done)
        {
            var called = 0;
            var powerState = {};

            entity.update = function()
            {
                called++;

                setTimeout(function()
                {
                    assert.equal(called, 1);
                    done();
                }, 20);
            }; // end update

            entity.attack = function(){ return ['hit', 1]; };
            target.heal = function(){};

            basicHealPower.activate(powerState, entity, target);
        });
    });

    describe("Healing Calculation", function()
    {
        it('applies normal healing to self', function(done)
        {
            entity.attack = function(){ return ['hit', 1]; };
            entity.update = function()
            {
                done();
            }; // end update

            entity.heal = function(heal)
            {
                assert.equal(heal, basicHealPower.heal);
            }; // end heal

            basicHealPower.activate({}, entity, entity);
        });

        it('applies reduced healing to target', function(done)
        {
            entity.attack = function(){ return ['hit', 1]; };
            entity.update = function()
            {
                done();
            }; // end update

            target.heal = function(heal)
            {
                assert(heal < basicHealPower.heal, "Did not reduce the healing given to target");
            }; // end heal

            basicHealPower.activate({}, entity, target);
        });

        it('applies increased healing on crit', function(done)
        {
            var correctHeal = basicHealPower.heal + (basicHealPower.heal * 0.5);

            entity.attack = function(){ return ['crit', 0.5]; };
            entity.update = function()
            {
                done();
            }; // end update

            entity.heal = function(heal)
            {
                assert.equal(heal, correctHeal);
            }; // end heal

            basicHealPower.activate({}, entity, entity);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------

