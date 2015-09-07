var mongoose = require('mongoose');

module.exports = {
  // Mongoose createConnection instance
  conn: mongoose.createConnection('localhost/slh'),

  // Google AUTH
  clientId: 'Client ID got from console.developer.google.com',
  clientSecret: 'Client secret got from console.developer.google.com'
};
