'use strict';

let {gulp, join} = require('../../gulp-utils');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');

gulp.task('compile:css', () => {
  return gulp.src(join('app/styles/*.scss'))
    .pipe(sass({
      includePaths: [join('.'), join('node_modules'), join('node_modules/bootstrap-sass/assets/stylesheets')],
      outputStyle: 'expanded'
    })).on('error', sass.logError)
    .pipe(postcss([
      require('postcss-cssnext')()
    ]))
    .pipe(gulp.dest(join('.tmp/styles')));
});