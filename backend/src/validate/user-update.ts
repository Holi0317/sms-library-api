import * as validate from 'validate.js';
import './validator-fn';
import './validator-type';

import Library from '../common/library';
import {User} from '../common/models';

validate.Promise = Promise;

/**
 * Validator function.
 * If key 'renewEnabled' is true, the following check will be conducted:
 * If the reqKey is true, value must not be false-ty (i.e. not undefined/null/''/0/NaN).
 * Otherwise, the check passes.
 *
 * @param {String} reqKey - The key to be required to be true.
 * @returns {function} - Checker function to be placed under 'fn' key of constraints.
 */
function requireKey(reqKey?: string) {
  return function(value, options, key, attributes) {
    if (attributes.renewEnabled === false) return;

    if (!reqKey) return;
    if (attributes[reqKey] === false) return;

    if (!value) return `is required as ${reqKey} is true.`;
    return;
  };
}

export const constraints = {
  renewEnabled: {
    type: 'boolean',
    presence: true
  },
  renewDate: {
    type: 'number',
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 2,
      lessThan: 14
    }
  },
  calendarEnabled: {
    type: 'boolean',
    presence: true
  },
  calendarName: {
    type: 'string|undefined',
    fn: [requireKey('calendarEnabled')]
  },
  libraryLogin: {
    type: 'string|undefined',
    fn: [requireKey()]
  },
  libraryPassword: {
    type: 'string|undefined',
    fn: [requireKey()]
  },
  emailEnabled: {
    type: 'boolean',
    presence: true
  },
  emailAddress: {
    type: 'string|undefined',
    fn: [requireKey('emailEnabled')],
    email: true
  }
};

/**
 * Post-validate.js validation checks.
 * This will check if library login is correct, if there is duplicate library login ID
 * in database.
 *
 * @private
 * @param {Object} data - Data to be validated, which has passed validate.js.
 * @param {string} googleID - Google ID of the user. Used to check dupe login ID.
 * @returns {Promise} - Promise to be chained after validate.js.
 * @throws {error} - Library login/password is incorrect.
 * @throws {error} - Duplicate user ID found in database.
 */
export async function afterValidate(data: any, googleID: string) {

  if (data.renewEnabled) {
    let userLibrary = new Library();
    await userLibrary.checkLogin(data.libraryLogin, data.libraryPassword);

    let res = await User.findAndCountAll({
      where: {
        libraryLogin: data.libraryLogin,
        googleID: {
          $ne: googleID
        }
      }
    });

    if (res > 0) {
      throw new Error('Duplicate user ID found in Database. Did you register in the past?');
    }
  }

}

/**
 * Validate user post data.
 * Will check if data is valid, can login into library and if there is duplicate ID.
 *
 * @param data - Data to be validated.
 * @param googleID - Google ID of the user. For querying DB for dupe ID.
 * @returns {Promise}
 * @throws {error} - Validation failed because of various reasons. Human-readable
 * reason is in error.message.
 */
export default async function userUpdate(data: any, googleID: string) {
  try {
    await validate.async(data, constraints, {format: 'flat'});
  } catch (err) {
    throw new Error(err.join(';\n'));
  }
  await afterValidate(data, googleID);
}