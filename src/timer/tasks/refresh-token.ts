import {CronUserData} from '../cron-user-data';
import {User} from '../../common/models';

export async function refreshToken(user: CronUserData) {

  let newTokens;

  try {
    newTokens = await user.oauth2client.refreshAccessTokenAsync();
  } catch (err) {
    console.error('Error when refreshing access token. Error: ', err);
    user.log('Cannot refresh Google token. Aborting.', 'FATAL');
    user.failed = true;
  }

  user.log('Refreshed Google tokens.', 'DEBUG');
  // OAuth2 does not pass back refresh_token.
  await User.update({
    accessToken: newTokens.access_token
  }, {
    where: {
      googleID: user.data.googleID
    }
  });

}