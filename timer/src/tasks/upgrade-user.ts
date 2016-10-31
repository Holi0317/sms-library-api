import {CronUserData} from '../cron-user-data';
import {IUser} from '../common/models';

export async function upgradeUser(users: IUser[]): Promise<CronUserData[]> {
  return users.map(u => new CronUserData(u));
}