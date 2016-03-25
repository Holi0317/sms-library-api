/**
 * Some utilities functions.
 * @module sms-library-helper/backend/utils
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 * @requires googleapis
 */

'use strict';

let Promise = require('bluebird');
let google = require('googleapis');

let config = require('../config');

Promise.promisifyAll(google.auth.OAuth2.prototype);

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
module.exports.BreakSignal = class BreakSignal extends Error{}

/**
 * Supress all error when exception is thrown.
 * @example
makePromise()
.then(throwError)
.catch(catchThenThrowAnotherError)
.then(otherStuffs)
.catch(catchIgnore);
// otherStuffs will not be executed, while there will be nothing printed on console.
 * @returns {Promise} - emptyPromise
 */
module.exports.catchIgnore = function catchIgnore() {
  return Promise.resolve();
};

/**
 * Returns difference between two arrays (Delta comparing).
 * However, only items that a have but not in b will be returned. See example for a better
 * explain.
 *
 * @example
 * utils.diff([1, 2, 3], [3, 4, 5]); // Returns [1, 2], but not [1, 2, 4, 5]
 *
 * @param {Array} a - One of the arrays to be compaired.
 * @param {Array} b - The other array to be compaired.
 * @see http://stackoverflow.com/questions/1187518/javascript-array-difference
 */
module.exports.diff = function (a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) < 0;
  });
}

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
}

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

/**
 * Create a Email content following the RFC2822 format. (The one used by Gmail)
 * This function can only create plain text email.
 * (i.e. No email with attachment or using HTML)
 *
 * @param {String} from_ - Sender of the email. Optional (Ignore this using null).
 * @param {String} to - Receiver of the email.
 * @param {String} subject - Subject of the email.
 * @param {String} body - Text content of the email.
 * @returns {String} - Base64 encoded email message.
 */
module.exports.makeEmail = function (from_, to, subject, body) {
  let lines = [
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    'Content-Transfer-Encoding: 8bit',
    (from_) ? `from: ${from_}` : '',
    `to: ${to}`,
    `subject: ${subject}`,
    '',
    body
  ];

  let mail = lines.join('\r\n').trim();
  return new Buffer(mail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
};
