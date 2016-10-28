# sms-library-helper

Library helper for St. Mark's School.

# Brief introduction
Well, this tool will help user to auto-renew book and add due date to Google calendar. That's it.

# Deployed site
[Here](https://slh.holi0317.net/)

# Configuration
Both backend and frontend requires configuration. This app uses [yaml](https://en.wikipedia.org/wiki/YAML) for configuration.

The yaml file can be stored anywhere in your filesystem. Then, set the environment variable, `SLH_CONFIG_PATH`, that points to the yaml file before starting the application
 
The `SLH_CONFIG_PATH` environment variable must be presented in absolute path, to avoid confusion.

## Required information for Google OAuth2
In order to get this app up and running, we need to have some information from Google.

First, you need to register a new project from [Google Developer Console](https://console.developers.google.com).

Second, navigate to `API Manager -> Library section`. Enable the following APIs:
 - Google Calendar API
 - Google+ API
 - Gmail API (In case you want to send email through that account. Otherwise register another project from another Google Account and only enable Gmail API)

Third, navigate to `API Manager -> Credentials section`. Create a new credential. Select `OAuth client ID -> Web application`.
Fill in `Authorized redirect URIs` with the desired deploy endpoint and append `oauth2callback`.
For example, if you want to deploy to `example.com/slh`, then Authorized redirect should have `https://example.com/slh/oauth2callback`. 

Fourth, get `Client ID` and `Client secret` from the credential. Save that up for creating configuration file.
 
Finally, create another new credential. Select `Service Account Key` this time. If you want to send email from other Google Account, login to that and create service account from there.

Create a new service account for filling up `Service account` field. Role should be empty. `Key type` should select `JSON`.

A file should be downloaded and save that up for configuration.

## Example
The following is an example of config.yaml, with comments that should explain each variable usage
```yaml
# Configuration section for mongoDB, database.
mongo:
  url: mongodb://mongo/sms-library-helper  # This is the URL endpoint of mongoDB
  config:  # This is an object (or Associative arrays) for storing mongoose (mongoDB ORM for node) config. Read http://mongoosejs.com/docs/guide.html#options for details
    user: sms-library-helper
    pass: password
    auth:
      authSource: admin

# Google ID of the first administrator. You can get this during development.
# If this is left empty, no one can access the admin page. Yet other function does not affect.
adminID: 116369226224988015839
# Session secret for express.js. It must be randomized and not exposed to others. Recommended to use password generator to generate this.
secret: =r2vRXSJvHu;jNT4nx2`!$$9vd0ET
# Base URL of deployed location. Remember to include scheme(https://) and the tailing slash
baseURL: http://localhost:3000/

# Google OAuth2 configuration
google:
  # clientID. Generated from Google Developer Console
  clientID: ######.apps.googleusercontent.com
  # clientSecret: Generated from Google Developer Console.
  clientSecret: fake_client_secret
  # A jwt (service account) token used for sending Gmail
  jwt:
    type: service_account
    project_id: my-project
    private_key_id: fake_key_id
    private_key: a_super_long_string  # Quote this with "" to avoid error
    client_email: name@my-project.iam.gserviceaccount.com
    client_id: ######
    auth_uri: https://accounts.google.com/o/oauth2/auth
    token_uri: https://accounts.google.com/o/oauth2/token
    auth_provider_x509_cert_url: https://www.googleapis.com/oauth2/v1/certs
    client_x509_cert_url: https://www.googleapis.com/robot/v1/metadata/x509/name%40my-project.iam.gserviceaccount.com
```

# Deploy
Before deploy, check for the above environment variable section and get all variables ready.

This app uses docker and docker-compose. Install [docker](https://www.docker.com/products/docker#/linux) and [docker-compose](https://docs.docker.com/compose/install/) before deploy.

This app is split into 4 parts. They are
 - Backend - Node.js server for storing business logic
 - Frontend - A reverse proxy and static file server using nginx
 - Timer - Cron job for renewing books and other functions
 - MongoDB - Database

## Directories
Data is saved directly into host drive. The root directory is hard-coded to `/srv/slh`. Data includes:
```
certs/ssl.crt -- HTTPS cert for http server
certs/ssl.key -- HTTPS private key for http server
config.yaml -- Configurations file
mongodb/  -- Database files.
```

## Configuration
Check Configuration section above to generate an config.yaml file. Then save it to `/srv/slh/config.yaml`.

Yet, the url of mongodb must be `mongodb://mongo/slh`.

## Build images
Execute `scripts/pre-build.sh` for pre-build procedure.

Execute `docker-compose build`. To build all images.

Some variables are hard-coded. Those includes:
 - Server name for accessing frontend. `slh.holi0317.net`

As frontend image requires to compile some C++ code, it takes about 5 minutes to do all compiling.

## Deploy
Execute `docker-compose up -d`. Make sure you have all files set up. Wait for some time and visit port 80 should have the app started up.

## Scale
Only slh-backend can be scaled. Other may have undesired result if they are scaled up.

## Update
First, build all images with new code. Checkout `build images` section from above.

Second, kill and remove all containers. Execute `docker-compose kill` and then `docker-compose rm`.

Finally, start new containers. Execute `docker-compose up -d`.

# Development environment setup
This section aims to teach you how to setup development environment and adopt to the workflow of the project.

This project uses docker-compose to setup development environment. You may want to get familiarized with [docker-compose](https://docker.github.io/compose/) before getting started.

Install the following requirements on your computer before getting started:
 - [Docker](https://docs.docker.com/engine/installation/)
 - [docker-compose](https://docs.docker.com/compose/install/)
 - Any command shell. Windows user may use sh from busybox. It should work.
 - Recommended: git. You can still use download as tarball from GitHub.
 - Recommended: [nodejs and npm](https://nodejs.org/en/download/). Ideally, all code will be executed in docker container. But you may want node for testing new stuffs.

## Pre build process
There are several common modules used throughout microservices in the project. Yet, I still cannot find a way to manage them easily. As docker does not follow symlink.

A hack is then used. Before building docker images, `common/`, `custom-typings/` needs to be copied into `backend/` and `timer/`.

A shell script is used to automate this process.

Use any command shell to execute `scripts/pre-build.sh` before building.
 
If there is any changes to `common/` or `custom-typings/`, execute `scripts/pre-build.sh` again.

## Create configuration file
Refer to [Configuration](#Configuration), create a configuration file for development process.
 
__Important note__: In the configuration file, url of mongo should be `mongodb://mongo/slh-development`. And baseUrl should be `http://localhost:3000/`

Save that to `config.yaml` at the root directory. git will ignore it.

## Create directory for mongodb
Simply create an empty directory named `mongodb` at root directory. It will be filled up with mongodb files later.

## Build and start frontend server
Execute `docker-compose -f docker-compose-dev.yml up frontend`. A server will be started on `localhost:3000`.

## Start timer process
Execute `docker-compose -f docker-compose-dev.yml run backend`. All message will be shown on console.

## Auto reload of code
Only `src/` directory from backend and timer and `app/` directory from frontend will be mounted into development containers.
 
This means adding new packages, changing gulp tasks will not be sent into the container.

You __MUST__ rebuild the image if such changes occurs.

Moreover, if there is change to `custom-typings` or `common`, `scripts/pre-build.sh` must be run again.

## Rebuild images
Run `docker-compose -f docker-compose-dev.yml build` to (re)build all image.

# TODO
 - Backend: Replace mongoDB with SQLite
 - Test: Replace with ava.js
 - Timer: split refresh-calendar task. Seriously I have no idea what I am reading.
 - Build system: Gulp 4
 - Backend and frontend: Use material design lite instead of bootstrap

# License
This project is released under MIT License.
