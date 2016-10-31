let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('build', cb => {
  runSequence(
    'clean',
    ['compile', 'copy:view', 'copy:js'],
    cb
  )
});