// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the mixin.js module.
//
// @module mixin.spec.js
// ---------------------------------------------------------------------------------------------------------------------

var assert = require("assert");

var mixin = require("../../../lib/entities/mixins/mixin");

// ---------------------------------------------------------------------------------------------------------------------

function TestMixin(){}

TestMixin.prototype = {
    get testProp()
    {
        return this._testProp;
    }
};

TestMixin.prototype.testFunc2 = function(callback)
{
    callback("TestMixin");
};

TestMixin.prototype.override = function(callback)
{
    callback("TestMixin");
};

// ---------------------------------------------------------------------------------------------------------------------

function TestClass(){}

TestClass.prototype.testFunc1 = function(callback)
{
    callback('TestClass');
};

TestClass.prototype.override = function(callback)
{
    callback('TestClass');
};

// This must come LAST for the overriding to work!
mixin(TestClass, TestMixin);

// ---------------------------------------------------------------------------------------------------------------------

describe('Mixin Utility', function()
{
    it('adds all properties of the mixin to the target class', function()
    {
        assert.equal(TestClass.prototype.testProp, TestMixin.prototype.testProp);
    });

    it('adds all functions of the mixin to the target class', function()
    {
        assert.equal(TestClass.prototype.testFunc2, TestMixin.prototype.testFunc2);
    });

    it('instances can be made from classes that have had mixins applied', function(done)
    {
        var testInst = new TestClass();

        testInst.testFunc1(function(who)
        {
            assert.equal(who, 'TestClass');

            testInst.testFunc2(function(who2)
            {
                assert.equal(who2, 'TestMixin');
                done();
            });
        });
    });

    it('mixins override properties from the target class', function(done)
    {
        var testInst = new TestClass();
        testInst.override(function(who)
        {
            assert.equal(who, 'TestMixin');
            done();
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
