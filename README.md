# sms-library-helper
[![Travis](https://img.shields.io/travis/Holi0317/sms-library-helper.svg?style=flat-square)](https://travis-ci.org/Holi0317/sms-library-helper)

Library helper for St. Mark's School.

## Brief introduction
Well, this tool will help user to auto-renew book and add due date to Google calendar. That's it.

## Deployed site
[Here](https://slh.holi0317.net/)

## Contribution guide
1. All code must pass eslint. However, there is no lint job in gulp. So you need to lint it yourself.
2. If you can, write some tests.
3. Write precise documentation. Because I am stupid and forgets things I have done 3 months ago.

## Environment variables
| ENV | Description | Example |
| --- | ----------- | ------- |
| SLH_JWT | JWT account for sending Gmail alert. Formatted in JSON. Register a service account and get JWT from that. | {"type": "service_account",...} |
| SLH_MONGO_URL | URL of MongoDB location | mongodb://mongo/slh-development |
| SLH_MONGO_OPTIONS | Options for mongoose connection. Check [this](http://mongoosejs.com/docs/guide.html#options) for details. Formatted in JSON | {"user": "slh-develop", "pass": "####"} |
| SLH_ADMIN_ID | Google ID of the admin. Can be obtained during development phase, using the management route. | 2202557213492 |
| SLH_SECRET | Session secret for express.js. Use password generator to generate this. | s%19E2s>lt2k~u7.Vc{^XK{?Jn~0^8b2l@6!EH*C45EHBnp3mRd5E~1eT9`ie$ |
| SLH_CLIENT_ID | Google Auth. Client ID. Generated from Google developer console. | nhss92jng0sj7p80fpe8k.apps.googleusercontent.com |
| SLH_CLIENT_SECRET | Google Auth. Client Secret. Generated from Google developer console. | 2RZU70qA2Oq3CqrD853k1f8o8dbToJsC |
| SLH_BASE |  Base URL of deployed location. | http://example.com/slh | 

## Deploy
 - Remember to enable oauth2callback url in google developer console. For example, deployed under http://example/slh, then enable http://example/slh/oauth2callback for Authorized redirect URIs
 - Checkout nginx-example.conf for nginx example.
 - Use pm2 for deployment.
 - Copy `config.template.js` to `config.js` and edit it by those comments.

## License
This project is released under MIT License.