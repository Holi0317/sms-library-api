var mongoose = require('mongoose');

module.exports = {
  // Mongoose createConnection instance
  conn: mongoose.createConnection('mongodb://localhost/slh'),

  // Session secret for express.js
  secret: 'Generate a totally random string here.',
  // MongoDB url for storing session
  sessionUrl: 'mongodb://localhost/slh-session',

  // Google AUTH
  clientId: 'Client ID got from console.developer.google.com',
  clientSecret: 'Client secret got from console.developer.google.com',
  // oauth2callback url. Should be <host>/api/oauth2callback
  // Remember to config this on developer console
  redirectUrl: 'http://localhost:3000/oauth2callback',

  // Calendar name for Google calendar
  calendarName: 'slh autorenew'
};
