'use strict';

let gulp = require('gulp');
let path = require('path');
let del = require('del');


function join(...args) {
  return path.join(__dirname, '../', ...args);
}

gulp.task('clean:timer', del.bind(null, [join('lib')]));