#!/bin/bash
cd "$(dirname "$(readlink -fn "$0")")"
node server/server.js -p:8185 debugBtk -log:debug -log:console
