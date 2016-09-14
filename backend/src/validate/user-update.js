/**
 * Validator for updating user profile.
 *
 * @module sms-library-helper/validate/user-update
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 * @requires validate.js
 */

'use strict';

let validate = require('validate.js');
let Promise = require('bluebird');
require('./validator-fn');
require('./validator-type');

let library = require('../library');
let models = require('../models');
let utils = require('../utils');

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
function requireKey(reqKey) {
  return function(value, options, key, attributes) {
    if (attributes.renewEnabled === false) return;

    if (!reqKey) return;
    if (attributes[reqKey] === false) return;

    if (!value) return `is required as ${reqKey} is true.`;
    return;
  };
}

const constraints = {
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
 * @param {string} googleId - Google ID of the user. Used to check dupe login ID.
 * @returns {function->Promise} - Promise to be chained after validate.js.
 * @throws {error} - Library login/password is incorrect.
 * @throws {error} - Duplicate user ID found in database.
 */
let afterValidate = function(data, googleId) {

  function checkLogin() {
    if (data.renewEnabled) {
      let userLibrary = new library();
      return userLibrary.checkLogin(data.libraryLogin, data.libraryPassword);
    } else {
      return Promise.resolve()
    }
  }

  function makeCheckDupe() {
    if (!data.libraryLogin) {
      return Promise.resolve();
    }

    return models.user.find({
      libraryLogin: data.libraryLogin,
      googleId: {
        $ne: googleId
      }
    });
  }

  function checkDupe(res) {
    if (!data.libraryLogin) {
      return Promise.resolve();
    }

    if (res.length) {
      // Dupe login ID found.
      throw new Error('Duplicate user ID found in Database. Did you register in the past?');
    }
  }

  return function() {
    return Promise.resolve()
    .then(checkLogin)
    .then(makeCheckDupe)
    .then(checkDupe);
  }
}

/**
 * Validate user post data.
 * Will check if data is valid, can login into library and if there is duplicate ID.
 *
 * @param {object} data - Data to be validated.
 * @param {string} googleId - Google ID of the user. For querying DB for dupe ID.
 * @returns {Promise}
 * @throws {error} - Validation failed because of various reasons. Human-readable
 * reason is in error.message.
 */
module.exports = function(data, googleId) {
  return validate.async(data, constraints, {format: 'flat'})
  .catch(utils.validateErrorHandle)
  .then(afterValidate(data, googleId));
}

module.exports._constraints = constraints;
module.exports._afterValidate = afterValidate;
