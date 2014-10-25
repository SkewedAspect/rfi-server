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
    behavior: String,
    turn_rate: Number,
    max_speed: {
        forward: Number,
        reverse: Number,
        left: Number,
        right: Number
    },
    hull: Number,
    stats: {
        hit: { _type: Number, default: 0 },
        crit: { _type: Number, default: 0 },
        block: { _type: Number, default: 0 },
        dodge: { _type: Number, default: 0 }
    },
    model: String
}, { pk: 'name' });

//----------------------------------------------------------------------------------------------------------------------

db.ShipInstance = thinky.createModel('ship_instance', {
    id: String,
    zone: String,
    tier: { _type: Number, default: 1 },
    hitpoints: Number,
    template_name: String,
    character_id: String,
    registration: {
        name: String,
        serial: String
    },

    // Powers are intended to be a mapping of module name to whatever state that power needs, typically a timestamp of
    // when the cooldown ends, or the number of charges left, etc.
    powers: {
        _type: Object,
        default: {}
    }
});

db.ShipInstance.hasOne(db.ShipTemplate, 'template', 'template_name', 'name');

//----------------------------------------------------------------------------------------------------------------------

db.Character = thinky.createModel('character', {
    id: String,
    name: String,
    level: { _type: Number, default: 1 },
    behavior: String,
    faction: { _type: String, enum: ['League', 'Terran', 'Freelance'] },
    race: { _type: String, enum: ['Human'] },
    stats: {
        hit: { _type: Number, default: 0 },
        crit: { _type: Number, default: 0 },
        block: { _type: Number, default: 0 },
        dodge: { _type: Number, default: 0 }
    },
    powers: {
        _type: Array,
        default: [],
        schema: Object
    },
    zone: String,
    active_ship_id: String,
    account_id: String
});

db.Character.hasOne(db.ShipInstance, 'activeShip', 'active_ship_id', 'id');
db.Character.hasMany(db.ShipInstance, 'ships', 'id', 'character_id');

//----------------------------------------------------------------------------------------------------------------------

db.Configuration = thinky.createModel('config', {
    id: String,
    name: String,
    account_id: String,
    contents: Object    // Eventually, we may want to document this schema, but it's not required atm.
});

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
db.Account.hasMany(db.Configuration, 'configs', 'email', 'account_id');

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------