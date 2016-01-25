/**
 * Validator for updating user profile from mana page.
 *
 * @module sms-library-helper/validate/user-update
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 */

'use strict';

let cloneDeep = require('lodash.clonedeep');
let validate = require('validate.js');
let Promise = require('bluebird');

let _userUpdate = require('./user-update');
let constraints = cloneDeep(_userUpdate);

constraints.isAdmin = {
  type: 'boolean',
  presence: true
};

module.exports = function(data) {
  return validate.async(data, constraints, {format: 'flat'})
  .catch(err => {
    let newError = new Error(err.join(';\n'));
    return Promise.reject(newError);
  })
}

module.exports._constraints = constraints;
