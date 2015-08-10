//----------------------------------------------------------------------------------------------------------------------
/// Object proxy.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var errors = require('./errors');

//----------------------------------------------------------------------------------------------------------------------

//FIXME: This requires a feature of ES6 that bable does not support:
//  https://babeljs.io/docs/learn-es2015/#proxies
/*
class ObjectProxy extends Proxy
{
    constructor(...targets)
    {
        var writableTarget = targets.shift();

        if(writableTarget)
        {
            super(writableTarget || {}, {
                get: (receiver, key) =>
                {
                    if(_.hasKey(writableTarget, key))
                    {
                        return writableTarget[key];
                    }
                    else
                    {
                        return _.find(_.map(targets, key));
                    } // end if
                }, // end get
                set: (receiver, key, value) =>
                {
                    writableTarget[key] = value;
                } // end set
            });
        }
        else
        {
            super(writableTarget || {}, {
                get: (receiver, key) =>
                {
                    return _.find(_.map(targets, key));
                }, // end get
                set: (receiver, key, value) =>
                {
                    throw new errors.ReadOnlyError(key, value);
                } // end set
            });
        } // end if
    } // end constructor
} // end ObjectProxy
*/

//FIXME: This is a hacky stand-in for the above commented out code. We are only using this until some `Proxy`
// implementation comes along.
class PseudoProxy
{
    constructor(writeableObj, defaultObj)
    {
        this._writeableObj = writeableObj;
        this._defaultObj = defaultObj;

        // Build a psuedo proxy object
        var keys = _.keys(writeableObj).concat(_.keys(defaultObj));

        _.each(keys, key =>
        {
            $buildProp(key);
        });
    } // end constructor

    $buildProp(key)
    {
        Object.defineProperty(this, key, {
            get: function(){ return this._writeableObj[key] || this._defaultObj[key]; },
            set: function(val){ this._writeableObj[key] = val; }
        });
    } // end $buildProp
} // end PseudoProxy

//----------------------------------------------------------------------------------------------------------------------

module.exports = PseudoProxy; //ObjectProxy;

//----------------------------------------------------------------------------------------------------------------------
