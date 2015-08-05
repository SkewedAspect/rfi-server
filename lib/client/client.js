//----------------------------------------------------------------------------------------------------------------------
// Represents a client connection.
//
// @module client
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var hash = require('../hash');
var models = require('../models');
var entityManager = require('../entities/manager');
var chatManager = require('../chat/manager');
var socketWrapper = require('../network/socket');

var SyncHandler = require('../network/sync');

//----------------------------------------------------------------------------------------------------------------------

var logger = require('omega-logger').loggerFor(module);

var loggedInAccounts = {};

//----------------------------------------------------------------------------------------------------------------------

function RFIClient(socket)
{
    this.id = socket.client.id;
    this.socket = socketWrapper.wrap(socket);

    // Setup our sync handler
    this.sync = new SyncHandler(this.socket);

    // We listen for the login message exactly once.
    this.socket.once('login', this._handleLogin.bind(this));

    // We listen for account creation exactly once. (This should deter, but not eliminate, account creation spam.)
    this.socket.once('create account', this._handleNewAccount.bind(this));

    // We listen for the disconnect message exactly once.
    socket.once('disconnect', this._handleDisconnect.bind(this));
} // end RFIClient

/**
 * Binds all messages we will definitely need for the duration of the connection
 * @type {RFIClient}
 * @private
 */
RFIClient.prototype._bindPermanentMessages = function()
{
    // Listen for character creation.
    this.socket.on('create character', this._handleNewChar.bind(this));

    // Listen for config requests
    this.socket.on('get config', this._handleConfigRequest.bind(this));

    // Save config updates
    this.socket.on('save config', this._handleSaveConfig.bind(this));

    // Join chat room
    this.socket.on('join room', this._handleJoinRoom.bind(this));

    // Leave chat room
    this.socket.on('leave room', this._handleLeaveRoom.bind(this));

    // Bind the chatManager events
    chatManager.bindSocket(this);
}; // end _bindPermanentMessages

//----------------------------------------------------------------------------------------------------------------------
// Message Handlers
//----------------------------------------------------------------------------------------------------------------------

/**
 * Handles login, and authenticates the connection. On success, returns the list of available characters.
 *
 * @param {object} payload - Expects an object with an `account` parameter, and a `password` parameter.
 * @param {function} respond - Responds to the client. Expects a single response object.
 * @private
 */
RFIClient.prototype._handleLogin = function(payload, respond)
{
    var self = this;

    if(!payload.account)
    {
        // Listen for login again.
        this.socket.once('login', this._handleLogin.bind(this));

        return respond({
            confirm: false,
            reason: 'bad_account',
            message: 'Account not specified.'
        });
    } // end if

    if(loggedInAccounts[payload.account])
    {
        return respond({
            confirm: false,
            reason: 'account_in_use',
            message: 'Account is already logged in.'
        });
    } // end if

    models.Account.get(payload.account).getJoin().run()
        .then(function(account)
        {
            // Verify the password
            hash.verifyHash(payload.password, account.password)
                .then(function(verified)
                {
                    if(verified)
                    {
                        self.account = account;

                        loggedInAccounts[payload.account] = self;

                        // Listen for character selection exactly once.
                        self.socket.once('select character', self._handleSelectChar.bind(self));

                        self._bindPermanentMessages();

                        // Respond with the list of characters
                        respond({
                            confirm: true,
                            characters: account.characters
                        });
                    }
                    else
                    {
                        logger.warn('Bad password: %s', payload.account);

                        // Listen for login again.
                        self.socket.once('login', self._handleLogin.bind(self));

                        respond({
                            confirm: false,
                            reason: 'bad_password',
                            message: 'Invalid password.'
                        });
                    } // end if
                });
        })
        .catch(models.errors.DocumentNotFound, function()
        {
            logger.warn('Account not found: %s', payload.account);

            // Listen for login again.
            self.socket.once('login', self._handleLogin.bind(self));

            respond({
                confirm: false,
                reason: 'not_found',
                message: 'Account not found.'
            });
        });
}; // end _handleLogin

