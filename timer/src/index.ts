import './common/promisify';
import {UserModel} from './common/models';
import * as tasks from './tasks';

export function execute() {
  console.log('Started cron job.');

  return UserModel.find()
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

if (require.main === module) {
  execute();
}