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

validate.Promise = Promise;

function libraryCheck(value, options, key, attributes) {
  if (attributes.renewEnabled === false) {
    return
  }

  if (!value) {
    // Empty. Nooope
    return 'is required as renew is enabled.'
  }
  return
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
  calendarName: {
    type: 'string',
    presence: true
  },
  libraryLogin: {
    type: 'string|undefined',
    fn: [libraryCheck]
  },
  libraryPassword: {
    type: 'string|undefined',
    fn: [libraryCheck]
  }
};

module.exports = function(data) {
  return validate.async(data, constraints, {format: 'flat'})
    .catch(err => {
      let newError = new Error(err.join(';\n'));
      return Promise.reject(newError);
    })
}
