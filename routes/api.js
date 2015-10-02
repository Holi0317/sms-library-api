'use strict';

let express = require('express');
let router = express.Router();

let google = require('googleapis');
let Promise = require('bluebird');
let config = require('../config');
let models = require('../models');

Promise.promisifyAll(google.auth.OAuth2.prototype);

function requireLogin(req, res, next) {
  if (!req.session.tokens) {
    // No token
    return res.redirect('login');
  } else {
    return next();
  }
}


router.get('/login', (req, res) => {
  // Step1, get authorize url
  let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
  let authUrl = oauth2client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/plus.me']
  });
  res.redirect(authUrl);
});

router.get('/oauth2callback', (req, res) => {
  // OAUTH2 callback
  if (!req.query.code) {
    // Error occured. No code is responsed.
    return res.redirect('../../ui?oauth=fail');
  }

  // Function is not passed through session. So......
  let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);

  // Step2, exchange code
  oauth2client.getTokenAsync(req.query.code)
  .then(function getGoogleId (tokens) {
    req.session.tokens = tokens[0];
    oauth2client.setCredentials(tokens[0]);

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
      update: {
        tokens: req.session.tokens,
        $setOnInsert: {
          googleId: req.session.googleId
        }
      }
    }, {
      new: true,
      upsert: true
    })
  })
  .then(function goToMain() {
    return res.redirect('../../ui?oauth=success');
  })
  .catch(err => {
    res.redirect('../../ui?oauth=fail');
    throw err;
  })
});

router.use('/user', requireLogin)

router.route('/user')
.get((req, res) => {
  // Return JSON for informations
  models.user.findOne({
    googleId: req.session.googleId
  })
  .populate('logs')
  .select({
    id_: 0,
    tokens: 0,
    libraryPassword: 0,
    googleId: 0
  })
  .then(result => {
    return res.json({
      name: req.session.name,
      renewEnabled: result.enabled,
      libraryLogin: result.libraryLogin || null,
      logs: result.logs
    });
  })
  .catch(() => {
    return res.status(500).json({
      message: 'Server error.'
    });
  });
})
.post((req, res) => {
  // Update information
  res.send('NYI');
})
.delete((req, res) => {
  // Remove user
  let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
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
    return res.json({message: 'Delection succeed.'});
  })
  .catch((err) => {
    res.status(500).json({message: 'Delection failed.'});
    throw err;
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({message: 'Server error.'});
    return res.json({
      message: 'Logout succeed.'
    });
  });
});

module.exports = router;
