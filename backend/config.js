'use strict';

let {join} = require('path');
let mongoose = require('mongoose');
let google = require('googleapis');

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
} else {
  const jwt = JSON.parse(process.env.SLH_JWT);
  module.exports = {
    // Mongoose createConnection instance
    conn: mongoose.createConnection(process.env.SLH_MONGO_URL, JSON.parse(process.env.SLH_MONGO_OPTIONS || '{}')),

    // Google ID for admin.
    // If blank, no one can access the admin page. Unless development mode is enabled.
    // Get your Google ID using development mode and access admin page.
    adminID: process.env.SLH_ADMIN_ID,

    // Session secret for express.js.
    // http://randomkeygen.com/ is recommended for generating keys.
    secret: process.env.SLH_SECRET,

    // Google AUTH
    clientId: process.env.SLH_CLIENT_ID,
    clientSecret: process.env.SLH_CLIENT_SECRET,
    // oauth2callback url. Should be <host>/oauth2callback
    // Remember to config this on developer console
    redirectUrl: join(process.env.SLH_BASE, 'oauth2callback'),

    jwt: new google.auth.JWT(jwt.client_email, null, jwt.private_key, ['https://www.googleapis.com/auth/gmail.send'], null)

  };
  module.exports.jwt.authorize(err => {
    if (err) {
      throw err;
    }
  });
}

