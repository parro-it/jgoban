/*
 * jgoban
 * https://github.com/parroit/jgoban
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';


var $ = require('gulp-load-plugins')({
    lazy: true
});
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('build', ['copy-index', 'build-js', 'build-styles']);

function guard(plugin) {
    plugin.on('error', gutil.log);
    return plugin;
}

gulp.task('build-js', function() {

    return gulp.src('./lib/jgoban.js')
        .pipe($.sourcemaps.init())
        .pipe($.pureCjs({
            output: 'jgoban.js',
            exports: 'jgoban'
        }).on('error', gutil.log))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-img', function() {
    var spritesmith = require('gulp.spritesmith');
    var spriteData = gulp.src('assets/img/normal/*.png').pipe(spritesmith({
        imgName: 'jgoban.png',
        cssName: 'img.css'
    }));
    spriteData.img.pipe(gulp.dest('dist'));
    spriteData.css
        .pipe($.rename('img.less'))
        .pipe(gulp.dest('assets/styles'));

    gulp.src('assets/img/*.jpg').pipe(gulp.dest('dist'));
});

gulp.task('build-styles', function() {
    return gulp.src('./assets/jgoban.less')
        .pipe($.sourcemaps.init())
        .pipe(guard($.less()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist'));


});


gulp.task('copy-index', function() {
    return gulp.src('./assets/index.html', {
            base: './assets'
        })
        .pipe(gulp.dest('./dist'));
});

gulp.task('test', function() {
    return gulp.src('./test/*.js')
        .pipe($.mocha({
            ui: 'bdd',
            reporter: 'spec'
        }));
});

gulp.task('watch-test', function() {
    return gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});

gulp.task('watch-build', function() {
    return gulp.watch(['./lib/**/*.js', './test/**/*.js', './assets/**/*.*'], ['build']);
});

gulp.task('default', ['test', 'watch']);
gulp.task('dev', ['watch-build'], $.serve(process.cwd()));
