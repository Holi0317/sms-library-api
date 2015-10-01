let express = require('express');
let router = express.Router();

router.get('/oauth2callback', function (req, res) {
  // OAUTH2 callback
  res.send('NYI');
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
