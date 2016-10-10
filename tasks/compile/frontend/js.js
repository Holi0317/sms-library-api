'use strict';

let gulp = require('gulp');
let gutil = require('gutil');
let webpack = require('webpack');

gulp.task('compile:fronted:js', cb => {
  webpack({
    entry: 'frontend/app/scripts/entry.js',
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel?cacheDirectory', exclude: /(?:node_modules)/ }
      ]
    },
    output: {
      filename: 'bundle.js',
      path: 'frontend/.tmp/scripts'
    },
    resolve: {
      extensions: ['', '.js']
    }
  }, (err, stats) => {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    cb();
  });
});