//----------------------------------------------------------------------------------------------------------------------
// Represents a connection connection.
//
// @module connection
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');

var config = require('../../config');
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

class RFIConnection
{
    constructor(socket)
    {
        this.id = socket.client.id;

        // TODO: We need to not wrap this.
        this.socket = socketWrapper.wrap(socket);

        // Setup our sync handler
        this.sync = new SyncHandler(this.socket);

        // We listen for the login message exactly once.
        this.socket.once('login', this._onLogin.bind(this));

        // We listen for account creation exactly once. (This should deter, but not eliminate, account creation spam.)
        this.socket.once('create account', this._onNewAccount.bind(this));

        // We listen for the disconnect message exactly once.
        socket.once('disconnect', this._onDisconnect.bind(this));
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Binds all messages we will definitely need for the duration of the connection
     * @type {RFIConnection}
     * @private
     */
    _bindPermanentMessages()
    {
        // Listen for character creation.
        this.socket.on('create character', this._onNewChar.bind(this));

        // Listen for config requests
        this.socket.on('get config', this._onConfigRequest.bind(this));

        // Save config updates
        this.socket.on('save config', this._onSaveConfig.bind(this));

        // Join chat room
        this.socket.on('join room', this._onJoinRoom.bind(this));

        // Leave chat room
        this.socket.on('leave room', this._onLeaveRoom.bind(this));

        // Bind the chatManager events
        chatManager.bindSocket(this);
    } // end _bindPermanentMessages

    //------------------------------------------------------------------------------------------------------------------
    // Message Handlers
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Handles login, and authenticates the connection. On success, returns the list of available characters.
     *
     * @param {object} payload - Expects an object with an `account` parameter, and a `password` parameter.
     * @param {function} respond - Responds to the connection. Expects a single response object.
     * @private
     */
    _onLogin(payload, respond)
    {
        if(!payload.account)
        {
            // Listen for login again.
            this.socket.once('login', this._onLogin.bind(this));

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
            .then((account) =>
            {
                // Verify the password
                hash.verifyHash(payload.password, account.password)
                    .then((verified) =>
                    {
                        if(verified)
                        {
                            this.account = account;

                            loggedInAccounts[payload.account] = this;

                            // Listen for character selection exactly once.
                            this.socket.once('select character', this._onSelectChar.bind(this));

                            this._bindPermanentMessages();

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
                            this.socket.once('login', this._onLogin.bind(this));

                            respond({
                                confirm: false,
                                reason: 'bad_password',
                                message: 'Invalid password.'
                            });
                        } // end if
                    });
            })
            .catch(models.errors.DocumentNotFound, () =>
            {
                logger.warn('Account not found: %s', payload.account);

                // Listen for login again.
                this.socket.once('login', this._onLogin.bind(this));

                respond({
                    confirm: false,
                    reason: 'not_found',
                    message: 'Account not found.'
                });
            });
    } // end _onLogin

    /**
     * Handles selecting the character to play as.
     *
     * @param {object} payload -
     * @param {function} respond -
     * @private
     */
    _onSelectChar(payload, respond)
    {
        models.Character.get(payload.character).getJoin().run()
            .then((character) =>
            {
                this.character = character;

                // We create an entity, passing in the ship, and our socket object.
                return entityManager.load(character.activeAvatarID)
                    .tap((entity) =>
                    {
                        this.entityID = entity.id;

                        // Link the entity up to out socket.
                        this.socket.on('event', entity.onEvent);
                        this.socket.on('request', entity.onRequest);

                        // Listen for the entity's unload event
                        entity.on('unload', () =>
                        {
                            this.socket.removeListener('event', entity.onEvent);
                            this.socket.removeListener('request', entity.onRequest);
                        });

                        // Inform the connection we have inhabited the entity.
                        this.sendEvent('inhabit entity', entity);

                        // We respond to the connection, telling it the zone to load.
                        respond({
                            confirm: true,
                            zone: character.activeAvatar.zone,
                            entityID: this.entityID
                        });
                    })
                    .catch((error) =>
                    {
                        respond({
                            confirm: false,
                            reason: 'error',
                            message: error.message,
                            error: error
                        });
                    });
            })
            .catch(models.errors.DocumentNotFound, () =>
            {
                logger.warn('Character not found: %s', payload.characterID);

                respond({
                    confirm: false,
                    reason: 'not_found',
                    message: 'Character not found.'
                });
            });
    } // end _onSelectChar

    /**
     * Creates a new account.
     *
     * @param {object} payload -
     * @param {function} respond -
     * @private
     */
    _onNewAccount(payload, respond)
    {
        //TODO: Implement!

        respond({
            confirm: false,
            reason: "not_implemented",
            message: 'Method not implemented.'
        });
    } // end _onNewAccount

    /**
     * Creates a new character.
     *
     * @param {object} payload -
     * @param {function} respond -
     * @private
     */
    _onNewChar(payload, respond)
    {
        //TODO: Implement!

        respond({
            confirm: false,
            reason: "not_implemented",
            message: 'Method not implemented.'
        });
    } // end _onNewChar

    /**
     * Responds with this account's stored configs, if any
     *
     * @param {function} respond -
     * @private
     */
    _onConfigRequest(respond)
    {
        respond({
            confirm: true,
            configs: this.account.configs
        });
    } // end _onConfigRequest

    /**
     * Saves the config.
     * @param payload
     * @param respond
     * @private
     */
    _onSaveConfig(payload, respond)
    {
        if(payload.id)
        {
            models.Configuration.get(payload.id)
                .then((configDoc) =>
                {
                    configDoc.merge(payload).save()
                        .then((doc) =>
                        {
                            respond({
                                confirm: true,
                                id: doc.id
                            });
                        });
                }).catch(models.errors.DocumentNotFound, () =>
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
                .then((saved) =>
                {
                    respond({
                        confirm: true,
                        id: saved.id
                    });
                }).catch((err) =>
                {
                    respond({
                        confirm: false,
                        reason: 'save_failed',
                        message: 'Config failed to save',
                        stack: err.stack
                    });
                });
        } // end if
    } // end _onSaveConfig

    /**
     * Handles joining a chat room.
     *
     * @param {object} payload -
     * @param {function} respond -
     * @private
     */
    _onJoinRoom(payload, respond)
    {
        chatManager.joinRoom(payload.room, this)
            .then(() =>
            {
                respond({ confirm: true });
            })
            .catch((err) =>
            {
                respond({
                    confirm: false,
                    reason: 'join_room_failed',
                    message: util.format("Failed to join '%s' chatroom", payload.room),
                    stack: err.stack
                });
            });
    } // end _onJoinRoom

    /**
     * Handles leaving a chat room.
     *
     * @param {object} payload -
     * @param {function} respond -
     * @private
     */
    _onLeaveRoom(payload, respond)
    {
        chatManager.leaveRoom(payload.room, this)
            .then(() =>
            {
                respond({ confirm: true });
            })
            .catch((err) =>
            {
                respond({
                    confirm: false,
                    reason: 'leave_room_failed',
                    message: util.format("Failed to join '%s' chatroom", payload.room),
                    stack: err.stack
                });
            });
    } // end _onLeaveRoom

    /**
     * Handles connection disconnection.
     *
     * @param {string} reason - The reason for the disconnection.
     * @private
     */
    _onDisconnect(reason)
    {
        logger.info('Client disconnected: %s', reason);

        if(this.entityID)
        {
            // Remove this connection's entity.
            entityManager.unload(this.entityID);
        } // end if

        if(this.account)
        {
            // This connection's account is no longer logged in.
            if(loggedInAccounts[this.account.email] !== this)
            {
                logger.warning("Client disconnected, but its account (%s) is associated with a different connection!",
                    logger.dump(this.account.email));
            }
            else
            {
                delete loggedInAccounts[this.account.email];
            } // end if
        } // end if
    } // end _onDisconnect

    //------------------------------------------------------------------------------------------------------------------
    // Communication
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Sends an event to the connection.
     * @param {String} eventName - the name of the event to send.
     * @param {Object} payload - the payload to send to the connection.
     */
    sendEvent(eventName, payload)
    {
        if(config.DEBUG_SOCKET)
        {
            logger.debug('Outgoing event: "%s" with args:\n%s', eventName, logger.dump(payload));
        } // end if

        // Timestamp each outgoing message
        payload.timestamp = Date.now();

        //FIXME: This wrapped socket thing sucks.
        this.socket.socket.emit('event', eventName, payload);
    } // end sendEvent
} // end RFIConnection

//----------------------------------------------------------------------------------------------------------------------

module.exports = RFIConnection;

//----------------------------------------------------------------------------------------------------------------------
