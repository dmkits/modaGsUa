#!/bin/bash
cd "$(dirname "$(readlink -fn "$0")")"
node server/server.js -p:8080 productionBtk380307
