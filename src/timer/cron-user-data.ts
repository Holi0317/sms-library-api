import * as google from 'googleapis';
import {config} from '../common/config';
import Library from '../common/library';
import {IUser, LogLevels} from '../common/models';

class Log {
  public time = new Date();
  constructor(
    public message: string,
    public level: LogLevels,
    public userID: string
  ) {}
}

/**
 * An object that can store more metadata for a user. Specially crafted for this cron job.
 */
export class CronUserData {
  public oauth2client: google.auth.OAuth2;
  public library = new Library();
  public calendarID?: string = null;
  public failed = false;
  public emailMsgID: string[] = [];
  public logs: Log[] = [];

  constructor(public data: IUser) {
    let oauth2client = new google.auth.OAuth2(config.clientID, config.clientSecret, config.redirectUrl);
    oauth2client.setCredentials({
      refresh_token: data.refreshToken,
      access_token: data.accessToken
    });
    this.oauth2client = oauth2client;
  }

  log(message: string, level: LogLevels = 'INFO') {
    this.logs.push(new Log(message, level, this.data.googleID));
    return;
  }
}