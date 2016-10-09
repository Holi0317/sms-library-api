/**
 * The job, cron job, to be runned.
 * @module sms-library-helper/timer
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 * @requires googleapis
 * @requires mongoose
 * @requires lodash.template
 */

'use strict';
require('./promisify');
let models = require('./models');
let tasks = require('./tasks');

function execute() {
  console.log('Started cron job.');
  models.user.find()
    .then(tasks.upgradeUser)
    .then(tasks.refreshToken)
    .then(tasks.login)
    .then(tasks.renewBooks)
    .then(tasks.getCalendar)
    .then(tasks.refreshCalendar)
    .then(tasks.sendEmail)
    .then(tasks.save)
    .then(() => {
      console.log('Cron job ended');
      if (require.main === module) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Cron Job errored. Error: ', err);
      if (require.main === module) {
        process.exit(1);
      }
    });

}

module.exports = execute;

if (require.main === module) {
  execute();
}