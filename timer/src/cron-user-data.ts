import * as google from 'googleapis';
import {config} from './common/config';
import Library from './common/library';
import {UserDocument} from './common/models';

/**
 * An object that can store more metadata for a user. Specially crafted for this cron job.
 */
export class CronUserData {
  public data: UserDocument;
  public oauth2client: google.auth.OAuth2;
  public library: Library;
  public calendarID?: string;
  public failed: boolean;
  public emailMsgID: string[];

  constructor(user: UserDocument) {
    this.data = user;
    let oauth2client = new google.auth.OAuth2(config.clientID, config.clientSecret, config.redirectUrl);
    oauth2client.setCredentials(this.data.tokens);
    this.oauth2client = oauth2client;
    this.library = new Library();
    this.calendarID = null;
    this.failed = false;
    this.emailMsgID = [];
  }

  log(...args) {
    return this.data.log.bind(this.data)(...args);
  }
}