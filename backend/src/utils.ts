import * as google from 'googleapis';
import {config} from './config';
import './promisify';

/**
 * The exception to be thrown when a promise is broken (have exception) and it is already handled.
 * Useful when it comes to response handling as response cannot be sent twice.
 * @example
makePromise
.then(throwRandomError)
.catch(err => {
  handleErr(err);
  throw new BreakSignal();
})
.then(otherStuffs)
.catch(err => {
  if (err instanceof BreakSignal) return
  handleErr2(err);
});
 * @class
 * @extends Error
 */
export class BreakSignal extends Error {}

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

/**
 * Error catcher for validate.js.
 * Validate.js throws an array as error in flat mode. This handler will join the array
 * with ';\n' and throw an error object.
 *
 * @param {Array} err - Error array thrown by validate.js in flat mode.
 * @throws {Error} - Error object with error accepted.
 */
export function validateErrorHandle(err) {
  throw new Error(err.join(';\n'));
}

export class ExpressError extends Error {
  public status: number;
  public message: string;
}