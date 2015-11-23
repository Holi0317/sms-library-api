/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & Tools We'll Use
let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let del = require('del');
let runSequence = require('run-sequence');
let browserSync = require('browser-sync');
let reload = browserSync.reload;
let merge = require('merge-stream');
let path = require('path');
let fs = require('fs');
let glob = require('glob-all');
let historyApiFallback = require('connect-history-api-fallback');
let packageJson = require('./package.json');
let crypto = require('crypto');
// let ghPages = require('gulp-gh-pages');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

const DIST = 'dist';

var dist = (subpath) => {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = (stylesPath, srcs) => {
  return gulp.src(srcs.map(src => {
      return path.join('app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.cssmin())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = (src, dest) => {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = (src, dest) => {
  return gulp.src(src)
    // Replace path for vulcanized assets
    .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
    .pipe($.useref())
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  return styleTask('styles', ['**/*.css']);
});

gulp.task('elements', () => {
  return styleTask('elements', ['**/*.css']);
});

// Optimize images
gulp.task('images', () => {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', () => {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/cache-config.json',
    '!app/.eslintrc'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  var bower = gulp.src([
    'bower_components/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));

  var elements = gulp.src(['app/elements/**/*.html',
      'app/elements/**/*.css',
      'app/elements/**/*.js'
    ])
    .pipe(gulp.dest(dist('elements')));

  var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
    .pipe(gulp.dest(dist('elements/bootstrap')));

  var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
    .pipe(gulp.dest(dist('sw-toolbox')));

  var vulcanized = gulp.src(['app/elements/elements.html'])
    .pipe($.rename('elements.vulcanized.html'))
    .pipe(gulp.dest(dist('elements')));

  return merge(app, bower, elements, vulcanized, swBootstrap, swToolbox)
    .pipe($.size({
      title: 'copy'
    }));
});

// Copy web fonts to dist
gulp.task('fonts', () => {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest(dist('fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});

// Transpile all JS to ES5.
gulp.task('js', () => {
  return gulp.src(['app/**/*.{js,html}'])
    .pipe($.if('*.html', $.crisper())) // Extract JS from .html files
    .pipe($.if('*.js', $.babel({
      presets: ['es2015']
    })))
    .pipe(gulp.dest('.tmp/'))
    .pipe(gulp.dest(dist()));
});

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return optimizeHtmlTask(
    [dist('/**/*.html'), '!' + dist('/{elements,test}/**/*.html')],
    dist());
});

// Vulcanize granular configuration
gulp.task('vulcanize', () => {
  const DEST_DIR = dist('elements');
  return gulp.src(dist('elements/elements.vulcanized.html'))
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe($.minifyInline())
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({title: 'vulcanize'}));
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', callback => {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, (error, files) => {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', () => {
  return del(['.tmp', dist()]);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'elements', 'images', 'js'], () => {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: (snippet) => {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['app/**/*.html'], ['js', reload]);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
  gulp.watch(['app/{scripts,elements}/**/*.js'], ['js']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () => {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: (snippet) => {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    middleware: [ historyApiFallback() ]
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], cb => {
  runSequence(
    ['copy', 'styles'],
    ['elements', 'js'],
    ['images', 'fonts', 'html'],
    'vulcanize',
    cb);
});
