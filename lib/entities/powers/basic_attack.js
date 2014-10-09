//----------------------------------------------------------------------------------------------------------------------
// Basic Attack Power - Implements a basic attack power, to be used as a template for actual powers.
//
// @module basic_attack.js
//----------------------------------------------------------------------------------------------------------------------

function BasicAttackPower()
{
    this.name = "Basic Attack";
    this.cooldown = 1000;
    this.damage = 10;
} // end BasicPower

BasicAttackPower.prototype._calcDamage = function(type, severity, baseDmg)
{
    switch(type)
    {
        case 'crit':
            return baseDmg + (baseDmg * severity);

        case 'block':
            return baseDmg * severity;

        case 'hit':
            return baseDmg;

        default:
            return 0;
    } // end switch

}; // end _calcDamage

BasicAttackPower.prototype.activate = function(powerState, entity, target)
{
    // We need a target, and we can't hurt ourselves. Attempting to do so doesn't trigger the cooldown, either.
    if(target && entity !== target)
    {
        var coolDownEnds = powerState.coolDownEnds || Date.now();
        var baseDmg = this.damage * entity.tier;

        if(Date.now() >= coolDownEnds)
        {
            // Get our results from the attack
            var results = entity.attack(target);

            // Calculate damage
            var damage = this._calcDamage(results[0], results[1], baseDmg);

            // Apply damage
            if(damage)
            {
                target.damage(damage);
            } // end if

            // Reset our cooldown and update our entity
            powerState.coolDownEnds = Date.now() + this.cooldown;

            // Let the client know one of our powers is now in cooldown
            entity.update('powers');
        } // end if
    } // end if
}; // end activate

//----------------------------------------------------------------------------------------------------------------------

module.exports = new BasicAttackPower();

//----------------------------------------------------------------------------------------------------------------------