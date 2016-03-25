/*
 * Special config file for Travis CI.
 * This will fix all issues caused by Travis CI.
 */
'use strict';

let mongoose = require('mongoose');

module.exports = {
  // Mongoose createConnection instance
  conn: mongoose.createConnection('mongodb://localhost/noop'),

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

  jwt: 'JWT'
};

module.exports.conn.on('error', function(){});
