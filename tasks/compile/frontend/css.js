'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');

gulp.task('compile:frontend:css', () => {
  return gulp.src('frontend/app/styles/*.scss')
    .pipe(sass({
      includePaths: [
        'frontend/',
        'frontend/node_modules',
        'frontend/node_modules/bootstrap-sass/assets/stylesheets'],
      outputStyle: 'expanded'
    })).on('error', sass.logError)
    .pipe(postcss([
      require('postcss-cssnext')()
    ]))
    .pipe(gulp.dest('frontend/.tmp/styles'));
});