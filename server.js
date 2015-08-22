//----------------------------------------------------------------------------------------------------------------------
// Primary rfi-server module.
//
// @module server
//----------------------------------------------------------------------------------------------------------------------

require("babel/register");

GLOBAL.programDesc = 'Start the RFI: Precursors server';
var config = require('./config');
var package = require('./package');
var clientMan = require('./lib/connection/manager');
var physics = require('./lib/physics/manager');
var socketServer = require('./lib/network/socketServer');

//----------------------------------------------------------------------------------------------------------------------

var logging = require('omega-logger');
var logger = logging.loggerFor(module);

if(config.DEBUG)
{
    logging.root.handlers[0].level = config.logLevel;
    logger.info('Server starting in DEBUG mode.');
} // end if

//----------------------------------------------------------------------------------------------------------------------

var server = socketServer.listen(config.port || 8008);

server.on('connection', function(socket)
{
    var client = clientMan.createClient(socket);

    // Clean up our client connection
    socket.on('disconnect', function()
    {
        clientMan.removeClient(client);
    });
});

// Start Physics Engine
physics.start();

// We've started the application. Let's print a friendly message to tell everyone how to connect.
var ipInfo = server.httpServer.address();
logger.info("RFI:Precursors server v%s started on %s:%s.", package.version, ipInfo.address, ipInfo.port);

//----------------------------------------------------------------------------------------------------------------------
