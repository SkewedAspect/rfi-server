// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the ObjectProxy.js module.
//
// @module
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");
var ObjectProxy = require('../lib/ObjectProxy');

// ---------------------------------------------------------------------------------------------------------------------

describe('ObjectProxy', function()
{
    var writable = {
        name: 'writable!',
        foo: 123,
        bar: {
            name: 'inner writable!'
        }
    };

    var defaults = {
        name: 'defaults!',
        bar: {
            type: 'test obj'
        },
        onlyInDefaults: true
    };

    var proxy;
    beforeEach(function()
    {
        proxy = new ObjectProxy(writable, defaults);
    });

    describe('Reading', function()
    {
        it('properties exclusively in writable appear', function()
        {
            assert.equal(proxy.foo, writable.foo);
        });

        it('properties exclusively in defaults appear', function()
        {
            assert.equal(proxy.onlyInDefaults, defaults.onlyInDefaults);
        });

        it('properties in writable override properties in defaults', function()
        {
            assert.equal(proxy.name, writable.name);
            assert.equal(proxy.bar, writable.bar);
        });
    });

    describe('Writing', function()
    {
        it('properties are only written to writable', function()
        {
            proxy.name = 'New Name!';
            assert.equal(proxy.name, writable.name);
            assert.notEqual(proxy.name, defaults.name);
        });

        it('new properties can be written', function()
        {
            // This is, unfortunately, required at the moment.
            proxy.$buildProp('newProp');

            proxy.newProp = 'This is a newProp property, and should be written to writable';
            assert.equal(proxy.newProp, writable.newProp);
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------