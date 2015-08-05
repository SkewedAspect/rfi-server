//----------------------------------------------------------------------------------------------------------------------
// Database models for the RFI:Precursors MMORPG.
//
// @module models
//----------------------------------------------------------------------------------------------------------------------

var config = require('../config');
var thinky = require('thinky')(config.rethinkdb);
var db = { r: thinky.r, errors: thinky.Errors };

//----------------------------------------------------------------------------------------------------------------------

db.Template = thinky.createModel('template', {
    name: String,
    type: String,
    behavior: String,
    baseState: {}
}, { pk: 'name' });

//----------------------------------------------------------------------------------------------------------------------

db.Entity = thinky.createModel('entity', {
    id: String,
    behavior: String,
    ownerID: String,
    entityManagerID: String,
    state: {},
    templateName: String
});

db.Entity.hasOne(db.Template, 'template', 'templateName', 'name');

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
    activeShipID: String,
    accountID: String
});

db.Character.hasOne(db.Entity, 'activeShip', 'activeShipID', 'id');
db.Character.hasMany(db.Entity, 'ships', 'id', 'characterID');

//----------------------------------------------------------------------------------------------------------------------

db.Configuration = thinky.createModel('config', {
    id: String,
    name: String,
    accountID: String,
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

db.Account.hasMany(db.Character, 'characters', 'email', 'accountID');
db.Account.hasMany(db.Configuration, 'configs', 'email', 'accountID');

//----------------------------------------------------------------------------------------------------------------------

module.exports = db;

//----------------------------------------------------------------------------------------------------------------------
