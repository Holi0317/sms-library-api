/**
 * Upgrade user object retrived from MongoDB to CronUserData, which can store more metadata.
 */

'use strict';

let google = require('googleapis');
let config = require('../config');
let library = require('../library');

/**
 * An object that can store more metadata for a user. Specially crafted for this cron job.
 */
class CronUserData {
  constructor(user) {
    this.data = user;
    this.oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    this.oauth2client.setCredentials(this.data.tokens);
    this.library = new library();
    this.calendarID = null;
    this.failed = false;
    this.emailMsgID = [];

    this.log = this.data.log.bind(this.data);
  }
}

module.exports = function(users) {
  return Promise.resolve(users.map(u => new CronUserData(u)));
};