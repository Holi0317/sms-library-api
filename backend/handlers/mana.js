/**
 * Mana(gement) page handler.
 * Called as mana. Because I like magic ;p.
 *
 * @module sms-library-helper/handlers/api
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 */

'use strict';

let Promise = require('bluebird');

let config = require('../../config');
let models = require('../models');
let utils = require('../utils');
let validateUser = require('../validate/user-update');
let promisify = require('../promisify');

/**
 * Check if user is qualified for accessing the mana page.
 * Return a 404 page is user is not qualified.
 */
module.exports.middleware = function (req, res, next) {
  // Reject if not logined.
  if (!req.logined) {
    return res.status(404).render('error', {code: 404, message: 'Page not found'});
  }

  // Populate user from database.
  models.user.findOne({
    googleId: req.session.googleId
  })
  .then(result => {
    if (result.googleId === config.adminID) {
      result.isAdmin = true
    }
    if (!result.isAdmin) {
      res.status(404).render('error', {code: 404, message: 'Page not found'});
      throw new utils.BreakSignal();
    }
    return result.save();
  })
  .then(() => {
    next();
    return Promise.resolve();
  })
  .catch(err => {
    if (err instanceof utils.BreakSignal) {
      return;
    } else {
      throw err;
    }
  })
};

/**
 * Query from database and render management page.
 */
module.exports.index = function (req, res) {
  models.user.find()
  .sort({
    googleId: -1
  })
  .then(result => {
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
module.exports.getUser = function (req, res) {
  let databaseRes;
  models.user.findOne({
    googleId: req.params.user
  })
  .then(result => {
    if (!result) {
      res.render('mana-no-user');
      throw new utils.BreakSignal();
    }
    result.logs.sort((a, b) => {
      return b.time - a.time;
    });
    databaseRes = result;

    let oauth2client = utils.oauth2clientFactory();
    oauth2client.setCredentials(result.tokens);

    return promisify.plusPeopleGet({userId: 'me', auth: oauth2client});
  })
  .then(googleRes => {
    res.render('mana-user', {data: databaseRes, name: googleRes.displayName});
  })
  .catch(err => {
    if (err instanceof utils.BreakSignal) {
      return
    } else {
      res.status(500).render('error');
    }
  })
}

/**
 * Edit user data, by the command of magic/mana.
 */
module.exports.postUser = function(req, res) {
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  let body = req.body;

  validateUser(body, req.params.user)
  .catch(err => {
    res.status(400).json({
      message: err.message,
      ok: false
    });
    throw new utils.BreakSignal();
  })
  .then(() => {
    let message = new models._Log('An admin has changed your configuration.', 'WARN');

    return models.user.findOneAndUpdate({
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
  .then(DBres => {
    if (!DBres) {
      res.status(404).json({
        message: 'No such user.',
        ok: false
      });
      throw new utils.BreakSignal();
    }
    res.status(202).json({
      message: 'Data has been overridden.',
      ok: true
    });
    return Promise.resolve();
  })
  .catch(err => {
    if (!err instanceof utils.BreakSignal) {
      res.status(500).json({
        message: 'Internal server error.',
        ok: false
      });
    }
    return Promise.resolve();
  });
}
