/**
 * The job, cron job, to be runned.
 * @module sms-library-helper/backend/job
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires googleapis
 * @requires bluebird
 */

'use strict';

let google = require('googleapis');
let Promise = require('bluebird');
let template = require('lodash.template');

let LibraryApi = require('./api');
let models = require('./models');
let utils = require('./utils');
let config = require('../config');

/**
 * One day in milisecond.
 * @const {number} ONE_DAY
 * @default 8.64e+7
 */
const ONE_DAY = 8.64e+7;
/**
 * Timezone that library system is at.
 * @const {string} TIMEZONE
 * @default 'Asia/Hong_Kong'
 */
const TIMEZONE = 'Asia/Hong_Kong';
/**
 * Maximum log to be kept.
 * @const {number} MAX_LOG_RECORD
 * @default 100
 */
const MAX_LOG_RECORD = 100;
/**
 * The maximum renew time for library system.
 * @const {number} MAX_RENEW_TIME
 * @default 5
 */
const MAX_RENEW_TIME = 5;
/**
 * Template for a mail that reminds user that this is the last time for renewal.
 * This is in fact a lodash template function.
 * @const {function} MAIL_TEMPLATE
 * @default (Check the source. It is long.)
 */
const MAIL_TEMPLATE = template(`
Good day,

This mail is sent from Library helper. You know, that auto renew thingee.
(By the way, my main function is to add due date to Google Calendar and many of you guys don't know this function. QAQ)

I am here to remind you that the following books has hit their maximum renew time. They cannot be renewed in the future.
Please renew them before due date.

The book(s) are:
<% books.forEach(function(book) { %>

=====================
Book name: <%- book.name %>

Due date: <%- book.dueDate.toDateString() %>
=====================

<% }); %>
Due date of these books should appear on your Google calendar. Please set notification on those events as I will not remind you to return books.

Regards,
Library Helper.

P.S. This message is sent by a stupid robot. Please be nice and do not reply email to him.
He is not clever enough to read these messages.
`);
/**
 * Subject for the email.
 * @const {string} MAIL_SUBJECT
 * @default 'Library Helper reminder'
 */
const MAIL_SUBJECT = 'Library Helper reminder';
/**
 * Sender name of the email.
 * @const {string} MAIL_SENDER
 * @default 'Library Helper'
 */
const MAIL_SENDER = 'Library Helper';

// Google apis
let calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

/**
 * Convert Date object to Google calendar's format, 'yyyy-mm-dd'.
 *
 * @param {Date} date - Date object to be converted.
 *
 * @returns {string} - Date with yyyy-mm-dd as format.
 * @private
 */
function dateToGoogle(date) {
  return `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`
}

