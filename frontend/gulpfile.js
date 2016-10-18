'use strict';

let gulp = require('gulp');
let requireDir = require('require-directory');

requireDir(module, './tasks');

gulp.task('default', ['build:frontend']);