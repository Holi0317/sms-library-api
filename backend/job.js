'use strict';

let google = require('googleapis');
let Promise = require('bluebird');
let LibraryApi = require('./api');
let models = require('./models');
let config = require('../config');
let utils = require('./utils');

// One day, in milisecond
const ONE_DAY = 8.64e+7;
const TIMEZONE = 'Asia/Hong_Kong';
const MAX_LOG_RECORD = 100;

Promise.promisifyAll(google.auth.OAuth2.prototype);

// Google apis
let calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

class UserFunctions {

  // UserFunctions is a collcetion of promises that bind to user's library and google account
  // User UserFunctionFactory for real usage as it can consume an array of users

  constructor(user) {
    /*
    Parameters:
    user -- user object queried from database
    */
    this.user = user;
    this.oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    this.oauth2client.setCredentials(this.user.tokens);
    this.library = new LibraryApi();
    this.calendarID = null;
    this.failed = false;
  }

  log(a, b) {
    this.user.logs.push(new models.Log(a, b));
  }

  refreshToken() {
    // Refresh user's google token and write into database.
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

  renewBooks() {

    // Renew book in library system.
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise

    if (!this.user.renewEnabled || this.failed) {
      return utils.emptyPromise;
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
      let promises = [];
      let borrowedBooks = [];
      let renewBooks = [];

      for (let book of this.library.borrowedBooks) {

        borrowedBooks.push(book.name);

        let diff = book.dueDate - now;
        if (diff <= this.user.renewDate * ONE_DAY && diff > 0 && book.id) {
          promises.push(this.library.renew(book));
          renewBooks.push(book.name)
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
    })

  }

  _getCalendar() {
    // Get a calendar with name equals to user.calendarName. Create new calendar if needed
    // Write calendar id into this.calendarID
    // Return Promise
    if (this.failed) {
      return utils.emptyPromise;
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

      for (let item of res.items) {
        if (item.summary === this.user.calendarName) {

          this.calendarID = item.id;
          this.log(`Found Google Calendar. ID: ${item.id}.`, 'DEBUG');
          return utils.emptyPromise;

        } else {continue}
      }

      return this._createCalendar();

    })
  }

  _createCalendar() {
    // Create calendar and write it into CalendarList (On google's server)
    // Calnedar title (summary) will be user.calendarName
    // Write calendar id into this.calendarID
    // Return Promise
    if (this.failed) {
      return utils.emptyPromise;
    }

    this.log(`Cannot find Google Calendar with name "${this.user.calendarName}". Creating one.`);
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
      })
    })
    .catch(err => {
      this.calendarID = null;
      console.error('Error when creating new calendar. Error: ', err);
      this.log('Cannot create calendar / Insert calendar to CalendarList. Aborting', 'FATAL');
      this.failed = true;
      throw err;
    })
  }

  refreshCalendar() {
    // Refresh user's google calendar
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise
    if (!this.user.renewEnabled || this.failed) {
      return utils.emptyPromise;
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
      let promises = [];
      let logUpdated = [];
      let logCreated = [];

      for (let book of this.library.borrowedBooks) {
        if (book.id === null) {
          // Book does not have id. Probably overdued.
          continue;
        }

        // Evnet resource for requesting
        let resource = {
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

        for (let event of events.items) {

          // Check if event name equals to book id
          if (event.summary === resource.summary) {
            // Book has been written into calendar. Issue update request if needed.
            if (event.start.date !== resource.start.date) {
              promises.push(calendar.events.updateAsync({
                auth: this.oauth2client,
                calendarId: this.calendarID,
                eventId: event.id,
                resource: resource
              }));

              logUpdated.push(book.name);

            }
          } else {
            // Issue insert event
            promises.push(calendar.events.insertAsync({
              auth: this.oauth2client,
              calendarId: this.calendarID,
              resource: resource
            }));

            logCreated.push(book.name);

          }

        }
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

  saveProfile() {
    if (this.failed) {
      this.log('Cron job failed', 'FATAL');
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

class UserFunctionFactory {
  constructor() {
    this.users = [];
  }

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
    let promises = [];

    this.users.forEach(user => {
      promises.push(user.renewBooks().catch(utils.catchIgnore));
    });

    return Promise.all(promises)
  }

  refreshCalendar() {
    let promises = [];

    this.users.forEach(user => {
      promises.push(user.refreshCalendar().catch(utils.catchIgnore));
    });

    return Promise.all(promises);
  }

  saveProfile() {
    let promises = [];

    this.users.forEach(user => {
      promises.push(user.saveProfile().catch(utils.catchIgnore));
    });

    return Promise.all(promises)
  }
}

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
