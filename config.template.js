'use strict';

let mongoose = require('mongoose');

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
  redirectUrl: 'http://localhost:3000/oauth2callback'
};
