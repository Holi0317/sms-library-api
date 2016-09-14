#!/bin/bash

# Go to this directory
cd "$(dirname "${BASH_SOURCE[0]}")"
cp ../backend/src/models.js src/
cp ../backend/src/config.js src/
cp ../backend/src/library.js src/
cp ../backend/src/promisify.js src/