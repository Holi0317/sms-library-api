import * as google from 'googleapis';
import {config} from './config';
import './promisify';

/**
 * Factory function for creating google.auth.OAuth2 client.
 * Just because copying code is too stupid.
 *
 * @static
 * @returns {google.auth.OAuth2} - New OAuth2 object that have client ID,
 * secret and redirect url set.
 */
export function oauth2clientFactory() {
  return new google.auth.OAuth2(config.clientID, config.clientSecret, config.redirectUrl);
}

export class ExpressError extends Error {
  public status: number;
  public message: string;
}

export function diff(a, b) {
  return a.filter(i =>
    b.indexOf(i) < 0
  );
}
