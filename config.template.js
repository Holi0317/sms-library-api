var mongoose = require('mongoose');

module.exports = {
  // Mongoose createConnection instance
  conn: mongoose.createConnection('localhost/slh'),

  // Session secret for express.js
  secret: 'Generate a totally random string here.',
  // MongoDB url for storing session
  sessionUrl: 'localhost/slh-session',

  // Google AUTH
  clientId: 'Client ID got from console.developer.google.com',
  clientSecret: 'Client secret got from console.developer.google.com'
};
