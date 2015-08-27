//----------------------------------------------------------------------------------------------------------------------
// Brief description for ship module.
//
// @module ship
//----------------------------------------------------------------------------------------------------------------------

var ActorEntity = require('./actor');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class ShipEntity extends ActorEntity
{
    constructor(model)
    {
        super(model);

        // Register for input events from the connection
        this.registerEventHandler('heading', this.onHeading);
        this.registerEventHandler('pitch', this.onPitch);
        this.registerEventHandler('roll', this.onRoll);
        this.registerEventHandler('throttle', this.onThrottle);
        this.registerEventHandler('all-stop', this.onAllStop);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Input Handlers
    //------------------------------------------------------------------------------------------------------------------

    onHeading(payload)
    {
        this.body.targetAngularVelocity.y = payload.value;

        this.model.save();
    } // end handleHeading

    onPitch(payload)
    {
        this.body.targetAngularVelocity.z = payload.value;

        this.model.save();
    } // end handlePitch

    onRoll(payload)
    {
        this.body.targetAngularVelocity.x = payload.value;

        this.model.save();
    } // end handleRoll

    onThrottle(payload)
    {
        this.body.targetLinearVelocity.x += payload.value;

        this.model.save();
    } // end handleThrottle

    onAllStop()
    {
        this.body.targetLinearVelocity.x = 0;
        this.body.targetLinearVelocity.y = 0;
        this.body.targetLinearVelocity.z = 0;

        this.body.targetAngularVelocity.x = 0;
        this.body.targetAngularVelocity.y = 0;
        this.body.targetAngularVelocity.z = 0;

        this.model.save();
    } // end handleAllStop
} // end ShipEntity

//----------------------------------------------------------------------------------------------------------------------

module.exports = ShipEntity;

//----------------------------------------------------------------------------------------------------------------------
