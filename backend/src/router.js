'use strict';

let Router = require('named-routes');
let router = new Router();

module.exports = function (app, handlers) {
  // Use named-routes for routing instead of express one.
  router.extendExpress(app);
  router.registerAppHelpers(app);

  if (app.get('env') === 'development') {
    app.get('/dev', 'dev.index', handlers.dev.index);
    app.get('/dev/session', 'dev.session.show', handlers.dev.session.show);
    app.get('/dev/session/destroy', 'dev.session.destroy', handlers.dev.session.destroy);
    app.get('/dev/session/flash', 'dev.session.flash', handlers.dev.session.flash);
    app.get('/dev/db/users', 'dev.db.users', handlers.dev.db.users);
    app.get('/dev/db/users/drop', 'dev.db.users.drop', handlers.dev.db.users.drop);
    app.get('/dev/gapi/revoke', 'dev.gapi.revoke', handlers.dev.gapi.revoke);
    app.get('/dev/render/:template', 'dev.render', handlers.dev.render);
  }

  app.get('/', 'root.index', handlers.root.index);
  app.get('/login', 'root.login', handlers.root.login);
  app.get('/oauth2callback', 'root.googleCallback', handlers.root.googleCallback);

  app.use('/user', handlers.root.user.middleware);
  app.get('/user', 'root.user', handlers.root.user.get);
  app.post('/user', handlers.root.user.post);
  app.delete('/user', handlers.root.user.delete);

  app.get('/logout', 'root.logout', handlers.root.logout);
  app.get('/418', 'root.troll', handlers.root.troll);

  if (app.get('env') !== 'development') {
    app.use('/mana', handlers.mana.middleware);
  }
  app.get('/mana', 'mana.index', handlers.mana.index);
  app.get('/mana/:user', 'mana.getUser', handlers.mana.getUser);
  app.post('/mana/:user', 'mana.postUser', handlers.mana.postUser);
};
