#!/usr/bin/env bash

version=v0.0.0

docker network create --opt encrypted --driver overlay slh-network

docker service create \
  --name mongo \
  --network slh-network \
  --mount type=bind,target=/data/db,source=/srv/slh/mongodb/ \
  --replicas 1 \
  "mvertes/alpine-mongo:3.2.4-1"

docker service create \
  --name slh-backend \
  --network slh-network \
  --mount type=bind,target=/etc/slh-config.yaml,source=/srv/slh/config.yaml \
  --replicas 1 \
  --endpoint-mode dnsrr \
  "holi0317/sms-library-helper-backend:$version"

docker service create \
  --name slh-timer \
  --network slh-network \
  --mount type=bind,target=/etc/slh-config.yaml,source=/srv/slh/config.yaml \
  --replicas 1 \
  "holi0317/sms-library-helper-timer:$version"

docker service create \
  --name slh-frontend \
  --network slh-network \
  --mount type=bind,target=/etc/nginx/certs,source=/srv/slh/certs/ \
  --replicas 1 \
  --publish 80:80 \
  --publish 443:443 \
  "holi0317/sms-library-helper-frontend:$version"
