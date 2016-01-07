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
    calendarName: {
      type: String,
      default: 'slh autorenew'
    },
    logs: [{
      time: Date,
      message: String,
      level: {
        type: String,
        enum: 'DEBUG INFO WARN ERROR FATAL SUCCESS'.split(' ')
      }
    }]
  })
};

// function Log(message, level='INFO') {  TODO Enable this when node.js supports default parameters
function Log(message, level) {
  // Class for log object in database, with some helper function.
  level = typeof level !== 'undefined' ?  level : 'INFO';
  this.time = new Date();
  this.message = message;
  this.level = level;
}

module.exports = {
  user: conn.model('User', schema.user),

  _schema: schema,
  Log: Log
};
