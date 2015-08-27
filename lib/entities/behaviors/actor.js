//----------------------------------------------------------------------------------------------------------------------
// Actor Behavior - This represents an entity that can have/use powers, as well as have buffs/debuffs applied to it.
//
// @module actor.js
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var _ = require('lodash');

var PhysicalEntity = require('./physical');
var entityMan = require('../manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class ActorEntity extends PhysicalEntity
{
    constructor(model)
    {
        super(model);

        // We need to process our list of powers, and require the appropriate power modules
        this._buildPowers();

        // Register for Events
        this.registerEventHandler('activate power', this.onActivatePower);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Helpers
    //------------------------------------------------------------------------------------------------------------------

    _buildPowers()
    {
        this.powerModules = {};

        _.each(_.keys(this.state.powers), (key) =>
        {
            this.powerModules[key] = require('../powers/' + key);
        });
    } // end _buildPowers

    _calcAttack(defender)
    {
        // Calculate our total range
        var totalRange = this.state.stats.hit + this.state.stats.crit + defender.state.stats.dodge + defender.state.stats.block;

        // Random integer from 1 to totalRange
        var roll = Math.floor((Math.random() * totalRange) + 1);

        // Calculate the outcome, and the degree
        var result;
        if(this.state.stats.crit > roll)
        {
            result = ['crit', roll/this.state.stats.crit];
        }
        else if((this.state.stats.hit + this.state.stats.crit) > roll)
        {
            result = ['hit', (roll - this.state.stats.crit) / this.state.stats.hit];
        }
        else if ((defender.state.stats.block + this.state.stats.hit + this.state.stats.crit) > roll)
        {
            result = ['block', (roll - (this.state.stats.hit + this.state.stats.crit)) / defender.state.stats.block];
        }
        else
        {
            result = ['dodge', (roll - (this.state.stats.hit + this.state.stats.crit + defender.state.stats.block)) / defender.state.stats.dodge];
        } // end if

        return result;
    } // end calcAttack

    //------------------------------------------------------------------------------------------------------------------
    // Event Handlers
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Handles 'activate power' messages. Expects a payload of the following format:
     *
     * ```javascript
     * {
     *      power: "..."    // name of the power
     *      target: "..."   // the id of the target entity
     * }
     * ```
     *
     * @param {Object} payload - The payload of the event.
     * @private
     */
    onActivatePower(payload)
    {
        logger.debug('Activate power event:', logger.dump(payload));

        var state = this.state.powers[payload.power];
        var power = this.powerModules[payload.power];
        var target = entityMan.entities[payload.target];

        power.activate(state, this, target);
    } // end onActivatePower

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    attack(defender)
    {
        return this._calcAttack(defender);
    } // end attack

    damage(incoming)
    {
        // Simply apply the damage. Eventually, we might want to play with DR, and that could be done here.
        this.state.hitpoints = Math.max(0, this.state.hitpoints - incoming);

        // Save our model
        this.model.save();
    } // end damage

    heal(incoming)
    {
        // Simply apply the healing
        this.state.hitpoints = Math.min(this.state.maxHitpoints, this.state.hitpoints + incoming);

        // Save our model
        this.model.save();
    } // end heal

    toJSON()
    {
        var entity = super.toJSON();

        return _.assign(entity, {
            powers: this.state.powers,
            stats: this.state.stats
        });
    } // end toJSON
} // end ActorEntity

//----------------------------------------------------------------------------------------------------------------------

module.exports = ActorEntity;

//----------------------------------------------------------------------------------------------------------------------
