//----------------------------------------------------------------------------------------------------------------------
// Represents a client connection.
//
// @module client
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var hash = require('./hash');
var models = require('./models');
var entityManager = require('./entities/manager');

var logger = require('omega-logger').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function RFIClient(socket)
{
    this.socket = socket;

    // We listen for the login message exactly once.
    this.socket.once('login', this._handleLogin.bind(this));

    // We listen for account creation exactly once. (This should deter, but not eliminate, account creation spam.)
    this.socket.once('create account', this._handleNewAccount.bind(this));
} // end RFIClient

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
            reason: 'bad_login',
            message: 'Account not specified.'
        });
    } // end if

    models.Account.get(payload.account).getJoin().run()
        .then(function(account)
        {
            self.account = account;

            // Verify the password
            hash.verifyHash(payload.password, account.password)
                .then(function(verified)
                {
                    if(verified)
                    {
                        // Listen for character selection exactly once.
                        self.socket.once('select character', self._handleSelectChar.bind(self));

                        // Listen for character creation.
                        self.socket.on('create character', self._handleNewChar.bind(self));

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

            //========================================================================================
            //TODO: This is merely for testing/development. Eventually this code should be refactored/removed!

            var shipPromise = Promise.resolve();

            if(!character.activeShip)
            {
                if(character.ships && character.ships.length)
                {
                    character.active_ship_id = character.ships[0].id;
                    shipPromise = character.save();
                }
                else
                {
                    //TODO: This should probably check for a test ship template, and if one exists, use it, otherwise
                    // create it. OTOH, I'm lazy, and this is all just test code anyway.

                    // Create a ship for us, automatically
                    var ship = new models.ShipInstance({
                        zone: 'testZone',
                        hitpoints: 100,
                        character_id: character.id,
                        registration: {
                            name: "U.S.S. Party Barge",
                            serial: "OMG-8008135"
                        }
                    });

                    shipPromise = ship.save().then(function(ship)
                    {
                        character.active_ship_id = ship.id;
                        character.activeShip = ship;

                        return character.save();
                    });
                } // end if
            } // end if

            shipPromise.then(function()
            {
                // We respond to the client, telling it the zone to load.
                respond({
                    confirm: true,
                    zone: 'testZone'    //TODO: This should be the ship or character's current zone.
                });

                // We create an entity, passing in the ship, and our socket object.
                entityManager.createEntity(character.activeShip, self.socket);
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
    var self = this;

    //TODO: Implement!
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
    var self = this;

    //TODO: Implement!
}; // end _handleNewChar

//----------------------------------------------------------------------------------------------------------------------

module.exports = RFIClient;

//----------------------------------------------------------------------------------------------------------------------