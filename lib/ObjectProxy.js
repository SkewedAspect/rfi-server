//----------------------------------------------------------------------------------------------------------------------
/// Object proxy.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

var errors = require('./errors');

//----------------------------------------------------------------------------------------------------------------------

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

//----------------------------------------------------------------------------------------------------------------------

module.exports = ObjectProxy;

//----------------------------------------------------------------------------------------------------------------------
