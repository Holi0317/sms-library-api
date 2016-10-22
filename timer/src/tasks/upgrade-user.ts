import {CronUserData} from '../cron-user-data';
import {UserDocument} from '../common/models';

export async function upgradeUser(users: UserDocument[]): Promise<CronUserData[]> {
  return users.map(u => new CronUserData(u));
}