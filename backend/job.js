/**
 * The job, cron job, to be runned.
 * @module backend/job
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires googleapis
 * @requires bluebird
 */

'use strict';

let google = require('googleapis');
let Promise = require('bluebird');
let LibraryApi = require('./api');
let models = require('./models');
let config = require('../config');
let utils = require('./utils');

/**
 * One day in milisecond.
 * @const {number} ONE_DAY
 */
const ONE_DAY = 8.64e+7;
/**
 * Timezone that library system is at.
 * @const {string} TIMEZONE
 */
const TIMEZONE = 'Asia/Hong_Kong';
/**
 * Maximum log to be kept.
 * @const {number} MAX_LOG_RECORD
 */
const MAX_LOG_RECORD = 100;

Promise.promisifyAll(google.auth.OAuth2.prototype);

// Google apis
let calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

/**
 * A collection of promises that bind to a user's library and google account.
 * Use UserFunctionFactory for batch execution.
 *
 * @prop {backend/models.user} user - User object queried from database.
 * @prop {google.auth.OAuth2} oauth2client - Google OAuth2 bounded to user token.
 * @prop {backend/api.User} library - Library API bound to user.
 * @prop {Number} celdnarID - Google calendar ID that matches the name of user defined.
 * @prop {bool} failed - Trye if any operation failed.
 *
 * @see UserFunctionFactory
 */
class UserFunctions {

  /**
   * Construct a new UserFunctions object.
   *
   * @param {backend/models.user} user - User (database record) that this object will be bounded to.
   *
   * @constructor
   */
  constructor(user) {
    this.user = user;
    this.oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    this.oauth2client.setCredentials(this.user.tokens);
    this.library = new LibraryApi();
    this.calendarID = null;
    this.failed = false;
  }

  /**
   * Log message into user log.
   * Just a wrapper for creating {@link backend/models.Log} object and pushing it into
   * user.logs.
   *
   * @param {object} a - First option to be passed into Log constructor.
   * @param {object} b - Second option to be passed into Log constructor.
   * @see backend/models.Log
   */
  log(a, b) {
    this.user.logs.push(new models.Log(a, b));
  }

  /**
   * Refresh user's Google OAuth2 token and write to database.
   *
   * @throws {Error} - Cannot refresh OAuth2 tokens.
   * @returns {Proimse} - Promise for refreshing token then writes into database.
   */
  refreshToken() {
    return this.oauth2client.refreshAccessTokenAsync()
    .catch(err => {
      console.error('Error when refreshing access token. Error: ', err);
      this.log('Cannot refresh Google token. Aborting.', 'FATAL');
      this.failed = true;
      throw err;
    })
    .then(newTokens => {
      this.log('Refreshed Google tokens.', 'DEBUG')
      // OAuth2 does not pass back refresh_token.
      newTokens.refresh_token = this.user.tokens.refresh_token;
      this.user.tokens = newTokens;
      return this.user.save();
    });
  }

  /**
   * Login library system, then renew books if needed.
   *
   * @throws {Error} - Login into library system failed.
   * @returns {Promise} - Promise for renew login and renew book, if needed.
   * Or empty promise if failed or not enabled.
   */
  renewBooks() {
    if (!this.user.renewEnabled || this.failed) {
      return Promise.resolve();
    }

    return this.library.login(this.user.libraryLogin, this.user.libraryPassword)
    .catch(err => {
      console.error('Error when logging into library system. Error: ', err);
      this.log('Cannot login library system. Is password changed?', 'FATAL');
      this.failed = true;
      throw err;
    })
    .then(() => {
      let now = new Date();
      let promises = [];  // Promises for renewing book to be returned.
      let borrowedBooks = [];   // Book name for all borrowed books. For logging purpose.
      let renewBooks = [];    // Book name for all books requires to be renewed. For logging purpose.

      for (let book of this.library.borrowedBooks) {  // Each borrowed books.

        borrowedBooks.push(book.name);  // Logging.

        let diff = book.dueDate - now;
        if (diff <= this.user.renewDate * ONE_DAY && diff > 0 && book.id) {
          // If Logic: Less than defined date, more than 0 day and have book ID.
          promises.push(this.library.renew(book));    // Create promise.
          renewBooks.push(book.name);    // Logging.
        }
      }

      if (borrowedBooks) {
        this.log(`You have borrowed the followings books: ${borrowedBooks.join(', ')}`);
      } else {
        this.log('No borrowed books detected.');
      }

      if (renewBooks) {
        this.log(`The following books will be renewed: ${renewBooks.join(', ')}`);
      }

      return Promise.all(promises);
    });

  }

