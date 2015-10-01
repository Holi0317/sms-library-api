'use strict';

// Development routes
let express = require('express');
let router = express.Router();

let models = require('../models');

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

module.exports = router;
