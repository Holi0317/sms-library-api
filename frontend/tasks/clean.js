'use strict';

let {gulp, join} = require('../gulp-utils');
let del = require('del');

gulp.task('clean:frontend', del.bind(null, [join('.tmp'), join('static'), join('nginx.conf')]));