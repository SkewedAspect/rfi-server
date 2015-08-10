//----------------------------------------------------------------------------------------------------------------------
/// Custom Error classes for playing catch with ourselves.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var BaseError = require('make-error').BaseError;

//----------------------------------------------------------------------------------------------------------------------

class NotImplementedError extends BaseError
{
    constructor(functionName)
    {
        super(`'${functionName}' is not implemented.`);
    } // end constructor
} // end NotImplementedError

class ReadOnlyError extends BaseError
{
    constructor(key, value)
    {
        super(`Can't set key '${key}' to value '${value}'! Object is read-only.`);
    } // end constructor
} // end ReadOnlyError

class UnrecognizedRequestError extends BaseError
{
    constructor(args)
    {
        super(`Unrecognized request: ${args}`);

        this.reason = 'unrecognized_request';
    } // end constructor

    toJSON()
    {
        // Serialize as a valid response for the client
        return {
            confirm: false,
            reason: this.reason,
            message: this.message
        };
    } // end toJSON
} // end UnrecognizedRequestError

class EntityCreateFailedError extends BaseError
{
    constructor(templateName, ownerID, initialState)
    {
        var initialStateJSON = JSON.stringify(initialState);
        super(`Failed to create '${templateName}' entity for owner ${ownerID} with initial state: ${initialStateJSON}`);

        _.assign(this, { templateName, ownerID, initialState });
    } // end constructor
} // end EntityCreateFailedError

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    NotImplementedError,
    ReadOnlyError,
    UnrecognizedRequestError,
    EntityCreateFailedError
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
