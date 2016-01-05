'use strict';

let express = require('express');
let logger = require('morgan');
let bodyParser = require('body-parser');
let helmet = require('helmet');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);

let routes = require('./routes/index');
let config = require('../config');

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(helmet());

switch (app.get('env')) {
  case 'development':
    app.use(express.static('.tmp'));
    app.use(express.static('app'));
    break;
  case 'production':
    app.use(express.static('static'));
}

// Render engine
app.set('views', './views');
app.set('view engine', 'jade');

// Session
let sess = {
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  name : 'sessionId',
  cookie: {
    maxAge: 8.64e+7 // 1 day
  }
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
  sess.store = new MongoStore({ url: config.sessionUrl });
}
app.use(session(sess));

app.use('/', routes);
if (app.get('env') === 'development') {
  app.use('/dev', require('./routes/dev'));
  app.set('json spaces', 4);
}
app.get('*', function(req, res){
  res.status(404).render('error', {code: 404, message: 'Page not found'});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
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
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
