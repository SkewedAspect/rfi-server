// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the basic_attack.js module.
//
// @module basicAttack.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var basicAttackPower = require('../../../lib/entities/powers/basicAttack');

// ---------------------------------------------------------------------------------------------------------------------

describe('Basic Attack Power', function()
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
        it('requires a target', function()
        {
            entity.update = function()
            {
                assert(false, "Update called.");
            }; // end update

            basicAttackPower.activate({}, entity);
        });

        it('target cannot be self', function()
        {
            entity.update = function()
            {
                assert(false, "Update called.");
            }; // end update

            basicAttackPower.activate({}, entity, entity);
        });

        it('applies damage to the target', function(done)
        {
            entity.update = function()
            {
                done();
            }; // end update

            entity.attack = function()
            {
                return ['hit', 1];
            }; // end attack

            target.damage = function(damage)
            {
                assert.equal(damage, basicAttackPower.damage);
            }; // end damage

            basicAttackPower.activate({}, entity, target);
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
            target.damage = function(){};

            basicAttackPower.activate(powerState, entity, target);
        });

        it('notifies the entity that it\'s in cooldown', function(done)
        {
            entity.update = function(field)
            {
                assert.equal(field, 'powers');
                done();
            }; // end update

            entity.attack = function(){ return ['hit', 1]; };
            target.damage = function(){};

            basicAttackPower.activate({}, entity, target);
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
            target.damage = function(){};

            basicAttackPower.activate(powerState, entity, target);
        });
    });

    describe("Damage Calculation", function()
    {
        it('applies normal damage on a hit', function(done)
        {
            entity.update = function()
            {
                done();
            }; // end update

            entity.attack = function()
            {
                return ['hit', 0.1];
            }; // end attack

            target.damage = function(damage)
            {
                assert.equal(damage, basicAttackPower.damage);
            }; // end damage

            basicAttackPower.activate({}, entity, target);
        });

        it('applies extra damage on a crit', function(done)
        {
            var correctDamage = basicAttackPower.damage + (basicAttackPower.damage * 0.5);

            entity.update = function()
            {
                done();
            }; // end update

            entity.attack = function()
            {
                return ['crit', 0.5];
            }; // end attack

            target.damage = function(damage)
            {
                assert.equal(damage, correctDamage);
            }; // end damage

            basicAttackPower.activate({}, entity, target);
        });

        it('applies reduced damage on a block', function(done)
        {
            var correctDamage = basicAttackPower.damage * 0.5;

            entity.update = function()
            {
                done();
            }; // end update

            entity.attack = function()
            {
                return ['block', 0.5];
            }; // end attack

            target.damage = function(damage)
            {
                assert.equal(damage, correctDamage);
            }; // end damage

            basicAttackPower.activate({}, entity, target);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