/**
 * Handles selecting the character to play as.
 *
 * @param {object} payload -
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleSelectChar = function(payload, respond)
{
    var self = this;

    models.Character.get(payload.character).getJoin().run()
        .then(function(character)
        {
            self.character = character;

            // We create an entity, passing in the ship, and our socket object.
            return entityManager.createEntity(character.activeShip, self.socket)
                .tap(function(entityID)
                {
                    self.entityID = entityID;

                    // We respond to the client, telling it the zone to load.
                    respond({
                        confirm: true,
                        zone: character.activeShip.zone,
                        entityID: entityID
                        //TODO: Eventually we need to know if we should load the character, or the ship.
                    });
                })
                .catch(function(error)
                {
                    respond({
                        confirm: false,
                        reason: 'error',
                        message: error.message,
                        error: error
                    });
                });

            //========================================================================================
        })
        .catch(models.errors.DocumentNotFound, function()
        {
            logger.warn('Character not found: %s', payload.characterID);

            respond({
                confirm: false,
                reason: 'not_found',
                message: 'Character not found.'
            });
        });
}; // end _handleSelectChar

/**
 * Creates a new account.
 *
 * @param {object} payload -
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleNewAccount = function(payload, respond)
{
    //TODO: Implement!

    respond({
        confirm: false,
        reason: "not_implemented",
        message: 'Method not implemented.'
    });
}; // end _handleNewAccount

/**
 * Creates a new character.
 *
 * @param {object} payload -
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleNewChar = function(payload, respond)
{
    //TODO: Implement!

    respond({
        confirm: false,
        reason: "not_implemented",
        message: 'Method not implemented.'
    });
}; // end _handleNewChar

/**
 * Responds with this account's stored configs, if any
 *
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleConfigRequest = function (respond)
{
    respond({
        confirm: true,
        configs: this.account.configs
    });
};

RFIClient.prototype._handleSaveConfig = function(payload, respond)
{
    if(payload.id)
    {
        models.Configuration.get(payload.id)
            .then(function(config)
            {
                config.merge(payload).save()
                    .then(function(doc)
                    {
                        respond({
                            confirm: true,
                            id: doc.id
                        });
                    });
            }).catch(models.errors.DocumentNotFound, function()
            {
                respond({
                    confirm: false,
                    reason: "not_found",
                    message: "Config not found"
                });
            });
    }
    else
    {
        var newConfig = new models.Configuration(payload);
        newConfig.save()
            .then(function(saved)
            {
                respond({
                    confirm: true,
                    id: saved.id
                });
            }).catch(function(err)
            {
                respond({
                    confirm: false,
                    reason: 'save_failed',
                    message: 'Config failed to save',
                    stack: err.stack
                });
            });
    } // end if
};

/**
 * Handles joining a chat room.
 *
 * @param {object} payload -
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleJoinRoom = function(payload, respond)
{
    chatManager.joinRoom(payload.room, this)
        .then(function()
        {
            respond({ confirm: true });
        })
        .catch(function(err)
        {
            respond({
                confirm: false,
                reason: 'join_room_failed',
                message: util.format("Failed to join '%s' chatroom", payload.room),
                stack: err.stack
            });
        });
}; // end _handleJoinRoom

/**
 * Handles leaving a chat room.
 *
 * @param {object} payload -
 * @param {function} respond -
 * @private
 */
RFIClient.prototype._handleLeaveRoom = function(payload, respond)
{
    chatManager.leaveRoom(payload.room, this)
        .then(function()
        {
            respond({ confirm: true });
        })
        .catch(function(err)
        {
            respond({
                confirm: false,
                reason: 'leave_room_failed',
                message: util.format("Failed to join '%s' chatroom", payload.room),
                stack: err.stack
            });
        });
}; // end _handleLeaveRoom

/**
 * Handles client disconnection.
 *
 * @param {string} reason - The reason for the disconnection.
 * @private
 */
RFIClient.prototype._handleDisconnect = function(reason)
{
    logger.info('Client disconnected: %s', reason);

    // Remove this client's entity.
    entityManager.removeEntity(this.entityID);

    if(this.account)
    {
        // This client's account is no longer logged in.
        if(loggedInAccounts[this.account.email] !== this)
        {
            logger.warning("Client disconnected, but its account (%s) is associated with a different client!",
                logger.dump(this.account.email));
        }
        else
        {
            delete loggedInAccounts[this.account.email];
        } // end if
    } // end if
}; // end _handleDisconnect

//----------------------------------------------------------------------------------------------------------------------

module.exports = RFIClient;

//----------------------------------------------------------------------------------------------------------------------
