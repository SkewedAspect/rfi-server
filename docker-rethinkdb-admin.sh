#!/usr/bin/env bash

$BROWSER "http://$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' rfiserver_rethinkdb_1):8080"
