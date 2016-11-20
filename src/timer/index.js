require('../common/promisify');
const User = require('../common/models').User;
const config = require('../common/config').config;
const tasks = require('./tasks');

function execute() {
  console.log('Started cron job.');

  return config.sequelize.sync()
    .then(() => {
      return User.findAll();
    })
    .then(tasks.upgradeUser)
    .then(tasks.logStarted)
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
        process.exit(0);
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