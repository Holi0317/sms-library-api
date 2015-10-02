'use strict';

let express = require('express');
let router = express.Router();

let google = require('googleapis');
let config = require('../config');
let models = require('../models');

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
  // Callback Hell >.> . I promise I will promise when Google promise this.
  try {
    oauth2client.getToken(req.query.code, function getGoogleId (err, tokens) {
      if (err) throw err;

      req.session.tokens = tokens;
      let plus = google.plus('v1');
      oauth2client.setCredentials(tokens);

      plus.people.get({userId: 'me', auth: oauth2client}, function writeDB(err, response) {
        if (err) throw err;

        req.session.name = response.displayName;
        req.session.googleId = response.id;

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
        .exec(function goToMain (err) {
          if (err) throw err;
          return res.redirect('../../ui?oauth=success');
        });
      });

    });
  } catch (e) {
    res.redirect('../../ui?oauth=fail');
    throw e;
  }

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
  res.send('NYI');
});

router.get('/logout', (req, res) => {
  res.send('NYI');
});

module.exports = router;
