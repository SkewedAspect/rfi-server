# RFI: Precursors MMORPG Server

[![Build Status](https://travis-ci.org/SkewedAspect/rfi-server.svg)](https://travis-ci.org/SkewedAspect/rfi-server)
[![Issues in Ready](https://badge.waffle.io/SkewedAspect/rfi-webgl-client.png?label=ready&title=Ready Issues)](https://waffle.io/SkewedAspect/rfi-webgl-client)
[![Issues in Progress](https://badge.waffle.io/SkewedAspect/rfi-webgl-client.png?label=in progress&title=In Progress Issues)](https://waffle.io/SkewedAspect/rfi-webgl-client)
[![Issues Needing Review](https://badge.waffle.io/SkewedAspect/rfi-webgl-client.png?label=needs review&title=Issues Needing Review)](https://waffle.io/SkewedAspect/rfi-webgl-client)

This is a Node.js implementation of the RFI: Precursors server.


## Running the Server

Before you get started, you'll need to make sure that you have the server's dependencies installed:
```bash
npm install
```

Next, you have a few options for how to run the server...


### Running in a Docker Container

Before starting, you'll need [docker](https://docs.docker.com/) and
[docker-compose](https://docs.docker.com/compose/install/) installed.

The first time you set up your Docker containers, you'll need to initialize the database. To do this, bring up the
`rethinkdb` service, run `scripts/initdb.sh`, and stop the `rethinkdb` service:
```bash
docker-compose up -d rethinkdb

scripts/initdb.js --rethinkdb.host=$(docker inspect -f '{{.NetworkSettings.IPAddress}}' rfiserver_rethinkdb_1)
# If using `fish`: scripts/initdb.js --rethinkdb.host=(docker inspect -f '{{.NetworkSettings.IPAddress}}' rfiserver_rethinkdb_1)

docker-compose stop rethinkdb
```

Finally, bring up all defined services:
```fish
docker-compose up
```

Now, the server should be running and listening on port 8008; you can then bring up and connect any client.

----

### Running Directly

#### Set up RethinkDB

First, you will need to either install RethinkDB on your system, or use the `rethinkdb` Docker image.

To install RethinkDB on your system, follow [the instructions for your platform](http://rethinkdb.com/docs/install/).

To use the Docker image, first [install docker](https://docs.docker.com/). Then, run the following command to create
and start a new RethinkDB container:
```bash
docker run --name rfi-rethinkdb -v $PWD:/data -p 28015:28015 -d rethinkdb
# If using `fish`: docker run --name rfi-rethinkdb -v (pwd):/data -p 28015:28015 -d rethinkdb
```

From now on, you can use `docker ps` to check on your container, `docker stop rfi-rethinkdb` to stop the running
container, and `docker start rfi-rethinkdb` to start it again. To connect to your RethinkDB instance's administration
UI, use the following command:
```bash
$BROWSER http://$(docker inspect -f '{{.NetworkSettings.IPAddress}}' rfi-rethinkdb):8080
# If using `fish`: eval $BROWSER http://(docker inspect -f '{{.NetworkSettings.IPAddress}}' rfi-rethinkdb):8080
```

Once you have an accesible RethinkDB instance, create the tables in the database, and populate them with test data:
```bash
node ./scripts/initdb.js
```

_Note: If you don't want the development accounts, pass the `--production` option._

#### Run the Server

Use `npm` to start the server:
```bash
npm start
```

Or, alternatively, start the server directly:
```bash
node server.js
```

Starting the server directly allows you to override configuration options on the command line; see
`node server.js --help` for more information.

----


## Unit Tests

To run the unit tests, simple run:

```bash
npm test
```

All tests should pass.
