import {Application as _App, Request as _Req, Response as _Res, IRouterMatcher, IRouterHandler} from 'express-serve-static-core';
import {ExpressError} from './utils';

export interface Request extends _Req {
  session: any
  logined: boolean
}

export interface Response extends _Res {

}

type callback = (req: Request, res: Response, next?: (err?: ExpressError) => void) => void;
type UseCallback = (req: Request, res: Response, err?: ExpressError) => void;
type PathParams = string | RegExp | (string | RegExp)[];

export interface Application extends _App {
  get(path: string, name: string, callback: callback): void;
  get(path: string, callback: callback): void;
  get(name: string): any;

  post: IRouterMatcher<this>;
  post(path: PathParams, name: string, callback: callback): void;

  use: IRouterHandler<this> & IRouterMatcher<this>;
  use(path: string, callback: callback): void;
  use(callback: callback | UseCallback): void;

  mountpath: string;
}