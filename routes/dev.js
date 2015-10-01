'use strict';

// Development routes
let express = require('express');
let router = express.Router();

let google = require('googleapis');
let models = require('../models');
let config = require('../config');

router.get('/', (req, res) => {
  res.json({
    message: 'Development mode is enabled',
    enabled: true
  });
});

router.get('/session', (req, res) => {
  res.json(req.session);
});

router.get('/session/destroy', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({
        message: 'Error when destroying session'
      });
      throw err;
    }
    res.json({message: 'success'});
  })
});

router.get('/db/users', (req, res) => {
  models.user.find()
  .then((data) => {
    return res.json(data);
  })
  .catch((err) => {
    res.status(500).json({
      message: 'Error when quering users.'
    });
    throw err;
  });
});

router.get('/db/users/drop', (req, res) => {
  models.user.remove()
  .then(() => {
    return res.json({
      message: 'Dropped all data in user collection.'
    });
  })
  .catch((err) => {
    res.status(500).json({
      message: 'Error when dropping users.'
    });
    throw err;
  });
});

router.get('/gapi/revoke', (req, res) => {
  if (!req.session.tokens) {
    return res.json({
      message: 'Tokens not found'
    });
  }
  let oauth2client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUrl);
  oauth2client.setCredentials(req.session.tokens);
  oauth2client.revokeCredentials(() => {
    return res.json({
      message: 'Tokens revoked.'
    });
  });
});

module.exports = router;
