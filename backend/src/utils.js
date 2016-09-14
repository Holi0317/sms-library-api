/**
 * Some utilities functions.
 * @module sms-library-helper/backend/utils
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires googleapis
 */

'use strict';

let google = require('googleapis');

let config = require('./config');
require('./promisify');

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
module.exports.BreakSignal = class BreakSignal extends Error{};

/**
 * Factory function for creating google.auth.OAuth2 client.
 * Just because copying code is too stubid.
 *
 * @static
 * @returns {google.auth.OAuth2} - New OAuth2 object that have client ID,
 * secret and redirect url set.
 */
module.exports.oauth2clientFactory = function () {
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
};

/**
 * Error catcher for validate.js.
 * Validate.js throws an array as error in flat mode. This handler will join the array
 * with ';\n' and throw an error object.
 *
 * @param {Array} err - Error array thrown by validate.js in flat mode.
 * @throws {Error} - Error object with error accepted.
 */
module.exports.validateErrorHandle = function(err) {
  throw new Error(err.join(';\n'));
};