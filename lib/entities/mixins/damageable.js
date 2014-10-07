// ---------------------------------------------------------------------------------------------------------------------
// Provides the ability to both receive and deal damage.
//
// @module damageable.js
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Damagable Mixin. This mixin expects the following properties:
 *   - max_hitpoints: The maximum hitpoints this damagable is allowed to have.
 *   - hitpoints: The current hitpoints of the damagable.
 *   - stats: A object with integer properties `hit`, `crit`, `dodge`, `block`.
 *
 * @constructor
 */
function Damageable(){}

Damageable.prototype._calcAttack = function(defender)
{
    // Calculate our total range
    var totalRange = this.stats.hit + this.stats.crit + defender.stats.dodge + defender.stats.block;

    // Random integer from 1 to totalRange
    var roll = Math.floor((Math.random() * totalRange) + 1);

    // Calculate the outcome, and the degree
    var result;
    if(this.stats.crit > roll)
    {
        result = ['crit', roll/this.stats.crit];
    }
    else if((this.stats.hit + this.stats.crit) > roll)
    {
        result = ['hit', (roll - this.stats.crit) / this.stats.hit];
    }
    else if ((defender.stats.block + this.stats.hit + this.stats.crit) > roll)
    {
        result = ['block', (roll - (this.stats.hit + this.stats.crit)) / defender.stats.block];
    }
    else
    {
        result = ['dodge', (roll - (this.stats.hit + this.stats.crit + defender.stats.block)) / defender.stats.dodge];
    } // end if

    return result;
}; // end calcAttack

Damageable.prototype.attack = function(defender)
{
    var result = this._calcAttack(defender);

    //TODO: Send this to the ability system, and figure out what happens.
    //console.log(result);
}; // end attack

Damageable.prototype.damage = function(incomingDmg)
{
    // Simply apply the damage. Eventually, we might want to play with DR, and that could be done here.
    this.hitpoints = Math.max(0, this.hitpoints - incomingDmg);

    if(this.hitpoints === 0)
    {
        //TODO: We need to do something more useful than this.
        //console.log("Defender Dead!");
    } // end if
}; // end damage

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Damageable;

// ---------------------------------------------------------------------------------------------------------------------