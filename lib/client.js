//----------------------------------------------------------------------------------------------------------------------
// Represents a client connection.
//
// @module client
//----------------------------------------------------------------------------------------------------------------------

var hash = require('./hash');
var models = require('./models');

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

RFIClient.prototype._handleLogin = function(payload, respond)
{
    var self = this;
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

            respond({
                confirm: false,
                reason: 'not_found',
                message: 'Account not found.'
            });
        });
}; // end _handleLogin

RFIClient.prototype._handleSelectChar = function(payload, respond)
{
    var self = this;
    models.Character.get(payload.characterID).getJoin().run()
        .then(function(character)
        {
            self.character = character;

            //TODO: As the error says, "Now what?"
            logger.error('Selected character: %s on account %s. Now what?', character.name, self.account.email);
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

RFIClient.prototype._handleNewAccount = function(payload, respond)
{
    var self = this;

    //TODO: Implement!
}; // end _handleNewAccount

RFIClient.prototype._handleNewChar = function(payload, respond)
{
    var self = this;

    //TODO: Implement!
}; // end _handleNewChar

//----------------------------------------------------------------------------------------------------------------------

module.exports = RFIClient;

//----------------------------------------------------------------------------------------------------------------------