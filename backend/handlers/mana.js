/**
 * Mana(gement) page handler.
 * Called as mana. Because I like magic ;p.
 *
 * @module sms-library-helper/handlers/api
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires googleapis
 * @requires bluebird
 * @requires assert
 */

'use strict';

let google = require('googleapis');
let Promise = require('bluebird');

let config = require('../../config');
let libApi = require('../api');
let models = require('../models');
let utils = require('../utils');
let validateUser = require('../validate/user-update');

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
    req.user = result;
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
    databaseRes = result;

    let plus = google.plus('v1');
    let getAsync = Promise.promisify(plus.people.get);
    let oauth2client = utils.oauth2clientFactory();
    oauth2client.setCredentials(result.tokens);

    return getAsync({userId: 'me', auth: oauth2client});
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
 *
 */
module.exports.postUser = function(req, res) {
  let body = req.body;

  validateUser(body)
  .then(() => {
    if (body.renewEnabled) {
      let userLibrary = new libApi();
      return userLibrary.login(body.libraryLogin, body.libraryPassword);
    } else {
      return Promise.resolve()
    }
  })
  .catch(err => {
    req.session.flash = `[Error] form is invalid or library login/password is invalid. Message: ${err.message}`;
    res.redirect(req.app.namedRoutes.build('mana.index'));
    throw(new utils.BreakSignal());
  })
  .then(() => {
    return models.user.findOne({
      googleId: req.params.user
    })
  })
  .then(DBres => {
    if (!DBres) {
      res.render('mana-no-user');
      throw new utils.BreakSignal();
    }
    DBres.libraryLogin = body.libraryLogin;
    DBres.libraryPassword = body.libraryPassword;
    DBres.renewEnabled = body.renewEnabled;
    DBres.renewDate = body.renewDate;
    DBres.calendarName = body.calendarName;

    DBres.log('An admin has changed your configuration.', 'WARN');

    return DBres.save();
  })
  .then(() => {
    req.session.flash = 'Data has been overridden.'
    res.redirect(req.app.namedRoutes.build('mana.index'));
    return;
  })
  .catch(err => {
    if (!err instanceof utils.BreakSignal) {
      res.status(500).render('error');
    }
    return Promise.resolve();
  })
}
