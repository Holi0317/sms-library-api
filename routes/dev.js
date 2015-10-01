'use strict';

// Development routes
let express = require('express');
let router = express.Router();

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

module.exports = router;
