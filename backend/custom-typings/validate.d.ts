declare module 'validate.js' {
  export let Promise: PromiseConstructor;
  interface Options {

  }
  export function async(attributes: any, constraints: any, options?: Options): Promise<any>;
  export let validators: any;
}