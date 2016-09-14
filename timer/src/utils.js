/**
 * Some utilities functions.
 * @module sms-library-helper/backend/utils
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 */

'use strict';

let Promise = require('bluebird');

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
class BreakSignal extends Error{}
module.exports.BreakSignal = BreakSignal;

/**
 * Returns difference between two arrays (Delta comparing).
 * However, only items that a have but not in b will be returned. See example for a better
 * explain.
 *
 * @example
 * utils.diff([1, 2, 3], [3, 4, 5]); // Returns [1, 2], but not [1, 2, 4, 5]
 *
 * @param {Array} a - One of the arrays to be compared.
 * @param {Array} b - The other array to be compared.
 * @see http://stackoverflow.com/questions/1187518/javascript-array-difference
 */
module.exports.diff = function (a, b) {
  return a.filter(function(i) {
    return b.indexOf(i) < 0;
  });
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

  let mail = lines.join('\n');
  return new Buffer(mail).toString('base64');
};