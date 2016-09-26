import * as dev from './handlers/dev';
import * as mana from './handlers/mana';
import * as root from './handlers/root';
import * as Router from 'named-routes';
let router = new Router();

export function SetRouter (app: any) {
  // Use named-routes for routing instead of express one.
  router.extendExpress(app);
  router.registerAppHelpers(app);

  if (app.get('env') === 'development') {
    app.get('/dev', 'dev.index', dev.index);
    app.get('/dev/session', 'dev.session.show', dev.session.show);
    app.get('/dev/session/destroy', 'dev.session.destroy', dev.session.destroy);
    app.get('/dev/session/flash', 'dev.session.flash', dev.session.flash);
    app.get('/dev/db/users', 'dev.db.users', dev.db.users);
    app.get('/dev/db/users/drop', 'dev.db.users.drop', dev.db.users.drop);
    app.get('/dev/gapi/revoke', 'dev.gapi.revoke', dev.gapi.revoke);
    app.get('/dev/render/:template', 'dev.render', dev.render);
  }

  app.get('/', 'root.index', root.index);
  app.get('/login', 'root.login', root.login);
  app.get('/oauth2callback', 'root.googleCallback', root.googleCallback);

  app.use('/user', root.user.middleware);
  app.get('/user', 'root.user', root.user.get);
  app.post('/user', root.user.post);
  app.delete('/user', root.user.delete);

  app.get('/logout', 'root.logout', root.logout);
  app.get('/418', 'root.troll', root.troll);

  if (app.get('env') !== 'development') {
    app.use('/mana', mana.middleware);
  }
  app.get('/mana', 'mana.index', mana.index);
  app.get('/mana/:user', 'mana.getUser', mana.getUser);
  app.post('/mana/:user', 'mana.postUser', mana.postUser);
}