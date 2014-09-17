//----------------------------------------------------------------------------------------------------------------------
// A module for performing password hashing and verification.
//
// @module hash.js
//----------------------------------------------------------------------------------------------------------------------

var Promise = require('bluebird');
var crypto = Promise.promisifyAll(require('crypto'));

//----------------------------------------------------------------------------------------------------------------------

// Generates a random 8 character password (base64 encoded).
function randomPass()
{
    return crypto.randomBytesAsync(6)
        .then(function(buffer)
        {
            return buffer.toString('base64');
        });
} // end randomPass

// Generates a password using PBKDF2 and sha256, using a random, 64byte salt.
// Returns an object with `hash`, `iterations`, and `salt`. Both `hash` and `salt` are base64 encoded.
function generate(plaintext, iterations)
{
    iterations = iterations || 10000;

    return crypto.randomBytesAsync(64)
        .then(function(salt)
        {
            return crypto.pbkdf2Async(plaintext, salt, iterations, 512)
                .then(function(passHash)
                {
                    return {
                        hash: passHash.toString('base64'),
                        iterations: iterations,
                        salt: salt
                    };
                });
        });
} // end generate

// Verify that a plaintext password matches up with the previously generated hash.
// Returns true if they match, otherwise false.
function verify(plaintext, passOpts)
{
    passOpts.iterations = passOpts.iterations || 10000;

    if(!passOpts.hash)
    {
        return Promise.reject(new Error("Options object missing required property `hash`."));
    } // end if

    if(!passOpts.salt)
    {
        return Promise.reject(new Error("Options object missing required property `salt`."));
    } // end if

    return crypto.pbkdf2Async(plaintext, passOpts.salt, passOpts.iterations, 512)
        .then(function(passHash)
        {
            passHash = passHash.toString('base64');

            // We return true if they match, other wise false.
            return passHash == passOpts.hash;
        });
} // end verify

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    generateRandomPassword: randomPass,
    generateHash: generate,
    verifyHash: verify
}; // end exports

//----------------------------------------------------------------------------------------------------------------------