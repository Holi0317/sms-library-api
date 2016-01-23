'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let del = require('del');
let browserify = require('browserify');
let browserSync = require('browser-sync').create();
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

const DIST = 'static';
const reload = browserSync.reload;

function styleTask(src, outputStyle) {
  let opt = {
    includePaths: ['.', 'bower_components', 'bower_components/bootstrap-sass/assets/stylesheets'],
    outputStyle: outputStyle
  };

  return gulp.src(src)
    .pipe($.sass(opt)).on('error', $.sass.logError)
    .pipe($.postcss([
      require('postcss-cssnext')()
    ]));
}

gulp.task('styles', () => {
  return styleTask('app/styles/*.scss', 'expanded')
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('styles:dist', () => {
  return styleTask('app/styles/*.scss', 'compressed')
    .pipe(gulp.dest(DIST + '/styles'));
});

gulp.task('js', () => {
  return gulp.src(['app/scripts/**/*.js', '!app/scripts/**/_*.js', '!app/scripts/entry.js'])
    .pipe($.babel())
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('js:browserify', () => {
  let b = browserify({
    entries: 'app/scripts/entry.js',
    paths: ['node_modules', 'bower_components']
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(DIST + '/images'));
});

gulp.task('fonts', () => {
  return gulp.src(['bower_components/**/*.{woff2,woff,ttf}', 'app/fonts/**/*'])
    .pipe($.flatten())
    .pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    '!app/.eslintrc'
  ], {
    dot: true
  }).pipe(gulp.dest(DIST));
});

gulp.task('clean', del.bind(null, ['.tmp', DIST]));

gulp.task('serve', ['styles', 'js', 'js:browserify', 'fonts', 'nodemon'], () => {

  browserSync.init({
    proxy: 'localhost:3002',
    port: 3000
  });

  gulp.watch('app/styles/*.scss', ['styles', reload]);
  gulp.watch('app/scripts/**/*.js', ['js', 'js:browserify', reload]);
});

gulp.task('nodemon', cb => {

  let started = false;

  return $.nodemon({
    script: 'startserver.js',
    watch: ['backend/', 'views/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js jade'
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  }).on('restart', () => {
    setTimeout(reload, 1000);
  });
});

gulp.task('test', () => {
  return gulp.src('test/test-*.js')
    .pipe($.mocha())
    .once('end', () => {
      process.exit();
    });
})

gulp.task('build', ['js', 'js:browserify', 'styles:dist', 'images', 'fonts', 'extras'], () => {
  return gulp.src('.tmp/**/*')
    .pipe($.if('*.js', $.uglify()))
    // CSS minification is done by sass
    .pipe(gulp.dest(DIST));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
