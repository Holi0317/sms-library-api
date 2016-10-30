const mongoose = require('mongoose');

const conn = mongoose.createConnection(process.env.MONGODB || 'mongodb://localhost/slh');

const userSchema = new mongoose.Schema({
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

module.exports = conn.model('User', userSchema);