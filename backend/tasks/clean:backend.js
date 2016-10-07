'use strict';

let gulp = require('gulp');
let path = require('path');
let del = require('del');


function join(...args) {
  return path.join(__dirname, '../', ...args);
}

gulp.task('clean:backend', del.bind(null, [join('lib')]));