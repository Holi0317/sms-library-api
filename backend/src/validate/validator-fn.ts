import * as validate from 'validate.js';

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
export function fn(value, options, key, attributes, globalOptions) {
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
}

validate.validators.fn = fn;