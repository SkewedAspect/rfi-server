// ---------------------------------------------------------------------------------------------------------------------
// Brief Description of init-db.js.
//
// @module init-db.js
// ---------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');

var hash = require('../lib/hash');
var models = require('../lib/models');

// ---------------------------------------------------------------------------------------------------------------------

function makeUser(email)
{
    var ship = new models.ShipInstance({
        zone: 'testZone',
        template_name: 'ares',
        hitpoints: 100,
        registration: {
            name: "U.S.S. Party Barge",
            serial: "OMG-8008135"
        }
    });

    var account = new models.Account({
        email: email
    });

    var char = new models.Character({
        name: "Foobar the Magnificent",
        faction: "Freelance",
        race: "Human",
        account_id: email
    });

    // Ensure that the user we're trying to create doesn't exist
    return models.Account.get(email).run()
        .then(function(account)
        {
            console.error('User "%s" already exists. Deleting...', email);
            return account.delete();
        })
        .catch(models.errors.DocumentNotFound, function()
        {
            console.log('User "%s" not found.', email);
            return Promise.resolve();
        })
        .then(function()
        {
            console.log('Creating user "%s"...', email);

            return char.save()
                .then(function() {

                    console.log('    "%s": Generating hash', email);
                    return hash.generateHash('test');
                })
                .then(function(hashObj)
                {
                    console.log('    "%s": Saving hash', email);
                    account.password = hashObj;
                    return account.save();
                })
                .then(function()
                {
                    console.log('    "%s": Saving ship', email);
                    ship.character_id = char.id;
                    return ship.save();
                })
                .then(function()
                {
                    console.log('    "%s": Saving active ship', email);
                    char.active_ship_id = ship.id;
                    return char.save();
                });
        });
}

// ---------------------------------------------------------------------------------------------------------------------

Promise.all([
    makeUser('test@test.com'),
    makeUser('test1@test.com'),
    makeUser('test2@test.com'),
    makeUser('test3@test.com'),
    makeUser('test4@test.com')
])
    .then(function()
    {
        var shipTemplate = new models.ShipTemplate({
            name: 'ares',
            behavior: './behaviors/ship',
            turn_rate: 25,
            max_speed: {
                forward: 300,
                reverse: 50,
                left: 50,
                right: 50
            },
            hull: 100,
            stats: {
                hit: 45,
                crit: 5,
                block: 15,
                dodge: 35
            },
            model: '/models/ares/ares.dae'
        });

        return models.ShipTemplate.get('ares').run()
            .catch(models.errors.DocumentNotFound, function()
            {
                console.log('Saving ship template');
                return shipTemplate.save();
            });
    })
    .then(function()
    {
        console.log('Finished. You may now log in with "test@test.com", "test1@test.com", "test2@test.com", "test3@test.com", or "test4@test.com" and the password "test".');
        process.exit();
    });

// ---------------------------------------------------------------------------------------------------------------------