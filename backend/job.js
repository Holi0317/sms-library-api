'use strict';

let Cron = require('cron').CronJob;
let google = require('googleapis');
let Promise = require('bluebird');
let LibraryApi = require('./api');
let models = require('./models');
let config = require('../config');

// One day, in milisecond
const aDay = 8.64e+7;
const TIMEZONE = 'Asia/Hong_Kong';

Promise.promisifyAll(google.auth.OAuth2.prototype);

// Google apis
let calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

// Promise that will always resolve
let emptyPromise = new Promise(resolve => {
  resolve();
});

class UserFunctions {
  // UserFunctions is a collcetion of promises that bind to user's library and google account
  // User UserFunctionsHandler for real usage as it can consume an array of users
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
  }

  refreshToken()  {
    // Refresh user's google token and write into database.
    return this.oauth2client.refreshAccessTokenAsync()
    .catch(err => {
      console.error('Error when refreshing access token. Error: ', err);
      throw err;
    })
    .then(newTokens => {
      this.user.tokens = newTokens;
      return this.user.save();
    })
  }

  renewBooks() {
    // Renew book in library system.
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise
    if (!this.user.renewEnabled) {
      return emptyPromise;
    }

    return this.library.login(this.user.libraryLogin, this.user.libraryPassword)
    .catch(err => {
      console.error('Error when logging into library system. Error: ', err);
      throw err;
    })
    .then(() => {
      let now = new Date();
      let promises = [];

      for (let book of this.library.borrowedBooks) {
        let diff = book.dueDate - now;
        if (diff <= this.user.renewDate * aDay && diff > 0 && book.id) {
          promises.push(this.library.renew(book));
        }
      }

      return Promise.all(promises);
    })

  }

  _getCalendar() {
    // Get a calendar with name equals to config.calendarName. Create new calendar if needed
    // Write calendar id into this.calendarID
    // Return Promise
    return calendar.calendarList.listAsync({
      auth: this.oauth2client,
      maxResults: 250,
      showHidden: true,
      minAccessRole: 'writer'
    })
    .catch(err => {
      console.error('Error when trying to list calendar. Error: ', err);
      throw err;
    })
    .then(res => {

      for (let item of res.items) {
        if (item.summary === config.calendarName) {

          this.calendarID = item.id;
          return emptyPromise;

        } else {continue}
      }

      return this._createCalendar();

    })
  }

  _createCalendar() {
    // Create calendar and write it into CalendarList (On google's server)
    // Calnedar title (summary) will be config.calendarName
    // Write calendar id into this.calendarID
    // Return Promise
    return calendar.calendars.insertAsync({
      auth: this.oauth2client,
      summary: config.calendarName,
      timeZone: TIMEZONE
    })
    .then(cal => {
      this.calendarID = cal.id;
      return calendar.calendarList.insertAsync({
        auth: this.oauth2client,
        id: cal.id
      })
    })
    .catch(err => {
      this.calendarID = null;
      console.error('Error when creating new calendar. Error: ', err);
      throw err;
    })
  }

  refreshCalendar() {
    // Refresh user's google calendar
    // If user.renewEnabled is false, this will return an empty promise.
    // Return Promise
    if (!this.user.renewEnabled) {
      return emptyPromise;
    }

    return this._getCalendar()
    .then(this.library.reload.bind(this))
    .then(() => {
      // List events in calendar
      return calendar.events.list({
        auth: this.oauth2client,
        calendarId: this.calendarId,
        timeZone: TIMEZONE
      });
    })
    .then(events => {
      let promises = [];

      for (let book of this.library.borrowedBooks) {
        if (book.id === null) {
          // Book does not have id. Probably overdued.
          continue;
        }

        // Evnet resource for requesting
        let resource = {
          summary: `Due date for book ${book.name}. ID: ${book.id}`,
          start: {
            date: `${book.dueDate.getFullYear()}-${book.dueDate.getMonth()+1}-${book.dueDate.getDate()}`,
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
            }
          } else {
            // Issue insert event
            promises.push(calendar.events.insertAsync({
              auth: this.oauth2client,
              calendarId: this.calendarID,
              resource: resource
            }));
          }

        }
      }

      return Promise.all(promises);
    });

  }

}

class UserFunctionsHandler {
  constructor() {
    this.users = [];
  }

  refreshToken(users) {
    // Add users to this.users and refresh their google tokens
    // Return: Promise for the above actoion
    this.users = [];
    let promises = [];

    users.forEach(user => {
      let uf = new UserFunctions(user)
      this.users.push(uf);
      promises.push(uf.refreshToken);
    })

    return Promise.all(promises);
  }

  renewBooks() {
    let promises = [];

    this.users.forEach(user => {
      promises.push(user.renewBooks);
    });

    return Promise.all(promises)
  }

  refreshCalendar() {
    let promises = [];

    this.users.forEach(user => {
      promises.push(user.refreshCalendar);
    });

    return Promise.all(promises);
  }
}

function execute() {
  console.log('Started cron job.');
  let handler = new UserFunctionsHandler();

  models.user.find()
  .then(handler.refreshToken.bind(handler))
  .then(handler.renewBooks.bind(handler))
  .then(handler.refreshCalendar.bind(handler))
  .then(() => {
    console.log('Cron job ended');
  })
  .catch(err => {
    console.error('Cron Job errored.');
    throw err;
  });
}

new Cron({
  cronTime: '00 00 00 * * *',
  onTick: execute,
  start: true,
  timeZone: 'UTC'
});

module.exports = execute;
module.exports._UserFunctions = UserFunctions;
module.exports._UserFunctionsHandler = UserFunctionsHandler;
