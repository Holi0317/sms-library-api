/**
 * Defines schema and models for MongoDB.
 * Note that by requiring this module, bluebird will be used as mongoose's promise library.
 * @module sms-library-helper/backend/models
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires mongoose
 * @requires bluebird
 */

'use strict';

let mongoose = require('mongoose');
let conn = require('../config').conn;

mongoose.Promise = require('bluebird');

/**
 * Defines schema to be used in mongoDB.
 * @const {Object.<string, mongoose.Schema>} schema
 * @alias module:sms-library-helper/backend/models._schema
 */
const schema = {
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

/**
 * Helper class for a log message.
 *
 * @class
 * @param {string} message - Message to be logged.
 * @param {string} [level=DEBUG] - Level of the log message. Valid levels: DEBUG, INFO, WARN, ERROR, FATAL, SUCCESS.
 * They will not be validicated until it is written into database.
 *
 * @prop {string} level - Level of the message.
 * @prop {string} message - Message content.
 * @prop {Date} time - Time of this message being created.
 *
 * @alias module:sms-library-helper/backend/models.Log
 */
function Log(message, level) {
  this.level = typeof level !== 'undefined' ?  level : 'INFO';
  this.time = new Date();
  this.message = message;
}

/** Model of the user. */
module.exports.user = conn.model('User', schema.user);
module.exports._schema = schema;
module.exports.Log = Log;
