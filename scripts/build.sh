#!/usr/bin/env bash

version=v0.0.0

cd "$(dirname "${BASH_SOURCE[0]}")"

cd ../backend
echo "building backend"
npm install
docker build -t "holi0317/sms-library-helper-backend:$version" .

cd ../timer
echo "building timer"
npm install
docker build -t "holi0317/sms-library-helper-timer:$version" .

cd ../frontend
echo "building frontend"
npm install
docker build -t "holi0317/sms-library-helper-frontend:$version" .
