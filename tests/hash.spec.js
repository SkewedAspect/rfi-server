// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the hash.js module.
//
// @module hash.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var hash = require("../lib/hash");

var logging = require('omega-logger');

// Disable logging
logging.root.handlers = [];

// ---------------------------------------------------------------------------------------------------------------------

describe('Hash module', function()
{

    var testPass = "horse battery staple";
    var testHash;

    beforeEach(function()
    {
        return hash.generateHash(testPass)
            .then(function(testHash_)
            {
                testHash = testHash_;
            });
    });

    it('generates hashes', function()
    {
        return hash.generateHash(testPass);
    });

    it('generates hashes with a given number of iterations', function()
    {
        return hash.generateHash(testPass, 10);
    });

    it('generates random passwords', function()
    {
        return hash.generateRandomPassword()
            .then(function(pass1)
            {
                return hash.generateRandomPassword()
                    .then(function(pass2)
                    {
                        assert.notEqual(pass1, pass2);
                    });
            });
    });

    it('verify returns true if the hash is for the correct password', function()
    {
        return hash.verifyHash(testPass, testHash)
            .then(function(verified)
            {
                assert(verified, "testPass did not verify correctly!");
            });
    });

    it('verify returns false if the hash is for the incorrect password', function()
    {
        return hash.verifyHash('horse battery apple', testHash)
            .then(function(verified)
            {
                assert(!verified, "False verification!");
            });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
