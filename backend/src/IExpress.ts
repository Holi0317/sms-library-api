import {Application as _App, Request as _Req, Response as _Res, ErrorRequestHandler, RequestHandler} from 'express-serve-static-core';
import {ExpressError} from './utils';

export interface Request extends _Req {
  session: any
  logined: boolean
  app: Application
}

export interface Response extends _Res {

}
export type Next = (err?: ExpressError) => void
type callback = (req: Request, res: Response, next?: Next) => void;
type UseCallback = (req: Request, res: Response, err?: ExpressError) => void;
type PathParams = string | RegExp | (string | RegExp)[];

export interface Application extends _App {
  get(path: string, name: string, callback: callback): void;
  get(path: string, callback: callback): void;
  get(name: string): any;

  post(path: PathParams, ...handlers: RequestHandler[]): this;
  post(path: PathParams, name: string, callback: callback): void;

  use(...handlers: RequestHandler[]): this;
  use(path: PathParams, ...handlers: RequestHandler[]): this;
  use(path: string, callback: callback): void;
  use(callback: callback | UseCallback | ErrorRequestHandler): void;

  mountpath: string;
  namedRoutes: {
    build(name: string): string
  }
}