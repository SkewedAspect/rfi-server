// ---------------------------------------------------------------------------------------------------------------------
// A mixin utility.
//
// @module mixin.js
// ---------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Applies one or more mixins to the target constructor function. There are two caveats to this function: first, if a
 * mixin has a property of the same name as the constructor's prototype, the mixin will overwrite (and the last mixin
 * will overwrite properties with the same name as earlier mixins) and secondly, it does not follow the mixin's
 * prototype chain, meaning that we will not apply inherited properties of the mixin. (Eventually, this behavior could
 * be changes to allow more complex mixins, but for now this should be sufficient.)
 *
 * @param {Function} targetConstructor - The constructor function to apply the mixin to.
 */
function mixin(targetConstructor)
{
    var mixins = _.rest(arguments);

    _.each(mixins, function(mixinConstructor)
    {
        _.forEach(Object.getOwnPropertyNames(mixinConstructor.prototype), function(key)
        {
            var desc = Object.getOwnPropertyDescriptor(mixinConstructor.prototype, key);
            Object.defineProperty(targetConstructor.prototype, key, desc);
        });
    });
} // end mixin

// ---------------------------------------------------------------------------------------------------------------------

module.exports = mixin;

// ---------------------------------------------------------------------------------------------------------------------
