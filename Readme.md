# RFI: Precursors MMORPG Server

[![Issues in Ready](https://badge.waffle.io/SkewedAspect/rfi-server.png?label=ready&title=Ready Issues)](https://waffle.io/SkewedAspect/rfi-server)
[![Issues in Progress](https://badge.waffle.io/SkewedAspect/rfi-server.png?label=in progress&title=In Progress Issues)](https://waffle.io/SkewedAspect/rfi-server)

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

