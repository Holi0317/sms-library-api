'use strict';

let Promise = require('bluebird');

module.exports = function(user) {
  if (!user.data.renewEnabled || user.failed) {
    return Promise.resolve();
  }

  return user.library.login(user.data.libraryLogin, user.data.libraryPassword)
    .catch(err => {
      console.error('Error when logging into library system. Error: ', err);
      user.log('Cannot login library system. Is password changed?', 'FATAL');
      user.failed = true;
      throw new Error('Failed to login library system');
    })
};