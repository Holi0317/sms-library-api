declare module 'named-routes' {
  import express = require('express');
  class Router {
    constructor()
    extendExpress(app: express.Application): void;
    registerAppHelpers(app: express.Application): void;
  }
  const RouterType: typeof Router;
  export = RouterType;
}