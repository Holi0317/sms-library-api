'use strict';

let {join} = require('path');
let gulp = require('gulp');
let gutil = require('gutil');
let webpack = require('webpack');

gulp.task('compile:js', cb => {
  webpack({
    entry: join(__dirname, '../../app/scripts/entry.js'),
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel?cacheDirectory', exclude: /(?:node_modules|bower_components)/ }
      ]
    },
    output: {
      filename: 'bundle.js',
      path: join(__dirname, '..', '..', '.tmp', 'scripts')
    },
    resolve: {
      extensions: ['', '.js'],
      modulesDirectories: ['node_modules', 'bower_components']
    }
  }, (err, stats) => {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    cb();
  });
});