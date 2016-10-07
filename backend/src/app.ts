import {join} from 'path';
import * as express from 'express';
import {Application, Request, Response} from './IExpress';
import {ExpressError} from './utils';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo';
let MongoStore = connectMongo(session);

import {SetRouter} from './router';
import {config} from './config';

export let app = express() as Application;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(helmet());
// Render engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'jade');

switch (app.get('env')) {
  case 'development':
    app.set('json spaces', 4);
    app.locals.pretty = true;
    break;
  case 'production':
    app.use(express.static('../frontend/static'));
}

// Session
let sess: session.SessionOptions = {
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  name : 'sessionId',
  cookie: {
    maxAge: 8.64e+7, // 1 day
  },
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
  sess.store = new MongoStore({ mongooseConnection: config.conn });
}
app.use(session(sess));

app.use((req: Request, res: Response, next) => {
  res.locals.session = req.session;
  req.logined = Boolean(req.session.tokens);
  res.locals.logined = req.logined;
  res.locals.env = app.get('env');
  res.locals.staticPath = app.mountpath;
  next();
});

// Routes
SetRouter(app);
app.get('*', function(req, res) {
  res.status(404).render('error', {code: 404, message: 'Page not found'});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new ExpressError('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err: ExpressError, req: Request, res: Response) {
    console.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err: ExpressError, req: Request, res: Response) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
