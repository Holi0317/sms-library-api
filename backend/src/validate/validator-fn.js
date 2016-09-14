/**
 * Create and register function validator for validate.js.
 *
 * @module sms-library-helper/validate/validator-fn
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires validate.js
 *
 * @example
require('validator-fn');  // Only needs to require it.
let constraints = {
  foo: {
    fn: [function(value, options, key, attributes, globalOptions) {return null}]
  }
}
 */

'use strict';

let validate = require('validate.js');

/**
 * Using function(s) as validator. This method is identiical to validator.js custom validator API.
 *
 * Functions must be contained in an array.
 * However, parameters that passed into option attribute is always an array.
 *
 * @see {@link https://validatejs.org/#custom-validator}
 * @returns {null} - All function returns null or undefined.
 * @returns {[]string} - One or more functions returns object that is not undefined nor null.
 */
validate.validators.fn = function(value, options, key, attributes, globalOptions) {
  let result = [];
  let failed = false;

  for (let fn of options) {
    let res = fn(value, options, key, attributes, globalOptions);
    if (!(res === null || res === undefined)) {
      failed = true;
      result.push(res);
    }
  }

  if (failed) {
    return result;
  } else {
    return null;
  }
};

module.exports = validate.validators.fn;
