//----------------------------------------------------------------------------------------------------------------------
// Basic Heal Power - Implements a basic healing power, to be used as a template for actual powers.
//
// @module basic_heal.js
//----------------------------------------------------------------------------------------------------------------------

function BasicHealPower()
{
    this.name = "Basic Heal";
    this.cooldown = 3000;
    this.heal = 10;
} // end BasicPower

BasicHealPower.prototype._calcHeal = function(type, severity, baseHeal)
{
    switch(type)
    {
        case 'crit':
            return baseHeal + (baseHeal * severity);

        case 'hit':
            return baseHeal;

        default:
            return 0;
    } // end switch
}; // end _calcHeal

BasicHealPower.prototype.activate = function(powerState, entity, target)
{
    var coolDownEnds = powerState.coolDownEnds || Date.now();
    var baseHeal = this.heal * entity.tier;

    // Support not passing in a target; if so we assume the entity as the target.
    target = target || entity;

    // Only heal others at 75% the rate of healing the entity.
    if(target !== entity)
    {
        baseHeal = baseHeal * .75;
    } // end if

    if(Date.now() > coolDownEnds)
    {
        // We pretend the target has no block or dodge.
        var results = entity.attack({ stats: { block: 0, dodge: 0 }});

        // Calculate the amount of healing received
        var heal = this._calcHeal(results[0], results[1], baseHeal);

        // Apply heal
        if(heal)
        {
            target.heal(heal);
        } // end if

        // Reset our cooldown and update our entity
        powerState.coolDownEnds = Date.now() + this.cooldown;

        // Let the client know one of our powers is now in cooldown
        entity.update('powers');
    } // end if
}; // end activate

//----------------------------------------------------------------------------------------------------------------------

module.exports = new BasicHealPower();

//----------------------------------------------------------------------------------------------------------------------
