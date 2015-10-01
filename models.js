'use strict';

let mongoose = require('mongoose');
let conn = require('./config').conn;
let ObjectId = mongoose.Schema.Types.ObjectId;

let schema = {
  user: mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    libraryLogin: String,
    libraryPassword: String,
    enabled: Boolean,
    logs: [{
      type: ObjectId,
      ref: 'Log'
    }]
  }),

  log: mongoose.Schema({
    time: Date,
    user: {
      type: ObjectId,
      ref: 'User'
    },
    action: String
  })
};

module.exports = {
  user: conn.model('User', schema.user),
  log: conn.model('Log', schema.log),

  _schema: schema
};
