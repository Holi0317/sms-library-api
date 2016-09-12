'use strict';

let {gulp, join} = require('../../gulp-utils');
let gutil = require('gutil');
let webpack = require('webpack');

gulp.task('compile:js', cb => {
  webpack({
    entry: join('app/scripts/entry.js'),
    module: {
      loaders: [
        { test: /\.js$/, loader: 'babel?cacheDirectory', exclude: /(?:node_modules)/ }
      ]
    },
    output: {
      filename: 'bundle.js',
      path: join('.tmp/scripts')
    },
    resolve: {
      extensions: ['', '.js'],
      modulesDirectories: [join('node_modules')]
    },
    resolveLoader: {
      root: join('node_modules')
    }
  }, (err, stats) => {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    cb();
  });
});