'use strict';

// Development routes
let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
  res.json({'message': 'Development mode is enabled', 'enabled': true});
});

module.exports = router;
