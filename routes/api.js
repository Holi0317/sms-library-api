'use strict';

let express = require('express');
let router = express.Router();

let google = require('googleapis');
let config = require('../config');
let models = require('../models');


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

      let plus = google.plus('v1');
      oauth2client.setCredentials(tokens);
      req.session.tokens = tokens;

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

router.get('/user', function (req, res) {
  res.send('NYI');
});

router.post('/user', function (req, res) {
  res.send('NYI');
});

router.delete('/user', function (req, res) {
  res.send('NYI');
});

module.exports = router;
