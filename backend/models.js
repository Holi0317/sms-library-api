'use strict';

let mongoose = require('mongoose');
let conn = require('../config').conn;

mongoose.Promise = require('bluebird');

let schema = {
  user: new mongoose.Schema({
    tokens: mongoose.Schema.Types.Mixed,
    googleId: String,
    libraryLogin: String,
    libraryPassword: String,
    renewDate: {
      type: Number,
      max: 13,
      min: 2,
      default: 3
    },
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
