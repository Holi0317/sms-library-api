'use strict';

let gulp = require('gulp');
let del = require('del');

gulp.task('clean:frontend', del.bind(null, ['frontend/.tmp', 'frontend/static', 'frontend/nginx.conf']));