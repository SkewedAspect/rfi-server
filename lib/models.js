//----------------------------------------------------------------------------------------------------------------------
// Database models for the RFI:Precursors MMORPG.
//
// @module models
//----------------------------------------------------------------------------------------------------------------------

var thinky = require('thinky')({ db: 'rfi_mmorpg' });
var db = { r: thinky.r, errors: thinky.Errors };

//----------------------------------------------------------------------------------------------------------------------

db.ShipTemplate = thinky.createModel('ship_template', {
    name: String,
    behavior: String
}, { pk: 'name' });

//----------------------------------------------------------------------------------------------------------------------

db.ShipInstance = thinky.createModel('ship_instance', {
    id: String,
    template_name: String,
    registration: {
        name: String,
        serial: String
    }
});

db.ShipInstance.hasOne(db.ShipTemplate, 'template', 'template_name', 'name');

//----------------------------------------------------------------------------------------------------------------------

db.Character = thinky.createModel('character', {
    id: String,
    name: String,
    behavior: String,
    faction: { _type: String, enum: ['League', 'Terran', 'Freelance'] },
    race: { _type: String, enum: ['Human'] },
    stats: {
        hit: { _type: Number, default: 0 },
        crit: { _type: Number, default: 0 },
        block: { _type: Number, default: 0 },
        dodge: { _type: Number, default: 0 }
    },
    active_ship_id: String,
    account_id: String
});

db.Character.hasOne(db.ShipInstance, 'activeShip', 'active_ship_id', 'id');
db.Character.hasMany(db.ShipInstance, 'ships', 'id', 'id');

//----------------------------------------------------------------------------------------------------------------------

db.Account = thinky.createModel('account', {
    email: String,
    password: {
        hash: String,
        salt: String,
        iterations: Number
    }
}, { pk: 'email' });

db.Account.hasMany(db.Character, 'characters', 'email', 'account_id');

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------