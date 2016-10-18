import {CronUserData} from '../cron-user-data';

import {getCalendar} from './get-calendar';
import {login} from './login';
import {refreshCalendar} from './refresh-calendar';
import {refreshToken} from './refresh-token';
import {renewBooks} from './renew-books';
import {save} from './save';
import {sendEmail} from './send-email';
import {upgradeUser} from './upgrade-user';

function wrapper(fn: (user: CronUserData) => Promise<any>) {
  return async function(users: CronUserData[]) {
    await Promise.all(users.map(async user => {
      try {
        await fn(user)
      } catch (err) {

      }
    }));
    return users;
  }
}

export const upgradeUser = upgradeUser;
export const refreshToken = wrapper(refreshToken);
export const login = wrapper(login);
export const renewBooks = wrapper(renewBooks);
export const getCalendar = wrapper(getCalendar);
export const refreshCalendar = wrapper(refreshCalendar);
export const sendEmail = wrapper(sendEmail);
export const save = wrapper(save);