'use strict';

let express = require('express');
let google = require('googleapis');
let Promise = require('bluebird');
let assert = require('assert');
let config = require('../../config');
let libApi = require('../api');
let models = require('../models');
let router = express.Router();

Promise.promisifyAll(google.auth.OAuth2.prototype);

function requireLogin(req, res, next) {
  if (!req.session.tokens) {
    // No token
    return res.redirect('login');
  } else {
    return next();
  }
}

function oauth2clientFactory() {
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
}

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

function BreakSignal() {}

router.get('/', function(req, res) {
  if (req.session.tokens) {
    getUserProfile(req.session.googleId)
    .then(result => {
      return res.render('user', result);
    })
    .catch(() => {
      return res.status(500).render('error');
    });
  } else {
    res.render('index');
  }
});

router.get('/login', (req, res) => {
  if (req.session.tokens) {
    // Logined. Don't waste resources on these request = =
    return res.redirect('../');
  }
  // Step1, get authorize url
  let oauth2client = oauth2clientFactory();
  let authUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar', 'profile']
  });
  res.redirect(authUrl);
});

router.get('/oauth2callback', (req, res) => {
  // OAUTH2 callback
  if (!req.query.code) {
    // Error occured. No code is responsed.
    return res.status(401).render('auth_fail');
  }

  let oauth2client = oauth2clientFactory();

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
      tokens: req.session.tokens,
      $setOnInsert: {
        googleId: req.session.googleId
      }
    }, {
      upsert: true
    })
  })
  .then(function goToMain() {
    return res.redirect('../');
  })
  .catch(err => {
    res.status(401).render('auth_fail');
    throw err;
  })
});

router.use('/user', requireLogin);

router.route('/user')
.get((req, res) => {
  return res.status(405);
})


.post((req, res) => {
  // Update information
  if (!req.is('json')) {
    // Only accept JSON request
    return res.status(406).json({
      message: 'Only accept application/json body request',
      ok: false
    });
  }

  // Serialize
  let body = {
    libraryLogin: (req.body.renewEnabled) ? req.body.libraryLogin: '',
    libraryPassword: (req.body.renewEnabled) ? req.body.libraryPassword: '',
    renewEnabled: req.body.renewEnabled,
    renewDate: (req.body.renewDate) ? req.body.renewDate: 2
  };

  function errorHandle(err) {
    res.status(400).json({
      ok: false,
      message: err.message
    });
    throw(new BreakSignal());
  }

  new Promise(resolve => {
    // assertions for data checking
    assert(typeof body.renewEnabled === 'boolean', 'Renew enabled must be a boolean');
    assert(typeof body.renewDate === 'number', 'Renew date must be an integer');
    assert(body.renewDate >= 2 && body.renewDate < 14, 'Renew date must be an interger between 2 and 13, including both.');

    if (body.renewEnabled) {
      assert(typeof body.libraryLogin === 'string', 'Library login must be a string');
      assert(typeof body.libraryPassword === 'string', 'Library password must be a string');
    } else {
      assert(typeof body.libraryLogin === 'string' || typeof body.libraryLogin === 'undefined', 'Library login must either be a string or undefined.');
      assert(typeof body.libraryPassword === 'string' || typeof body.libraryPassword === 'undefined', 'Library password must either be a string or undefined.');
    }
    resolve();
  })
  .catch(errorHandle)
  .then(() => {
    if (body.renewEnabled) {
      let userLibrary = new libApi();
      return userLibrary.login(body.libraryLogin, body.libraryPassword);
    } else {
      return Promise.resolve()
    }
  })
  .catch(errorHandle)
  .then(() => {
    return models.user.findOne({
      googleId: req.session.googleId
    })
  })
  .then(result => {
    result.libraryLogin = body.libraryLogin || '';
    result.libraryPassword = body.libraryPassword || '';
    result.renewEnabled = body.renewEnabled || false;
    result.renewDate = body.renewDate || 2;

    return result.save()
  })
  .then(() => {
    return res.json({
      message: 'Successfuly updated data.',
      ok: true
    });
  })
  .catch(err => {
    if (err instanceof BreakSignal) {
      // Break because of other factor than server error.
    } else {
      res.status(500).json({
        message: 'Server error.',
        ok: false
      });
    }
  });
})


.delete((req, res) => {
  // Remove user
  let oauth2client = oauth2clientFactory();
  oauth2client.setCredentials(req.session.tokens);

  let session = Promise.promisifyAll(req.session);

  oauth2client.revokeCredentialsAsync()
  .then(function createDropQuery() {
    return models.user.findOne({
      googleId: session.googleId
    })
    .remove();
  })
  .then(session.destroyAsync())
  .then(function response() {
    return res.json({
      message: 'Delection succeed.',
      ok: true
    });
  })
  .catch((err) => {
    res.status(500).json({
      message: 'Delection failed. Server error occured.',
      ok: false
    });
    throw err;
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({
      message: 'Server error.',
      ok: false
    });
    return res.json({
      message: 'Logout succeed.',
      ok: true
    });
  });
});

module.exports = router;
