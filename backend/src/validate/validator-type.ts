import * as validate from 'validate.js';

/**
 * Check if the type is valid. Wrap the type into a string as option.
 * A pipe (|) can be used if it can accept multiple type (or gate).
 * Does not apply magic like isArray. Because whatever.
 *
 * @see {@link https://validatejs.org/#custom-validator}
 * @returns {null} - Type is correct.
 * @returns {string} - Type is incorrect.
 */
export default function type(value: any, options: string) {

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

validate.validators.type = type;