'use strict';

let {gulp, join} = require('../../gulp-utils');
let flatten = require('gulp-flatten');

gulp.task('copy:fonts', () => {
  return gulp.src(join('node_modules/**/*.{woff2,woff,ttf}'))
    .pipe(flatten())
    .pipe(gulp.dest(join('.tmp/fonts')))
    .pipe(gulp.dest(join('static/fonts')));
});