import * as Promise from 'bluebird';

import {config} from '../config';
import {UserModel, Log, LogLevels, UserDocument} from '../models';
import {BreakSignal, oauth2clientFactory} from '../utils';
import validateUser from '../validate/user-update';
let promisify = require('../promisify');

/**
 * Check if user is qualified for accessing the mana page.
 * Return a 404 page is user is not qualified.
 */
export function middleware(req, res, next) {
  // Reject if not logined.
  if (!req.logined) {
    return res.status(404).render('error', {code: 404, message: 'Page not found'});
  }

  // Populate user from database.
  UserModel.findOne({
    googleId: req.session.googleId
  })
  .then((result: UserDocument) => {
    if (result.googleId === config.adminID) {
      result.isAdmin = true
    }
    if (!result.isAdmin) {
      res.status(404).render('error', {code: 404, message: 'Page not found'});
      throw new BreakSignal();
    }
    return result.save();
  })
  .then(() => {
    next();
    return Promise.resolve();
  })
  .catch(err => {
    if (err instanceof BreakSignal) {
      return;
    } else {
      throw err;
    }
  })
}

/**
 * Query from database and render management page.
 */
export function index(req, res) {
  UserModel.find()
  .sort({
    googleId: -1
  })
  .then((result) => {
    res.render('mana', {
      data: {
        db: result,
        versions: process.versions,
        platform: process.platform,
        arch: process.arch
      }
    })
  });
}

/**
 * Query database, get user name from Google and render user management page.
 */
export function getUser(req, res) {
  let databaseRes;
  UserModel.findOne({
    googleId: req.params.user
  })
  .then((result: UserDocument) => {
    if (!result) {
      res.render('mana-no-user');
      throw new BreakSignal();
    }
    result.logs.sort((a: Log, b: Log) => {
      return b.time.getTime() - a.time.getTime();
    });
    databaseRes = result;

    let oauth2client = oauth2clientFactory();
    oauth2client.setCredentials(result.tokens);

    return promisify.plusPeopleGet({userId: 'me', auth: oauth2client});
  })
  .then(googleRes => {
    res.render('mana-user', {data: databaseRes, name: googleRes.displayName});
  })
  .catch(err => {
    if (err instanceof BreakSignal) {
      return
    } else {
      res.status(500).render('error');
    }
  })
}

/**
 * Edit user data, by the command of magic/mana.
 */
export function postUser(req, res) {
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  let body: UserDocument = req.body;

  validateUser(body, req.params.user)
  .catch(err => {
    res.status(400).json({
      message: err.message,
      ok: false
    });
    throw new BreakSignal();
  })
  .then(() => {
    let message = new Log('An admin has changed your configuration.', 'WARN');

    return UserModel.findOneAndUpdate({
      googleId: req.params.user
    }, {
      $set: {
        libraryLogin: body.libraryLogin,
        libraryPassword: body.libraryPassword,
        renewEnabled: body.renewEnabled,
        renewDate: body.renewDate,
        calendarName: body.calendarName,
        isAdmin: body.isAdmin
      },
      $push: {
        logs: message
      }
    });

  })
  .then((DBres: UserDocument) => {
    if (!DBres) {
      res.status(404).json({
        message: 'No such user.',
        ok: false
      });
      throw new BreakSignal();
    }
    res.status(202).json({
      message: 'Data has been overridden.',
      ok: true
    });
    return Promise.resolve();
  })
  .catch((err: any) => {
    if (!err instanceof BreakSignal) {
      res.status(500).json({
        message: 'Internal server error.',
        ok: false
      });
    }
    return Promise.resolve();
  });
}
