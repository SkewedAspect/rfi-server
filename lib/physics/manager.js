//----------------------------------------------------------------------------------------------------------------------
// Handles wrapping up the physics engine.
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var rfiPhysics = require('rfi-physics');

var PhysicsProxy = require('./physicsProxy');

//----------------------------------------------------------------------------------------------------------------------

class PhysicsManager
{
    constructor()
    {
        this.bodies = [];
        this.engine = new rfiPhysics.PhysicsEngine();
    } // end constructor

    _loop()
    {
        //TODO: Switch to using process.hrtime
        var lastTimestamp = rfiPhysics.now();

        setInterval(() =>
        {
            var currentTimestamp = rfiPhysics.now();

            // First, we sync any changes the physical properties done outside the physics engine, i.e. teleportation.
            _.each(this.bodies, function(proxy)
            {
                proxy.syncToPhysicsBody();
            });

            // Calculate the next tick of the physics engine
            this.engine.tick(currentTimestamp - lastTimestamp);

            // Now we sync the physics state to the DB.
            _.each(this.bodies, function(proxy)
            {
                proxy.syncToModel();
            });

            lastTimestamp = rfiPhysics.now();
        }, 1000 / this.engine.simulationRate);
    } // end _loop

    addBody(model)
    {
        var proxy = new PhysicsProxy(model, this.engine.addBody({ mass: 1 }));
        this.bodies.push(proxy);

        return proxy;
    } // end addBody

    removeBody(proxy)
    {
        _.remove(this.bodies, proxy);
    } // end removeBody

    start()
    {
        this._loop();
    } // end start
} // end PhysicsManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new PhysicsManager();

//----------------------------------------------------------------------------------------------------------------------