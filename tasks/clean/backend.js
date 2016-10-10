'use strict';

let gulp = require('gulp');
let del = require('del');

gulp.task('clean:backend', del.bind(null, ['backend/lib']));