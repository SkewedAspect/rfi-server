# NodeJS RFI: Precursors MMORPG Server

This is a nodejs implementation of the RFI: Precursors server. The intention is to see if this can replace the current
Erlang server with something easier to develop against.

## Setup

First, you will need to install [`rethinkdb`](http://rethinkdb.com/docs/install/). Follow the instructions for your 
platform. Next, install the npm modules:

```bash
$ npm install
```

After that completes, create the test user in the database:

```bash
$ node ./scripts/init-db.js
```

_Note: You need a clean database to run the `init-db` script._

## Unit Tests

To run the unit tests, simple run:

```bash
$ npm test
```

All tests should pass.

