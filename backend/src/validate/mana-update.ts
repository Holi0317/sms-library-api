import * as cloneDeep from 'lodash.clonedeep';
import * as validate from 'validate.js';

import {constraints as _constraints, afterValidate} from './user-update';
import {validateErrorHandle} from '../utils';
export let constraints = cloneDeep(_constraints);

constraints.isAdmin = {
  type: 'boolean',
  presence: true
};

export default function(data, googleId) {
  return validate.async(data, constraints, {format: 'flat'})
  .catch(validateErrorHandle)
  .then(afterValidate(data, googleId));
}

module.exports._constraints = constraints;
