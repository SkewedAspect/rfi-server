// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of init-db.js.
//
// @module init-db.js
// ---------------------------------------------------------------------------------------------------------------------

var hash = require('../lib/hash');
var models = require('../lib/models');

// ---------------------------------------------------------------------------------------------------------------------

var ship = new models.ShipInstance({
    zone: 'testZone',
    hitpoints: 100,
    registration: {
        name: "U.S.S. Party Barge",
        serial: "OMG-8008135"
    }
});

var account = new models.Account({
    email: 'test@test.com'
});

var char = new models.Character({
    name: "Foobar the Magnificent",
    faction: "Freelance",
    race: "Human",
    account_id: "test@test.com"
});

// Ensure that we have the database setup for our unit tests.
models.Account.get('test@test.com').run()
    .then(function()
    {
        console.error('The database is not empty. Exiting...');
        process.exit();
    })
    .catch(models.errors.DocumentNotFound, function()
    {
        char.save()
            .then(function() {

                return hash.generateHash('test');
            })
            .then(function(hashObj)
            {
                account.password = hashObj;
                return account.save();
            })
            .then(function()
            {
                ship.character_id = char.id;
                return ship.save();
            })
            .then(function()
            {
                console.log('Finished. You may now log in with "test@test.com", with the password "test".');
                process.exit();
            });

    });

// ---------------------------------------------------------------------------------------------------------------------