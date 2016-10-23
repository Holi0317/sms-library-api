let gulp = require('gulp');
let browserSync = require('browser-sync').create('slh');
let reload = browserSync.reload;

function deferReload(){
  setTimeout(reload, 2000);
}

gulp.task('serve', ['compile', 'copy:fonts'], () => {
  browserSync.init({
    proxy: 'localhost:3002',
    port: 3000,
    serveStatic: ['.tmp', 'app']
  });

  gulp.watch('app/styles/*.scss', ['compile:styles', deferReload]);
  gulp.watch('app/scripts/**/*.js', ['compile:js', deferReload]);
});