# sms-library-helper-migrate
Migration script for upgrading from 0.1.0 to 0.2.0

# Introduction
As from 0.2.0, database has been changed. This script is written to help migrate.

This script will import all data from mongoDB and create a SQLite database file.

# Setup
## MongoDB
First, the old mongoDB must be started.

To start that, execute the following command for mongoDB:

`docker run --name mongo -p 27017:27017 -v /mongodb-directory:/data/db mongo:3.2`

Replace `mongodb-directory` with absolute path of mongoDB database file.

A mongoDB server is then started and listening on 27017 on localhost.

Set environment variable, `MONGODB` to mongoDB url. For instance,

`export MONGODB=mongodb://localhost/slh`

(If you have changed the default database name, replace slh to the database name)
 
## SQLite
Second, setup SQLite.

Only environment variable is required for SQLite. Set the SQLITE variable to the SQLite file you would like to save to. For example,

`export SQLITE=/home/me/slh.sqlite`

The path must be an absolute path.

# Migration
Execute the following commands in this folder. Assume node and npm is installed.

```bash
npm install
node index.js
```

The result file should appear in the directory specified.

If you are trying to deploy, place the file to `/srv/slh/slh.sqlite`