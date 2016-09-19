#!/usr/bin/env bash

version=v0.0.0

cd "$(dirname "${BASH_SOURCE[0]}")"

cd ../backend
echo "building backend"
docker build -t "holi0317/sms-library-helper-backend:$version" .

cd ../timer
echo "building timer"
./pre-build.sh
docker build -t "holi0317/sms-library-helper-timer:$version" .

cd ../frontend
echo "building frontend"
docker build -t "holi0317/sms-library-helper-frontend:$version" .