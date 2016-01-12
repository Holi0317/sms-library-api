module.exports = function (app, handlers) {
  if (app.get('env') === 'development') {
    app.get('/dev', handlers.dev.index);
    app.get('/dev/session', handlers.dev.session);
    app.get('/dev/session/destroy', handlers.dev.session.destroy);
    app.get('/dev/session/flash', handlers.dev.session.flash);
    app.get('/db/users', handlers.dev.db.users);
    app.get('/db/users/drop', handlers.dev.db.users.drop);
    app.get('/gapi/revoke', handlers.dev.gapi.revoke);
    app.get('/cron', handlers.dev.cron);
    app.get('/render/:template', handlers.dev.render);
  }

  app.get('/', handlers.root.index);
  app.get('/login', handlers.root.login);
  app.get('/oauth2callback', handlers.root.googleCallback);
  app.use('/user', handlers.root.user.middleware);
  app.get('/user', handlers.root.user.get);
  app.post('/user', handlers.root.user.post);
  app.delete('/user', handlers.root.user.delete);
  app.get('/logout', handlers.root.logout);
  app.get('/418', handlers.root.troll);
};
