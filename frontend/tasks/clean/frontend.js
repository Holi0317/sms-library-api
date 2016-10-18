'use strict';

let gulp = require('gulp');
let del = require('del');

gulp.task('clean:frontend', del.bind(null, ['.tmp', 'static', 'nginx.conf']));