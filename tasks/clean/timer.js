'use strict';

let gulp = require('gulp');
let del = require('del');

gulp.task('clean:timer', del.bind(null, ['timer/lib']));