import {MAX_LOG_RECORD} from '../constants';

export async function save(user) {
  if (user.failed) {
    user.log('Cron job failed.', 'FATAL');
  } else {
    user.log('Cron job succeed.', 'SUCCESS');
  }

  user.data.logs.sort((a, b) => b.time - a.time);
  user.data.logs = user.data.logs.slice(0, MAX_LOG_RECORD);
  await user.data.save();
}