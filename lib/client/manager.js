//----------------------------------------------------------------------------------------------------------------------
// ClientManager
//
// @module manager.js
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var RFIClient = require('./client');

//----------------------------------------------------------------------------------------------------------------------

function RFIClientManager()
{
    this.clients = {};
} // end RFIClientManager

RFIClientManager.prototype.createClient = function(socket)
{
    var client = new RFIClient(socket);
    this.clients[client.id] = client;

    return client;
}; // end createClient

RFIClientManager.prototype.removeClient = function(client)
{
    delete this.clients[client.id];
}; // end removeClient

//----------------------------------------------------------------------------------------------------------------------

module.exports = new RFIClientManager();

//----------------------------------------------------------------------------------------------------------------------