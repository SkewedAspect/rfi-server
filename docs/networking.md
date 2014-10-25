# Networking Design

Currently, we are using [Socket.io](http://socket.io/) as our network transport. It's easier than doing things with raw
WebSockets, and it's battle-tested enough that we should be able to get reasonably far with it before needing to 
optimize communication.

That being said, we've opted for a Promise-based API, which abstracts communication into two types of messages:

* Events - 'fire and forget', these messages are considered one directional, with no clear response.
* Requests - 'request and response', these messages are bidirectional, and always must have a response.

Events are fired by the `event()` function, while requests are fired by the `request()` function. (For more details on
the specific API, check the API docs for the `WrapperSocket` class.

## Responses

All `Request` messages are expected to have a response which contains a `confirm` key, which must be a Boolean. All 
other keys are going to be `Request` specific.

## Communication Protocol

What follows is a list of messages sent between the client and the server, what the payload is, and what the response, 
if any, should contain. This is the _only_ contract between the client and server.

### Client -> Server

#### Request: `login`

Logs in to the server, authenticating with the given account/password.

##### Payload

```javascript
{
    account: "...",         // Account to log in to
    password: "..."         // Password for account
}
```

##### Response

```javascript
{
    confirm: true | false,  // If true, the request succeeded, otherwise it failed for the reason specified.
    reason: '...',          // A short description of the reason, machine-usable. (Only if `confirm: false`.)
    message: '...'          // A short description of the reason, human-readable. (Only if `confirm: false`.)
    characters: [{ ... }]   // A list of character objects associated with the account. (Only if `confirm: true`.)
}
```

#### Request: `select character`

Selects a character to play as. Should be the id from one of the character objects we were passed in the login 
confirmation.

##### Payload

```javascript
{
    character: "..."      // The id of the character to play as.
}
```

##### Response

```javascript
{
    confirm: true | false,  // If true, the request succeeded, otherwise it failed for the reason specified.
    reason: '...',          // A short description of the reason, machine-usable. (Only if `confirm: false`.)
    message: '...'          // A short description of the reason, human-readable. (Only if `confirm: false`.)
}
```

#### Request: `get config`

Gets the configs for the current logged in account. If there is no configs currently saved for an account, an empty list
may be returned.

##### Payload

None: No payload should be sent.

##### Response

```javascript
{
    confirm: true | false,  // If true, the request succeeded, otherwise it failed for the reason specified.
    reason: '...',          // A short description of the reason, machine-usable. (Only if `confirm: false`.)
    message: '...'          // A short description of the reason, human-readable. (Only if `confirm: false`.)
    configs: [{ ... }]      // A list of configuration objects. (Only if `confirm: true`.)
}
```

### Server -> Client

TBD.