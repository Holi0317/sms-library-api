import {MAX_LOG_RECORD} from '../constants';
import {CronUserData} from '../cron-user-data';
import {Logs} from '../../common/models';

export async function save(user: CronUserData) {
  if (user.failed) {
    user.log('Cron job failed.', 'FATAL');
  } else {
    user.log('Cron job succeed.', 'SUCCESS');
  }

  await Logs.bulkCreate(user.logs);
  let results = await Logs.findAndCountAll({
    attributes: ['id'],
    where: {
      userID: user.data.googleID
    },
    order: 'time DESC',
    limit: 1,
    offset: MAX_LOG_RECORD
  });

  if (results.count > MAX_LOG_RECORD) {
    await Logs.destroy({
      where: {
        id: {
          $lte: results.rows[0].id
        },
        userID: user.data.googleID
      }
    });
  }
}