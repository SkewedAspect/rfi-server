// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the damageable.spec.js module.
//
// @module damageable.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var _ = require('lodash');

var mixin = require("../../../lib/entities/mixins/mixin");
var Damageable = require("../../../lib/entities/mixins/damageable");

// ---------------------------------------------------------------------------------------------------------------------

function DamageableTest()
{
    this.max_hitpoints = 100;
    this.hitpoints = 100;
    this.stats = {
        crit: 10,
        hit: 40,
        block: 5,
        dodge: 45
    };
} // end DamageableTest

mixin(DamageableTest, Damageable);

// ---------------------------------------------------------------------------------------------------------------------

describe('Damageable Mixin', function()
{
    var player, npc;

    beforeEach(function()
    {
        player = new DamageableTest();
        npc = new DamageableTest();
    });

    describe('Calculating Damage', function()
    {
        it('attacks return the type of result, and a severity', function()
        {
            var results = player.attack(npc);

            assert(_.contains(['hit', 'crit', 'block', 'dodge'], results[0]), "Returned an unknown result type.");
            assert(0 < results[1] && results[1] < 1, "Severity is not between 0 and 1.");
        });
    });

    describe('Taking Damage', function()
    {
        it('subtracts incoming damage from `hitpoints`', function()
        {
            npc.damage(10);

            assert.equal(npc.hitpoints, 90);
        });

        it('will not go below 0 on hitpoints', function()
        {
            npc.damage(1000000);

            assert.equal(npc.hitpoints, 0);
        });
    });

    describe('Healing Damage', function()
    {
        it('adds incoming damage from `hitpoints`', function()
        {
            npc.hitpoints = 80;
            npc.heal(10);

            assert.equal(npc.hitpoints, 90);
        });

        it('will not go above 0 on hitpoints', function()
        {
            npc.heal(1000000);

            assert.equal(npc.hitpoints, 100);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
