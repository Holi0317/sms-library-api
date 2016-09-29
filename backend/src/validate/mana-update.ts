import * as cloneDeep from 'lodash.clonedeep';
import * as validate from 'validate.js';

import {constraints as _constraints, afterValidate} from './user-update';
export let constraints = cloneDeep(_constraints) as any;

constraints.isAdmin = {
  type: 'boolean',
  presence: true
};

export default async function(data, googleID) {
  try {
    await validate.async(data, constraints, {format: 'flat'});
  } catch (err) {
    throw new Error(err.join(';\n'));
  }
  await afterValidate(data, googleID);
}