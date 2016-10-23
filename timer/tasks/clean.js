let gulp = require('gulp');
let del = require('del');

gulp.task('clean', del.bind(null, ['lib']));