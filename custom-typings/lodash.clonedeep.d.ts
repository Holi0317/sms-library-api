declare module 'lodash.clonedeep' {
  import _ = require('lodash');
  const cloneDeep: typeof _.cloneDeep;
  export = cloneDeep;
}