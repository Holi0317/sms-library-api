'use strict';

let Cron = require('cron').CronJob;
let google = require('googleapis');
let Promise = require('bluebird');
let LibraryApi = require('./api');
let models = require('./models');
let config = require('./config');

Promise.promisifyAll(google.auth.OAuth2.prototype);

// One day, in milisecond
const aDay = 8.64e+7;

function refreshTokens(users) {
  console.log('Refreshing tokens');
  let res = [];

  users.forEach(user => {
    let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    oauth2client.setCredentials(user.tokens)
    oauth2client.refreshAccessTokenAsync()
    .catch(err => {
      console.error('Error when refreshing access token. Error: ', err);
    })
    .then(newTokens => {
      user.tokens = newTokens;
      res.push(user.write);
    })
  });

  return Promise.all(res);
}

function createQueryRenewEnabled() {
  console.log('Creating query');
  return models.user.find({
    renewEnabled: true
  });
}

function renewBooksAndRefreshCalendar(users) {
  console.log('Refreshing books and calendar');
  let now = new Date();
  let res = [];

  for (let user of users) {
    let library = new LibraryApi();
    let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
    oauth2client.setCredentials(user.tokens)

    res.push(library.login(user.libraryLogin, user.libraryPassword)
    .catch(() => {
      console.error('Login library system errored.');
    })
    .then(() => {
      // Loop through books. Create renew object
      let bookPromises = [];

      for (let book of library.borrowedBooks) {
        let diff = book.dueDate - now;
        if (diff <= 2 * aDay && diff > 0 && book.id) {
          bookPromises.push(library.renew(book));
        }
      }

      return Promise.all(bookPromises);

    })
    .then(() => {
      // All books renewed. Refresh google calendar
      

    }));

  }

  return Promise.all(res);
}

function execute() {
  console.log('Started cron job.');

  models.user.find()
  .then(refreshTokens)
  .then(createQueryRenewEnabled)
  .then(renewBooksAndRefreshCalendar)
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
