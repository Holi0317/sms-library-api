let gulp = require('gulp');
let nodemon = require('nodemon');

gulp.task('serve', ['compile', 'copy:view'], cb => {
  nodemon({
    script: 'startserver.js',
    watch: ['lib/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js pug'
  }).once('start', () => {
    cb();
  });

  gulp.watch('src/**/*.ts', ['compile']);
  gulp.watch('src/**/*.pug', ['copy:view']);

});