  /**
   * List calendars and see if there is one equals to name user defined (user.calendarName).
   * If yes, Save the calendar ID to property and return empty Promise.
   * Otherwise, return a promise that creates calenar (_createCalendar).
   *
   * @see _createCalendar
   * @returns {Promise} - See above description.
   * @throws {Error} - Cannot list calendar.
   * @private
   */
  _getCalendar() {
    if (this.failed) {
      return Promise.resolve();
    }

    return calendar.calendarList.listAsync({
      auth: this.oauth2client,
      maxResults: 250,
      showHidden: true,
      minAccessRole: 'writer'
    })
    .catch(err => {
      console.error('Error when trying to list calendar. Error: ', err);
      this.log('Cannot list Google Calendar. Aborting.', 'FATAL');
      this.failed = true;
      throw err;
    })
    .then(res => {

      if (res.nextPageToken) {
        this.log('Found there is more than 250 items in calendar list. A new calendar may be created.', 'WARN');
      }

      for (let item of res.items) {
        if (item.summary === this.user.calendarName) {

          // Got calendar that I want.
          this.calendarID = item.id;
          this.log(`Found Google Calendar. ID: ${item.id}.`, 'DEBUG');
          return Promise.resolve();

        }
        // Else, continue.
      }

      // Calendar not found. Lets create one.
      this.log(`Cannot find Google Calendar with name "${this.user.calendarName}". Creating one.`);
      return this._createCalendar();

    });
  }

  /**
   * Create new calendar, where summary is user.calendarName and handle stuffs.
   *
   * @returns {Promise} - Create new calendar.
   * @throws {Error} - Cannot create calendar/insert it into CalendarList.
   * @private
   */
  _createCalendar() {
    if (this.failed) {
      return Promise.resolve();
    }

    return calendar.calendars.insertAsync({
      auth: this.oauth2client,
      summary: this.user.calendarName,
      timeZone: TIMEZONE
    })
    .then(cal => {
      this.log(`Calendar created. ID: ${cal.id}. Adding to CalendarList.`, 'DEBUG');
      this.calendarID = cal.id;
      return calendar.calendarList.insertAsync({
        auth: this.oauth2client,
        id: cal.id
      });
    })
    .catch(err => {
      this.calendarID = null;
      console.error('Error when creating new calendar. Error: ', err);
      this.log('Cannot create calendar / Insert calendar to CalendarList. Aborting', 'FATAL');
      this.failed = true;
      throw err;
    })
  }

  /**
   * Create calendar event resource by using book object passed in.
   *
   * @param {backend/api.Book} book - Book object that need to be converted into event resource.
   * @returns {Object} - Event resource (Google calendar) of this book.
   * @static
   * @private
   */
  _createEventResource (book) {
    return {
      summary: `Due date for book ${book.name}. ID: ${book.id}`,
      start: {
        date: `${book.dueDate.getFullYear()}-${book.dueDate.getMonth()+1}-${book.dueDate.getDate()}`,  // JS use 0 as January and 11 as December.
        timeZone: TIMEZONE
      },
      end: {
        date: `${book.dueDate.getFullYear()}-${book.dueDate.getMonth()+1}-${book.dueDate.getDate()}`,
        timeZone: TIMEZONE
      }
    };
  }

