'use strict';

let mongoose = require('mongoose');
let conn = require('./config').conn;

let schema = {
  user: mongoose.Schema({
    tokens: {},
    googleId: String,
    libraryLogin: String,
    libraryPassword: String,
    renewEnabled: {
      type: Boolean,
      default: false
    },
    logs: [{
      time: Date,
      action: String
    }]
  })
};

module.exports = {
  user: conn.model('User', schema.user),

  _schema: schema
};
