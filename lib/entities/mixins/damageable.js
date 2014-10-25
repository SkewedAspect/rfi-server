// ---------------------------------------------------------------------------------------------------------------------
// Provides the ability to both receive and deal damage.
//
// @module damageable.js
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Damageable Mixin. This mixin expects the following properties:
 *   - max_hitpoints: The maximum hit points this damageable is allowed to have.
 *   - hitpoints: The current hit points of the damageable.
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
    return this._calcAttack(defender);
}; // end attack

Damageable.prototype.damage = function(incoming)
{
    // Simply apply the damage. Eventually, we might want to play with DR, and that could be done here.
    this.hitpoints = Math.max(0, this.hitpoints - incoming);

    // Update, if needed
    if(this.update)
    {
        this.update();
    } // end if
}; // end damage

Damageable.prototype.heal = function(incoming)
{
    // Simply apply the healing
    this.hitpoints = Math.min(this.max_hitpoints, this.hitpoints + incoming);

    // Update, if available
    if(this.update)
    {
        this.update('hitpoints');
    } // end if
}; // end heal

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Damageable;

// ---------------------------------------------------------------------------------------------------------------------