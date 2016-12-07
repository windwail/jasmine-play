var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');
var gulpProtractorAngular = require('gulp-angular-protractor');

// == PATH STRINGS ========

var paths = {
    scripts: ['./src/app/**/*.js', '!./src/app/**/*.async.js'],
    styles: './src/**/*.css',
    images: './src/images/**/*',
    index: './src/*.html',
    partials: ['./src/app/**/*.html'],
    distDev: './src/vendor',
    distProd: './prod',
    distSrc: './src',
    distAppSrc: './src/app',
    distScriptsProd: './prod/scripts',
    scriptsDevServer: 'devServer/**/*.js'
};

var moduleName = "jasmine-play";

// == PIPE SEGMENTS ========

// Setting up the test task
gulp.task('protractor', function(callback) {
    gulp
        .src(['example_spec.js'])
        .pipe(gulpProtractorAngular({
            'configFile': 'protractor-headless.conf.js',
            'debug': false,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', callback);
});

// == TASKS ========

