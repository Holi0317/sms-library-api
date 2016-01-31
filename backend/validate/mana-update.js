/**
 * Validator for updating user profile from mana page.
 *
 * @module sms-library-helper/validate/user-update
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires lodash.clonedeep
 * @requires validate.js
 */

'use strict';

let cloneDeep = require('lodash.clonedeep');
let validate = require('validate.js');

let _userUpdate = require('./user-update');
let utils = require('../utils');
let constraints = cloneDeep(_userUpdate);

constraints.isAdmin = {
  type: 'boolean',
  presence: true
};

module.exports = function(data, googleId) {
  return validate.async(data, constraints, {format: 'flat'})
  .catch(utils.validateErrorHandle)
  .then(_userUpdate._afterValidate(data, googleId));
}

module.exports._constraints = constraints;
