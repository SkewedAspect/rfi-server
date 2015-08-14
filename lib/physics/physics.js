//----------------------------------------------------------------------------------------------------------------------
// Handles wrapping up the physics engine.
//
// @module physics.js
//----------------------------------------------------------------------------------------------------------------------

var rfiPhysics = require('rfi-physics');

//----------------------------------------------------------------------------------------------------------------------

class PhysicsManager
{
    constructor()
    {
        this.engine = new rfiPhysics.PhysicsEngine();
    } // end constructor

    _loop()
    {
        //TODO: Switch to using process.hrtime
        var lastTimestamp = now();

        setInterval(function()
        {
            var currentTimestamp = now();
            this.engine.tick(currentTimestamp - lastTimestamp);

            //TODO: Sync physical state to DB.

            lastTimestamp = now();
        }, 1000 / this.engine.simulationRate);
    } // end _loop

    addBody(initialState)
    {
        //TODO: Create a new physics proxy, and return it!
    } // end addBody

    start()
    {
        this._loop();
    } // end start
} // end PhysicsManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new PhysicsManager();

//----------------------------------------------------------------------------------------------------------------------