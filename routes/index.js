'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/ui');
});

router.get('/ui/*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

router.use('/api', require('./api'))

module.exports = router;
