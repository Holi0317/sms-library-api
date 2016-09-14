/**
 * Create and register type validator for validate.js.
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
    type: String
  }
}
 */

'use strict';

let validate = require('validate.js');

/**
 * Check if the type is valid. Wrap the type into a string as option.
 * A pipe (|) can be used if it can accept multiple type (or gate).
 * Does not apply magic like isArray. Because whatever.
 *
 * @see {@link https://validatejs.org/#custom-validator}
 * @returns {null} - Type is correct.
 * @returns {string} - Type is incorrect.
 */
validate.validators.type = function(value, options) {

  let types = options.split('|');
  let valType = typeof value;

  for (let type of types) {
    if (typeof value === type) {
      // Type matched
      return;
    }
  }
  return `is expected to be a ${types.join(' or ')}, while ${valType} is received.`;
};

module.exports = validate.validators.type;
