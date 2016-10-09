'use strict';

let {MAX_LOG_RECORD} = require('../constants');

module.exports = function(user) {
  if (user.failed) {
    user.log('Cron job failed.', 'FATAL');
  } else {
    user.log('Cron job succeed.', 'SUCCESS');
  }

  user.data.logs.sort((a, b) => {
    return b.time - a.time;
  });
  user.data.logs = user.data.logs.slice(0, MAX_LOG_RECORD);
  return user.data.save();
};