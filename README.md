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

This app uses docker and swarm. Install [docker](https://www.docker.com/products/docker#/linux) before deploy.

This app is split into 4 parts. They are
 - Backend - Node.js server for storing business logic
 - Frontend - A reverse proxy and static file server using nginx
 - Timer - Cron job for renewing books and other functions
 - MongoDB - Database

## Directories
As this app is so simple (and I am not that good at swarm), it assumes only one swarm node is used for deployment.

Therefore, data is saved directly into host drive. The root directory is hard-coded to `/srv/slh`. Data includes:
```
certs/ssl.crt -- HTTPS cert for http server
certs/ssl.key -- HTTPS private key for http server
config.yaml -- Configurations file
mongodb/  -- Database files. Must create this directory.
```

## Setup swarm nodes
Some swarm concepts is needed to get started. You may want to [read them first](https://docs.docker.com/engine/swarm/key-concepts/) before start.
 
Create at least one swarm node for deployment. Check [here](https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/) for instruction.

## Configuration
Check Configuration section above to generate an config.yaml file. Then save it to `/srv/slh/config.yaml`.

## Build images
Execute `scripts/build.sh`. That will build all images from source.

Some variables are hard-coded. Those includes:
 - Port for backend service
 - Name of each service
 - Server name for accessing frontend

Those variables are arguments in `Dockerfile`. If you need to change them, do NOT use the build script but build images by hand.

As frontend image requires to compile some C++ code, it takes about 5 minutes to do all compiling.

## Deploy
Execute `scripts/deploy.sh`. Make sure you have all files set up. Wait for some time and visit port 80 should have the app spinned up.

## Scale
Only slh-backend can be scaled. Other may have undesired result if they are scaled up.

# TODO
 - Dev: Create development docker container
 - Doc: Write docs for development
 - Test: Replace with ava.js
 - Timer: split refresh-calendar task. Seriously I have no idea what I am reading.
 - Backend: update jade to pug js
 - Build system: Gulp 4
 - Docker: Use docker-compose
 - Backend and frontend: Use material design lite instead of bootstrap

# License
This project is released under MIT License.