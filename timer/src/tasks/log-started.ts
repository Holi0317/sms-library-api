import {CronUserData} from '../cron-user-data';

export async function logStarted(user: CronUserData) {
  user.log('Cron job started');
}