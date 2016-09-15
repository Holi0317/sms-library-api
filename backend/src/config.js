'use strict';

let fs = require('fs');
let url = require('url');
let mongoose = require('mongoose');
let google = require('googleapis');
let yaml = require('js-yaml');

if (process.env.TRAVIS) {
  module.exports = {
    // Mongoose createConnection instance
    conn: mongoose.createConnection('mongodb://localhost/noop'),
    adminID: 'Google ID for admin',
    secret: 'Generate a totally random string here.',
    clientId: 'Client ID got from console.developer.google.com',
    clientSecret: 'Client secret got from console.developer.google.com',
    redirectUrl: 'http://localhost:3000/oauth2callback',
    jwt: 'JWT'
  };
  module.exports.conn.on('error', ()=>{});
} else if (process.env.SLH_CONFIG_PATH) {
  let doc = yaml.safeLoad(fs.readFileSync(process.env.SLH_CONFIG_PATH, 'utf8'));
  console.log(doc);
  let jwt = doc.google.jwt;
  module.exports = {
    conn: mongoose.createConnection(doc.mongo.url, doc.mongo.config),
    adminID: doc.adminID,
    secret: doc.secret,
    clientId: doc.google.clientID,
    clientSecret: doc.google.clientSecret,
    redirectUrl: url.resolve(doc.baseURL, 'oauth2callback'),
    jwt: new google.auth.JWT(jwt.client_email, null, jwt.private_key, ['https://www.googleapis.com/auth/gmail.send'], null)
  };
  module.exports.jwt.authorize(err => {
    if (err) {
      throw err;
    }
  });
} else {
  throw new Error('SLH_CONFIG_PATH environment variable is not defined. Read README.md for more details.');
}

