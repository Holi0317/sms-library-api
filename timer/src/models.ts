import * as mongoose from 'mongoose';
import {config} from './config';
import * as Promise from 'bluebird';
import {Log} from "../../backend/src/models";

mongoose.Promise = Promise;

export type LogLevels = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'SUCCESS';

export let userSchema = new mongoose.Schema({
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
  calendarEnabled: {
    type: Boolean,
    default: false
  },
  calendarName: {
    type: String,
    default: 'slh autorenew'
  },
  emailEnabled: {
    type: Boolean,
    default: false
  },
  emailAddress: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  logs: [{
    time: Date,
    message: String,
    level: {
      type: String,
      enum: 'DEBUG INFO WARN ERROR FATAL SUCCESS'.split(' ')
    }
  }]
});

export interface UserDocument extends mongoose.Document {
  tokens: {
    access_token: string
    refresh_token?: string
  }
  googleId: string
  libraryLogin: string
  libraryPassword: string
  renewDate: number
  renewEnabled: boolean
  calendarEnabled: boolean
  calendarName: string
  emailEnabled: boolean
  emailAddress: string
  isAdmin: boolean
  logs: Log[]
  log: (message: string, level?: LogLevels) => void
}

/**
 * Instance method.
 * Append a log entry into user document.
 * Does NOT perform save action.
 *
 * @param message - Message to be logged.
 * @param level - Level of the log message.
 * They will not be validated until it is written into database.
 */
userSchema.methods.log = function(message: string, level: LogLevels) {
  let msg = new Log(message, level);
  this.logs.push(msg);
};

/**
 * Helper class for a log message.
 *
 * @class
 * @private
 * @param {string} message - Message to be logged.
 * @param {string} [level=DEBUG] - Level of the log message. Valid levels: DEBUG, INFO, WARN, ERROR, FATAL, SUCCESS.
 * They will not be validicated until it is written into database.
 *
 * @prop {string} level - Level of the message.
 * @prop {string} message - Message content.
 * @prop {Date} time - Time of this message being created.
 */
export class Log {
  public time: Date;

  constructor(public message: string, public level: LogLevels = 'INFO') {
    this.time = new Date();
  }
}

export const UserModel = config.conn.model('User', userSchema);
