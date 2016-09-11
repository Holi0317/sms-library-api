'use strict';

let gulp = require('gulp');
let del = require('del');
let {join} = require('path');

gulp.task('clean', del.bind(null, [join(__dirname, '../.tmp'), join(__dirname, '../static')]));