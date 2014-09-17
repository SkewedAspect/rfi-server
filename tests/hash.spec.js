// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the hash.js module.
//
// @module hash.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var hash = require("../lib/hash");

// ---------------------------------------------------------------------------------------------------------------------

describe('Hash module', function()
{

    var testPass = "horse battery staple";
    var testHash;

    beforeEach(function(done)
    {
        hash.generateHash(testPass)
            .then(function(hash)
            {
                testHash = hash;
                done();
            });
    });

    it('generates hashes', function(done)
    {
        hash.generateHash(testPass)
            .then(function(hash)
            {
                done();
            });
    });

    it('generates hashes with a given number of iterations', function(done)
    {
        hash.generateHash(testPass, 10)
            .then(function(hash)
            {
                done();
            });
    });

    it('generates random passwords', function(done)
    {
        hash.generateRandomPassword()
            .then(function(pass1)
            {
                return hash.generateRandomPassword()
                    .then(function(pass2)
                    {
                        assert.notEqual(pass1, pass2);
                        done();
                    });
            })
    });

    it('verify returns true if the hash is for the correct password', function(done)
    {
        hash.verifyHash(testPass, testHash)
            .then(function(verified)
            {
                assert(verified, "testPass did not verify correctly!");
                done();
            })
    });

    it('verify returns false if the hash is for the incorrect password', function(done)
    {
        hash.verifyHash('horse battery apple', testHash)
            .then(function(verified)
            {
                assert(!verified, "False verification!");
                done();
            })
    });
});

// ---------------------------------------------------------------------------------------------------------------------