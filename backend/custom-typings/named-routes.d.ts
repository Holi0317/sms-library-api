declare module 'named-routes' {
  import express = require('express');
  export class Router {
    extendExpress(app: express.Application): void;
    registerAppHelpers(app: express.Application): void;
  }
  export = Router
}