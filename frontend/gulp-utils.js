'use strict';

let gulp = require('gulp');
let {join} = require('path');

module.exports = {
  gulp: gulp,
  join: (...args) =>
    join(__dirname, ...args)
};