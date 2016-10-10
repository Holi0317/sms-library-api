'use strict';

let gulp = require('gulp');

gulp.task('copy:frontend', ['copy:frontend:css', 'copy:frontend:extras', 'copy:frontend:fonts', 'copy:frontend:js'], _ => _());