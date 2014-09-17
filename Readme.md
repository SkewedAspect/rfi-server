# NodeJS RFI: Precursors MMORPG Server

This is a nodejs implementation of the RFI: Precursors server. The intention is to see if this can replace the current
Erlang server with something easier to develop against.

## Unit Tests

To run the unit tests, simple run:

```bash
$ npm test
```

All tests should pass.

## Socket.io Communication Protocol

### Request: `login`

Logs in to the server, authenticating with the given account/password.

#### Payload

```javascript
{
    account: "...",         // Account to log in to
    password: "..."         // Password for account
}
```

#### Response

```javascript
{
    confirm: true | false,  // If true, the request succeeded, otherwise it failed for the reason specified.
    reason: '...',          // A short description of the reason, machine-usable. (Only if `confirm: false`.)
    message: '...'          // A short description of the reason, human-readable. (Only if `confirm: false`.)
    characters: [{ ... }]   // A list of character objects associated with the account. (Only if `confirm: true`.)
}
```

### Request: `select character`

Selects a character to play as. Should be the id from one of the character objects we were passed in the login 
confirmation.

#### Payload

```javascript
{
    character: "..."      // The id of the character to play as.
}
```

#### Response

```javascript
{
    confirm: true | false,  // If true, the request succeeded, otherwise it failed for the reason specified.
    reason: '...',          // A short description of the reason, machine-usable. (Only if `confirm: false`.)
    message: '...'          // A short description of the reason, human-readable. (Only if `confirm: false`.)
}
```
