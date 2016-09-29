'use strict';

let gulp = require('gulp');
let path = require('path');

function join(...args) {
  return path.join(__dirname, '../../', ...args);
}

gulp.task('copy:backend-view', () => {
  return gulp.src(join('src/views/**/*.jade'))
    .pipe(gulp.dest(join('lib/views/')));
});