  /**
   * Reload library content and write corresponding due date to Google calendar.
   *
   * @returns {Promise} - Promise for the above action.
   * @throws {Errors} - Cannot reload library content.
   * @throws {Errors} - Cannot get Google Calendar ID.
   * @throws {Errors} - Cannot insert Calendar event.
   * @FIXME Remove returned books.
   */
  refreshCalendar() {
    // Refresh user's google calendar
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise
    if (!this.user.renewEnabled || this.failed) {
      return Promise.resolve();
    }

    return this._getCalendar()
    .then(this.library.reload.bind(this.library))
    .catch(err => {
      console.error('Error when reloading library contents. Error: ', err);
      this.failed = true;
      this.log('Cannot reloading library contents. WTF? This should not happen. Aborting', 'FATAL');
      throw err;
    })
    .then(() => {
      // List events in calendar
      return calendar.events.list({
        auth: this.oauth2client,
        calendarId: this.calendarId,
        timeZone: TIMEZONE
      });
    })
    .catch(err => {
      console.error('Error when listing events in Google Calendar. Error: ', err);
      this.failed = true;
      this.log('Cannot listing events in Google Calendar. Aborting.', 'FATAL');
      throw err;
    })
    .then(events => {

      // FIXME event will not be deleted if returned?

      let promises = [];
      let logUpdated = [];
      let logCreated = [];

      for (let book of this.library.borrowedBooks) {  // Fore each book.
        if (book.id === null) {
          // Book does not have id. Probably overdued.
          continue;
        }

        // Event resource for requesting
        let resource = this._createEventResource(book);

        for (let event of events.items) {   // Fore each event.

          if (event.summary === resource.summary) {   // Is this event the one I want for this book?
            if (event.end.date !== resource.end.date) {  // Is due date unchanged? (renewed?)
              promises.push(calendar.events.updateAsync({
                auth: this.oauth2client,
                calendarId: this.calendarID,
                eventId: event.id,
                resource: resource
              }));

              logUpdated.push(book.name);

            }

          }
          // Not the one I want. Continue looping.

        }
        // No event that I am interested.
        promises.push(calendar.events.insertAsync({
          auth: this.oauth2client,
          calendarId: this.calendarID,
          resource: resource
        }));

        logCreated.push(book.name);

      }

      if (logUpdated) {
        this.log(`Calendar events of the following books will be updated: ${logUpdated.join(', ')}`);
      }
      if (logCreated) {
        this.log(`Calendar events of the following books will be created: ${logCreated.join(', ')}`);
      }

      return Promise.all(promises);

    });

  }

  /**
   * Limit log message to 100 and write into database.
   *
   * @returns {Promise} - Write optration to database.
   */
  saveProfile() {
    if (this.failed) {
      this.log('Cron job failed.', 'FATAL');
    } else {
      this.log('Cron job succeed.', 'SUCCESS');
    }

    this.user.logs.sort((a, b) => {
      return b.time - a.time;
    });
    this.user.logs = this.user.logs.slice(-MAX_LOG_RECORD);
    return this.user.save();
  }

}

/**
 * Batcher for executing mass amount of UserFunctions.
 * Methods are identical to {@link UserFunctions}, but errors will be supressed.
 *
 * @prop {UserFunctions[]} users - Users that this batcher is bounded to.
 * @see UserFunctions
 */
class UserFunctionFactory {

  /**
   * @constructor
   */
  constructor() {
    this.users = [];
  }

  /**
   * Call name and apply catchIgnore and chain all of them together.
   *
   * @param {string} name - Name of the method that will be called.
   * @returns {Promise} - Promise of that object.
   * @private
   */
  _method(name) {
    let promises = [];
    this.users.forEach(user => {
      promises.push(user[name]().catch(utils.catchIgnore));
    })
    return Promise.all(promises);
  }

  /**
   * @param {backend/models.users[]} users - Users that will be bounded to.
   */
  refreshToken(users) {
    // Add users to this.users and refresh their google tokens
    // Return: Promise for the above actoion
    this.users = [];
    let promises = [];

    users.forEach(user => {
      let uf = new UserFunctions(user);
      this.users.push(uf);
      uf.log('Started cron job.');
      promises.push(uf.refreshToken().catch(utils.catchIgnore));
    })

    return Promise.all(promises);
  }

  renewBooks() {
    return this._method('renewBooks');
  }

  refreshCalendar() {
    return this._method('refreshCalendar');
  }

  saveProfile() {
    return this._method('saveProfile');
  }
}

/**
 * @summary Regular job for the system.
 * @desc This job will, first, query all users. Then renew books for them. Finally,
 * refresh their Google calendar and do some database cleanup. Please run this job once
 * per day.
 *
 * @returns {Promise} - Promise for the job.
 */
function execute() {
  console.log('Started cron job.');
  let factory = new UserFunctionFactory();

  models.user.find()
  .then(factory.refreshToken.bind(factory))
  .then(factory.renewBooks.bind(factory))
  .then(factory.refreshCalendar.bind(factory))
  .then(factory.saveProfile.bind(factory))
  .then(() => {
    console.log('Cron job ended');
  })
  .catch(err => {
    console.error('Cron Job errored.');
    throw err;
  });
}

module.exports = execute;
module.exports._UserFunctions = UserFunctions;
module.exports._UserFunctionFactory = UserFunctionFactory;
