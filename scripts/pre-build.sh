#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ..

[[ -e backend/src/common ]] && rm -r backend/src/common
[[ -e timer/src/common ]] && rm -r timer/src/common

cp -R common backend/src/
cp -R common timer/src/

[[ -e backend/custom-typings ]] && rm -r backend/custom-typings
[[ -e timer/custom-typings ]] && rm -r timer/custom-typings

cp -R custom-typings backend/
cp -R custom-typings timer/