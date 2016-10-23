#!/usr/bin/env bash

if [ -z "$SLH_CONFIG_PATH" ]; then
 echo "SLH_CONFIG_PATH is unset. Cannot startup server."
 exit 1
fi

trap on_kill INT

function on_kil() {
  killall gulp
}

cd "$(dirname "${BASH_SOURCE[0]}")"
./pre-build.sh

cd ..
cd backend
gulp serve&
sleep 15

cd ../frontend
gulp serve
