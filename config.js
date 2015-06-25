// ---------------------------------------------------------------------------------------------------------------------
// A simple configuration file for the server.
//
// @module config.js
// ---------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
    DEBUG: parseBool(process.env.DEBUG, true),
    port: 8008
}; // end exports

// ---------------------------------------------------------------------------------------------------------------------

var argv = require('minimist')(process.argv.slice(2), {boolean: true});
_.merge(module.exports, _.omit(argv, '_'));

// ---------------------------------------------------------------------------------------------------------------------

function parseBool(boolString, defaultValue)
{
    switch(boolString || ''.toLowerCase())
    {
        case '0':
        case 'false':
        case 'off':
        case 'no':
            return false;
        case '':
            return defaultValue;
        default:
            return true;
    } // end switch
} // end parseBool

// ---------------------------------------------------------------------------------------------------------------------
