/*
 * go-server
 * https://github.com/parroit/go-server
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var $ = loadPlugins({
    lazy: true
});

// Copy all static images
gulp.task('mocha', function() {
    return gulp.src('./test/*.js')
        .pipe($.mocha({
            globals: ['chai'],
            timeout: 6000,
            ignoreLeaks: false,
            ui: 'bdd',
            reporter: 'spec'
        }));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['mocha']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('test', ['mocha', 'watch']);
gulp.task('serve', function() {
    $.nodemon({
        script: 'index.js',
        ext: 'js',
        env: {
            'NODE_ENV': 'development'
        }

    });
});
