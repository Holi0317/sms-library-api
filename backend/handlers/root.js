/**
 * Main route for the whole program.
 * @module sms-library-helper/backend/handlers/dev
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires googleapis
 * @requires bluebird
 */

'use strict';

let google = require('googleapis');
let Promise = require('bluebird');

let models = require('../models');
let utils = require('../utils');
let validateUser = require('../validate/user-update');

/**
 * Express middleware that checks if user has logined. If not, redirect to login page.
 * @alias user.middleware
 */
function requireLogin(req, res, next) {
  if (!req.session.tokens) {
    // No token
    return res.redirect(req.app.namedRoutes.build('root.login'));
  } else {
    return next();
  }
}

/**
 * Query give googleID and returns data in database.
 *
 * @param {string} googleId - Google ID of user.
 * @returns {Promise} - Resolved value is a user schema queried from database.
 * @see {@link sms-library-helper/backend/models.schema}
 */
function getUserProfile(googleId) {
  return models.user.findOne({
    googleId: googleId
  })
  .select({
    id_: 0,
    tokens: 0,
    libraryPassword: 0,
    googleId: 0
  });
}

/**
 * Handles index logic.
 * If user is logined, query his/her information and then render user page.
 * Else, render welcome page.
 */
module.exports.index = (req, res) => {
  if (req.logined) {
    getUserProfile(req.session.googleId)
    .then(result => {
      result.logs.sort((a, b) => {
        return b.time - a.time;
      });
      return res.render('user', {user: result});
    })
    .catch(() => {
      return res.status(500).render('error');
    });
  } else {
    res.render('index');
  }
}


/**
 * Login page handler.
 * Generates a url for Google OAuth2 process and redirect user to that url.
 */
module.exports.login = (req, res) => {
  if (req.logined) {
    return res.redirect(req.app.namedRoutes.build('root.index'));
  }
  // Step1, get authorize url
  let oauth2client = utils.oauth2clientFactory();
  let authUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
  res.redirect(authUrl);
}

/**
 * Handles callback from Google OAuth2 process.
 * This will request for user's Google ID, their name and write into MongoDB.
 * Then redirect them to index page.
 * If any error occured, render auth-fail page.
 */
module.exports.googleCallback = (req, res) => {
  // OAUTH2 callback
  if (!req.query.code) {
    // Error occured. No code is responsed.
    return res.status(401).render('auth-fail');
  }

  let oauth2client = utils.oauth2clientFactory();

  // Step2, exchange code
  oauth2client.getTokenAsync(req.query.code)
  .then(function getGoogleId (tokens) {
    req.session.tokens = tokens;
    oauth2client.setCredentials(tokens);

    let plus = google.plus('v1');
    let getAsync = Promise.promisify(plus.people.get);

    return getAsync({userId: 'me', auth: oauth2client});
  })
  .then(function makeDBQuery(plusResponse) {
    req.session.name = plusResponse.displayName;
    req.session.googleId = plusResponse.id;

    return models.user.findOneAndUpdate({
      googleId: req.session.googleId
    }, {
      $setOnInsert: {
        tokens: req.session.tokens,
        googleId: req.session.googleId
      }
    }, {
      upsert: true
    })
  })
  .then((ret) => {
    if (ret === null) {
      // New user. Show greeting in flash.
    }
    return res.redirect(req.app.namedRoutes.build('root.index'));
  })
  .catch(err => {
    res.status(401).render('auth-fail');
    throw err;
  })
}

module.exports.user = {};
module.exports.user.middleware = requireLogin;

/**
 * Get handler for user.
 * Response with a 405(Not allowed).
 */
module.exports.user.get = (req, res) => {
  return res.status(405);
}

/**
 * Post handler for user route.
 * Only accept JSON request. If not, response with 406.
 * This will serialize data, update user's record in database and return result as JSON.
 */
module.exports.user.post = (req, res) => {
  // Update information
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  let body = req.body;  // Because I am too lazy to type.

  validateUser(body, req.session.googleId)
  .catch(err => {
    res.status(400).json({
      ok: false,
      message: err.message
    });
    throw new utils.BreakSignal();
  })
  .then(() => {
    let message = new models._Log('Changed user profile.');

    return models.user.findOneAndUpdate({
      googleId: req.session.googleId
    }, {
      $set: {
        libraryLogin: body.libraryLogin,
        libraryPassword: body.libraryPassword,
        renewEnabled: body.renewEnabled,
        renewDate: body.renewDate,
        calendarName: body.calendarName
      },
      $push: {
        logs: message
      }
    })
  })
  .then(doc => {
    if (doc) {
      return res.json({
        message: 'Successfuly updated data.',
        ok: true
      });
    } else {
      throw new Error('Document not found.');
    }
  })
  .catch(err => {
    if (err instanceof utils.BreakSignal) {
      // Break because of other factor than server error.
    } else {
      res.status(500).json({
        message: 'Server error.',
        ok: false
      });
    }
  });
}

/**
 * Delete method handler for user route.
 * Delete user from database, revoke their Google OAuth2 permission and clear session.
 */
module.exports.user.delete = (req, res) => {
  // Remove user
  let oauth2client = utils.oauth2clientFactory();
  oauth2client.setCredentials(req.session.tokens);
  let googleId = req.session.googleId;

  oauth2client.revokeCredentialsAsync()
  .then(() => {
    // Create drop db query
    return models.user.findOne({
      googleId: googleId
    })
    .remove();
  })
  .then(() => {
    return new Promise(function(resolve, reject) {
      // Express session cannot be promisify-ed by Bluebird. Donno why(Just me being lazy)
      // Quick and dirty promise wrapper for req.session.regenerate
      req.session.regenerate(err => {
        if (err) reject(err)
        else resolve();
      });
    });
  })
  .then(function response() {
    req.session.flash = 'Your account has been delected.';
    return res.json({
      message: 'Delection succeed.',
      ok: true
    });
  })
  .catch((err) => {
    req.session.flash = 'Cannot delete your account due to server issue.';
    res.status(500).json({
      message: 'Delection failed. Server error occured.',
      ok: false
    });
    throw err;
  });
}

/**
 * Logout handler.
 * Just clear session.
 */
module.exports.logout = (req, res) => {
  req.session.regenerate(err => {
    if (err) return res.status(500).render('error');
    req.session.flash = 'Logout succeed. Hope to see you in the future.';
    return res.redirect(req.app.namedRoutes.build('root.index'));
  });
}

/**
 * Troll.
 */
module.exports.troll = (req, res) => {
  return res.status(418).render('418');
}
