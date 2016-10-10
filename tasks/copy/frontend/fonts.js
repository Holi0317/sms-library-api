'use strict';

let gulp = require('gulp');
let flatten = require('gulp-flatten');

gulp.task('copy:frontend:fonts', () => {
  return gulp.src('frontend/node_modules/**/*.{woff2,woff,ttf}')
    .pipe(flatten())
    .pipe(gulp.dest('frontend/.tmp/fonts'))
    .pipe(gulp.dest('frontend/static/fonts'));
});