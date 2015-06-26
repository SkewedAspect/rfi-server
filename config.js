// ---------------------------------------------------------------------------------------------------------------------
// A simple configuration file for the server.
//
// @module config.js
// ---------------------------------------------------------------------------------------------------------------------

var path = require('path');

var _ = require('lodash');

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
    DEBUG: parseBool(process.env.DEBUG, true),
    logLevel: process.env.LOG_LEVEL || 'DEBUG',

    port: 8008,

    rethinkdb: {
        host: 'localhost',
        port: 28015,
        db: 'rfi_mmorpg'
    }
}; // end exports

// ---------------------------------------------------------------------------------------------------------------------
// Parse command-line options.

var argv = require('minimist')(process.argv.slice(2), { alias: { help: 'h' }, boolean: true });

if(argv.help)
{
    var e = console.error.bind(console);
    e('');
    e('  Usage: %s [options]', path.basename(process.argv[1]));
    e('');
    e('  Initialize the database with data');
    e('');
    e('  Options:');
    e('');
    e('    -h, --help                 output usage information');
    e('');
    e('    --<config.option>=<value>  set configuration option to <value>');
    e('    --<config.option>          set configuration option to `true`');
    e('');

    // If another module has registered extra lines for the help message, display them.
    if(GLOBAL.extraHelp)
    {
        GLOBAL.extraHelp.forEach(function(extraHelpLine)
        {
            e(extraHelpLine);
        });
        e('');
    } // end if

    process.exit(1);
} // end if

_.merge(module.exports, _.omit(argv, '_'));

// ---------------------------------------------------------------------------------------------------------------------

// Parse a string as a boolean. (used to support boolean flags in environment variables)
function parseBool(boolString, defaultValue)
{
    switch((boolString || '').toLowerCase())
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
