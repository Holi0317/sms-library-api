# sms-library-helper
[![Travis](https://img.shields.io/travis/Holi0317/sms-library-helper.svg?style=flat-square)](https://travis-ci.org/Holi0317/sms-library-helper)

Library helper for St. Mark's School.

# Brief introduction
Well, this tool will help user to auto-renew book and add due date to Google calendar. That's it.

# Deployed site
[Here](https://slh.holi0317.net/)

# Configuration
## Using environment variables
| ENV | Description | Example |
| --- | ----------- | ------- |
| SLH_JWT | JWT account for sending Gmail alert. Formatted in JSON. Register a service account and get JWT from that. | {"type": "service_account",...} |
| SLH_MONGO_URL | URL of MongoDB location | mongodb://mongo/slh-development |
| SLH_MONGO_OPTIONS | Options for mongoose connection. Check [this](http://mongoosejs.com/docs/guide.html#options) for details. Formatted in JSON | {"user": "slh-develop", "pass": "####"} |
| SLH_ADMIN_ID | Google ID of the admin. Can be obtained during development phase, using the management route. | 2202557213492 |
| SLH_SECRET | Session secret for express.js. It must be randomized and not exposed to others. Recommended to use password generator to generate this. | s%19E2s>lt2k~u7.Vc{^XK{?Jn~0^8b2l@6!EH*C45EHBnp3mRd5E~1eT9`ie$ |
| SLH_CLIENT_ID | Google Auth. Client ID. Generated from Google developer console. | nhss92jng0sj7p80fpe8k.apps.googleusercontent.com |
| SLH_CLIENT_SECRET | Google Auth. Client Secret. Generated from Google developer console. | 2RZU70qA2Oq3CqrD853k1f8o8dbToJsC |
| SLH_BASE |  Base URL of deployed location. | http://example.com/slh | 

# Deploy
Before deploy, check for the above environment variable section and get all variables ready.

This app uses docker and kubernetes. And, by default, built for Google Container Engine. Install [docker](https://www.docker.com/products/docker#/linux), [Google cloud SDK](https://cloud.google.com/sdk/) and kubectl by running `gcloud components install kubectl`.

This app is split into 4 parts. They are
 - Backend - Node.js server for storing business logic
 - Frontend - A reverse proxy and static file server using nginx
 - Timer - Cron job for renewing books and other functions
 - MongoDB - Database

(Not yet finished. I haven't finish kubernetes part)

# TODO
 - Backend and timer: Refactor to TypeScript
 - Backend and timer: await and async
 - Test: Replace with ava.js
 - Timer: split refresh-calendar task. Seriously I have no idea what I am reading.
 - Misc: Automatic shell script (or node?) for build, deploy, environment variables, etc.
 - Backend and frontend: Use fetch for http request
 - Backend: library API rewrite
 - Backend: update jade to pug js

# License
This project is released under MIT License.