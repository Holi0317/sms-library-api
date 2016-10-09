'use strict';

let Promise = require('bluebird');

function wrapper(fn) {
  return function(users) {
    return Promise.all(users.map(user =>
      fn(user).catch(() => Promise.resolve())
    ))
      .then(() => Promise.resolve(users));
  }
}

module.exports = {
  upgradeUser: require('./upgrade-user'),
  refreshToken: wrapper(require('./refresh-token')),
  login: wrapper(require('./login')),
  renewBooks: wrapper(require('./renew-books')),
  getCalendar: wrapper(require('./get-calendar')),
  refreshCalendar: wrapper(require('./refresh-calendar')),
  sendEmail: wrapper(require('./send-email')),
  save: wrapper(require('./save'))
};