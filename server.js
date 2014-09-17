//----------------------------------------------------------------------------------------------------------------------
// Primary rfi-server module.
//
// @module server
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var socketio = require('socket.io');

var package = require('./package');
var RFIClient = require('./lib/client');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

var clients = [];
var server = socketio.listen(8008);

server.on('connection', function(socket)
{
    var client = new RFIClient(socket);
    clients.push(client);

    // Clean up our client connection
    socket.on('disconnect', function()
    {
        _.remove(clients, client);
    });
});

// We've started the application. Let's print a friendly message to tell everyone how to connect.
var ipInfo = server.httpServer.address();
logger.info("RFI:Precursors server v%s started on %s:%s.", package.version, ipInfo.address, ipInfo.port);

//----------------------------------------------------------------------------------------------------------------------