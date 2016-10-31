import {CronUserData} from '../cron-user-data';

import {getCalendar as _getCalendar} from './get-calendar';
import {login as _login} from './login';
import {refreshCalendar as _refreshCalendar} from './refresh-calendar';
import {refreshToken as _refreshToken} from './refresh-token';
import {renewBooks as _renewBooks} from './renew-books';
import {save as _save} from './save';
import {sendEmail as _sendEmail} from './send-email';
import {logStarted as _logStarted} from './log-started';

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

export {upgradeUser} from './upgrade-user';
export const logStarted = wrapper(_logStarted);
export const refreshToken = wrapper(_refreshToken);
export const login = wrapper(_login);
export const renewBooks = wrapper(_renewBooks);
export const getCalendar = wrapper(_getCalendar);
export const refreshCalendar = wrapper(_refreshCalendar);
export const sendEmail = wrapper(_sendEmail);
export const save = wrapper(_save);