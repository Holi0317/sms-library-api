const join = require('path').join;
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const router = require('./router');
const config = require('./common/config').config;

let app = express();
module.exports = app;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(helmet());
// Render engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

if (app.get('env') === 'development') {
  app.set('json spaces', 4);
  app.locals.pretty = true;
}

// Session
let sess = {
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  name : 'sessionID',
  cookie: {
    maxAge: 8.64e+7, // 1 day
  },
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
  sess.store = new SequelizeStore({
    db: config.sequelize
  });
}
app.use(session(sess));

app.use((req, res, next) => {
  res.locals.session = req.session;
  req.logined = Boolean(req.session.tokens);
  res.locals.logined = req.logined;
  res.locals.env = app.get('env');
  res.locals.staticPath = app.mountpath;
  next();
});

// Routes
router.SetRouter(app);
app.get('*', function(req, res) {
  res.status(404).render('error', {code: 404, message: 'Page not found'});
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err: {}
  });
});
