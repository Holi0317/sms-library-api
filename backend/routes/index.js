'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

const indexFile = path.join(__dirname, '..', 'dist', 'index.html');

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(indexFile);
});

router.use('/api', require('./api'))

module.exports = router;
