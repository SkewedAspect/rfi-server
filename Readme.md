# RFI: Precursors MMORPG Server

This is a nodejs implementation of the RFI: Precursors server.

## Setup

First, you will need to install [`rethinkdb`](http://rethinkdb.com/docs/install/). Follow the instructions for your 
platform. Next, install the npm modules:

```bash
$ npm install
```

After that completes, create the test user in the database:

```bash
$ node ./scripts/initdb.js
```

_Note: If you don't want the development accounts, pass the `-p` option._

## Unit Tests

To run the unit tests, simple run:

```bash
$ npm test
```

All tests should pass.

