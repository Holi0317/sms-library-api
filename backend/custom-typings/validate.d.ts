declare module 'validate.js' {
  export let Promise: Promise;
  interface Options {

  }
  export function async(attributes: any, constraints: any, options?: Options): Promise<any>;
  export let validators: any;
}