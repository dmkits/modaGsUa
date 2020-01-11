#!/bin/bash
cd "$(dirname "$(readlink -fn "$0")")"
node server/server.js -p:8185 debugBtk380307 -log:debug -log:console
