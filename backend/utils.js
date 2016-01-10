/**
 * Some utilities functions.
 * @module backend/utils
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
 */
module.exports.BreakSignal = function BreakSignal() {};

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
