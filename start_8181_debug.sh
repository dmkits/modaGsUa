#!/bin/bash
cd "$(dirname "$(readlink -fn "$0")")"

if [[ ! -d "$MyVar" ]]; then
    export NODE_ENV="development"
    echo 'NODE_ENV="development"' >> ~/.bashrc
fi

node server/server.js -p:8185 test -log:console
