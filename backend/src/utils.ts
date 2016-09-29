import * as google from 'googleapis';
import * as iconv from 'iconv-lite';
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
 * Decode given fetch content to BIG5.
 * @param res - Response from fetch.
 * @returns Decoded string.
 */
export async function deocdeBig5(res) {
  let buffer = await res.buffer();
  return iconv.decode(buffer, 'big5');
}

export class ExpressError extends Error {
  public status: number;
  public message: string;
}
