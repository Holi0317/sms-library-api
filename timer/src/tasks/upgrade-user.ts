import {CronUserData} from '../cron-user-data';
import {UserDocument} from '../models';

export async function upgradeUser(users: UserDocument[]) {
  return users.map(u => new CronUserData(u));
}