/**
 * A collection of promises that bind to a user's library and google account.
 * Use UserFunctionFactory for batch execution.
 *
 * @prop {backend/models.user} user - User object queried from database.
 * @prop {google.auth.OAuth2} oauth2client - Google OAuth2 bounded to user token.
 * @prop {backend/api.User} library - Library API bound to user.
 * @prop {Number} celdnarID - Google calendar ID that matches the name of user defined.
 * @prop {bool} failed - Trye if any operation failed.
 * @prop {function} log - Log message to user.
 * @prop {[]String} emails - User's email retrived from Google.
 * @prop {[]String} emailMsgID - Book ID that need to be warned to user.
 *
 * @see {@link sms-library-helper/backend/job~UserFunctionFactory}
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
    this.oauth2client = utils.oauth2clientFactory();
    this.oauth2client.setCredentials(this.user.tokens);
    this.library = new LibraryApi();
    this.calendarID = null;
    this.failed = false;
    this.emails = [];
    this.emailMsgID = [];

    this.log = this.user.log.bind(this.user);
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
      throw new utils.BreakSignal();
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
   * Get user's emails from Google and write to local variable.
   * All emails will be written into the local variable, this.emails.
   * If renew is not enabled, an empty promise will be returned.
   *
   * @returns {Promise} - Promise for the above action.
   * @throws {utils.BreakSignal} - Error when requesting google plus.
   * @private
   */
  _getEmails() {
    if (!this.user.renewEnabled) {
      return Promise.resolve();
    }
    let plus = google.plus('v1');
    let getAsync = Promise.promisify(plus.people.get);

    return getAsync({userId: 'me', auth: this.oauth2client})
    .then(plusRes => {
      if ('emails' in plusRes) {
        // Some user may not have email in their scope.
        this.emails = plusRes.emails.map(a => a.value);
      } else {
        this.log('Cannot get your email due to permission not granted. Email service will be disenabled. Re-login to grant permission.', 'WARN');
      }
      return Promise.resolve();
    })
    .catch(err => {
      console.warn('Error when requesting for Google plus. Error: ', err);
      this.log('Cannot request Google Plus for emails. Email function will be disenabled.', 'WARN');
      throw new utils.BreakSignal();
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
      throw new utils.BreakSignal();
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
          promises.push(this.library.renewBook(book));    // Create promise.
          renewBooks.push(book.name);    // Logging.

          // Create array of books that needs to be notified.
          if (book.renewal === MAX_RENEW_TIME - 1) {
            this.emailMsgID.push(book.id);
          }
        }
      }

      if (borrowedBooks.length) {
        this.log(`You have borrowed the followings books: ${borrowedBooks.join(', ')}`);
      } else {
        this.log('No borrowed books detected.');
      }

      if (renewBooks.length) {
        this.log(`The following books will be renewed: ${renewBooks.join(', ')}`);
      }

      return Promise.all(promises);
    });

  }

  /**
   * Send notify emails using gmail.
   * Notify emails means this is the last time for the renew of book and remind user
   * to return book on date.
   *
   * @returns {Promise} - Promise for the above action.
   */
  consumeEmail() {
    return this._getEmails()
    .then(() => {
      let promises = [];

      let gmail = google.gmail('v1');
      let send = Promise.promisify(gmail.users.messages.send);

      let books = this.library.borrowedBooks.filter(b => this.emailMsgID.indexOf(b.id) !== -1);
      let message = MAIL_TEMPLATE({books: books});

      for (let address of this.emails) {
        let email = utils.makeEmail(MAIL_SENDER, address, MAIL_SUBJECT, message);
        let p = send({
          auth: config.jwt,
          userId: 'me',
          resource: {
            raw: email
          }
        });

        promises.push(p);
      }

      return Promise.all(promises);
    });
  }

  /**
   * List calendars and see if there is one equals to name user defined (user.calendarName).
   * If yes, Save the calendar ID to property and return empty Promise.
   * Otherwise, return a promise that creates calenar (_createCalendar).
   *
   * @see {@link sms-library-helper/backend/job~UserFunctions~_createCalendar}
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
      resource: {
        summary: this.user.calendarName,
        timeZone: TIMEZONE
      }
    })
    .then(cal => {
      this.log(`Calendar created. ID: ${cal.id}.`, 'DEBUG');
      this.calendarID = cal.id;
      return Promise.resolve();
    })
    .catch(err => {
      this.calendarID = null;
      console.error('Error when creating new calendar. Error: ', err);
      this.log('Cannot create calendar / Insert calendar to CalendarList. Aborting', 'FATAL');
      this.failed = true;
      throw new utils.BreakSignal();
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
  _createEventResource(book) {
    let date = dateToGoogle(book.dueDate);

    return {
      summary: `Due date for book ${book.name}. ID: ${book.id}`,
      start: {
        date: date,
        timeZone: TIMEZONE
      },
      end: {
        date: date,
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
   */
  refreshCalendar() {
    // Refresh user's google calendar
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise
    if (!this.user.renewEnabled || this.failed) {
      return Promise.resolve();
    }

    let promises = [];
    let touchedEvents = [];
    let logUpdated = [];
    let logCreated = [];

    /**
     * Process a book. Should it be updated in Google Calendar?
     *
     * @returns {Boolean} - Is the book already in Google Calendar.
     */
    let processBook = function (resource, events) {
      for (let event of events.items) {   // For each event.
        let resDate = resource.end.date;
        if (event.summary === resource.summary) {   // Is this event the one I want for this book?
          if (event.end.date !== resDate || event.start.date !== resDate) {   // Has event date changed? (renewed/touched?)
            promises.push(calendar.events.updateAsync({
              auth: this.oauth2client,
              calendarId: this.calendarID,
              eventId: event.id,
              resource: resource
            }));
          }
          touchedEvents.push(event.id);
          return true;  // Already in Calendar
        }
      }
      return false;   // Not in Calendar.
    }.bind(this);

    return this._getCalendar()
    .then(this.library.reload.bind(this.library))
    .catch(err => {
      if (err instanceof utils.BreakSignal) {
        throw err;
      }
      console.error('Error when reloading library contents. Error: ', err);
      this.failed = true;
      this.log('Cannot reloading library contents. WTF? This should not happen. Aborting', 'FATAL');
      throw new utils.BreakSignal();
    })
    .then(() => {
      // List events in calendar
      return calendar.events.listAsync({
        auth: this.oauth2client,
        calendarId: this.calendarID,
        timeZone: TIMEZONE,
        maxResults: 2500
      });
    })
    .catch(err => {
      if (err instanceof utils.BreakSignal) {
        throw err;
      }
      console.error('Error when listing events in Google Calendar. Error: ', err);
      this.failed = true;
      this.log('Cannot listing events in Google Calendar. Aborting.', 'FATAL');
      throw new utils.BreakSignal();
    })
    .then(events => {

      if (events.nextPageToken) {
        this.log('More than 2500 events found in calendar (Seriously?). Some event may be missed out.', 'WARN');
      }

      for (let book of this.library.borrowedBooks) {  // Fore each book.
        if (book.id === null) {
          // Book does not have id. Probably overdued.
          continue;
        }

        // Event resource for requesting
        let resource = this._createEventResource(book);

        // The book is not in Google Calendar. Create a new one.
        if (!processBook(resource, events)) {
          promises.push(calendar.events.insertAsync({
            auth: this.oauth2client,
            calendarId: this.calendarID,
            resource: resource
          }));

          logCreated.push(book.name);

        }

      }

      // Cleanup events that has not been touched(Illegal events or returned books)
      let allEventsID = events.items.map(item => {
        return item.id;
      });
      let removes = utils.diff(allEventsID, touchedEvents);
      for (let eventID of removes) {
        promises.push(calendar.events.deleteAsync({
          auth: this.oauth2client,
          calendarId: this.calendarID,
          eventId: eventID
        }));
      }

      if (logUpdated.length) {
        this.log(`Calendar event(s) of the following books will be updated: ${logUpdated.join(', ')}`);
      }
      if (logCreated.length) {
        this.log(`Calendar event(s) of the following books will be created: ${logCreated.join(', ')}`);
      }
      if (removes.length) {
        this.log(`The following event(s) will be removed: ${removes.join(', ')}`, 'DEBUG');
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
    this.user.logs = this.user.logs.slice(0, MAX_LOG_RECORD);
    return this.user.save();
  }

}

/**
 * Batcher for executing mass amount of UserFunctions.
 * Methods are identical to {@link UserFunctions}, but errors will be supressed.
 *
 * @prop {UserFunctions[]} users - Users that this batcher is bounded to.
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
      user.log('Started cron job.');
      this.users.push(uf);
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

  consumeEmail() {
    return this._method('consumeEmail');
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
  .then(factory.consumeEmail.bind(factory))
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
