let gulp = require('gulp');
let nodemon = require('nodemon');

gulp.task('serve:backend', ['typescript', 'copy:view', 'copy:js'], cb => {
  nodemon({
    script: 'lib/backend/startserver.js',
    watch: ['lib/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js pug'
  }).once('start', () => {
    cb();
  });

  gulp.watch('src/**/*.ts', ['typescript']);
  gulp.watch('src/**/*.pug', ['copy:view']);
  gulp.watch('src/**/*.js', ['copy:js']);

});