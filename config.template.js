'use strict';

let mongoose = require('mongoose');
let google = require('googleapis');

// Create a JWT account for sending email through gmail.
const jwt = {
  type: 'service_account',
  project_id: '###',
  private_key_id: '###',
  private_key: '###',
  client_email: '###',
  client_id: '###',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://accounts.google.com/o/oauth2/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/nodejs%40expanded-pride-125714.iam.gserviceaccount.com'
}

module.exports = {
  // Mongoose createConnection instance
  conn: mongoose.createConnection('mongodb://localhost/slh-development', {
    user: 'slh-develop',
    pass: '####',   // Of cause, I won't give you my password.
    auth: {
      authSource: 'admin'
    }
  }),

  // Google ID for admin.
  // If blank, no one can access the admin page. Unless development mode is enabled.
  // Get your Google ID using development mode and access admin page.
  adminID: 'Google ID for admin',

  // Session secret for express.js.
  // http://randomkeygen.com/ is recommended for generating keys.
  secret: 'Generate a totally random string here.',

  // Google AUTH
  clientId: 'Client ID got from console.developer.google.com',
  clientSecret: 'Client secret got from console.developer.google.com',
  // oauth2callback url. Should be <host>/oauth2callback
  // Remember to config this on developer console
  redirectUrl: 'http://localhost:3000/oauth2callback',

  // DO NOT EDIT THIS
  jwt: new google.auth.JWT(jwt.client_email, null, jwt.private_key, ['https://www.googleapis.com/auth/gmail.send'], null)

};

// DO NOT EDIT THIS
module.exports.jwt.authorize(err => {
  if (err) {
    throw err;
  }
});
