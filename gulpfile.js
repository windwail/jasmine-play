var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');
protractor = require("gulp-protractor").protractor;

var webdriver_update = require("gulp-protractor").webdriver_update;

// Downloads the selenium webdriver
gulp.task('webdriver-update', webdriver_update);

var webserver = require('gulp-webserver');

var http = require('http');

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

gulp.task('webserver', function () {
    var stream = gulp.src(['./app'])
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: true,
            middleware: function(req, res, next) {
                if (/_kill_\/?/.test(req.url)) {
                    res.end();
                    stream.emit('kill');
                }
                next();
            }
        }));
});

gulp.task('webserver-stop', function (cb) {
    http.request('http://localhost:8000/_kill_').on('close', cb).end();
});

// Setting up the test task
gulp.task('e2e', function(done) {
    var args = ['--baseUrl', 'http://127.0.0.1:8000'];
    gulp.src(["./tests/*.js"])
        .pipe(protractor({
            configFile: "protractor-headless.conf.js",
            args: args
        }))
        .on('error', function(e) { throw e; });
});

gulp.task('default', ['webserver', 'e2e', 'webserver-stop'], function(callback) {callback();});


// == TASKS ========

