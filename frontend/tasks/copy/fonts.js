'use strict';

let gulp = require('gulp');
let flatten = require('gulp-flatten');

gulp.task('copy:fonts', () => {
  return gulp.src(['bower_components/**/*.{woff2,woff,ttf}', 'node_modules/**/*.{woff2,woff,ttf}'])
    .pipe(flatten())
    .pipe(gulp.dest('frontend/.tmp/fonts'))
    .pipe(gulp.dest('frontend/static/fonts'));
});