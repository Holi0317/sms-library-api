import {CronUserData} from '../cron-user-data';

export async function login(user: CronUserData) {
  if (!user.data.renewEnabled || user.failed) {
    return;
  }

  try {
    await user.library.login(user.data.libraryLogin, user.data.libraryPassword);
  } catch (err) {
    if (err.code && err.code === 'EAI_AGAIN') {
      user.log('Cannot resolve to library system server.', 'FATAL');
      console.error('Error when resolving library system server. Error: ', err);
    } else {
      console.error('Error when logging into library system. Error: ', err);
      user.log('Cannot login library system. Is password changed?', 'FATAL');
    }
    user.failed = true;
    throw new Error('Failed to login library system');
  }

}
