var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var Q = require('q');

var fs = require('fs'),
    protractor = require("gulp-protractor").protractor,
    http = require('http'),
    webserver = require('gulp-webserver'),
    KarmaServer = require('karma').Server,
    find = require('gulp-find'),
    webdriver_update = require("gulp-protractor").webdriver_update,
    gutil = require('gulp-util');

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
var moduleName = "uzedoApp";


// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 'angular.js']);
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
};

pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.renameNgModule = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.ngModuleRenamer({
            newModuleName: moduleName,
            showLogs: false
        }))
        .pipe(gulp.dest(paths.distAppSrc));
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
    return gulp.src(bowerFiles('**/*.js'))
        .pipe(plugins.order(['jquery.js', 'angular.js', 'angular-translate.js']))
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtVendorStylesDev = function() {
    return gulp.src(bowerFiles('**/*.css'))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtVendorScriptsProd = function() {
    return gulp.src(bowerFiles('**/*.js'))
        .pipe(pipes.orderedVendorScripts())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(paths.scriptsDevServer)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};


pipes.builtPartialsDev = function() {
    return pipes.validatedPartials()
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.ngHtml2js({
            moduleName: moduleName
        }));
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles);
};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.cssnano())
        .pipe(plugins.sourcemaps.write())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distProd));
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distDev + '/images/'));
};

pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distProd + '/images/'));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtIndexDev = function() {

    var orderedVendorScripts = pipes.builtVendorScriptsDev();

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var vendorStyles = pipes.builtVendorStylesDev();
    var appStyles = pipes.builtStylesDev();

    return pipes.validatedIndex()
        .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {relative: true}))
        .pipe(plugins.inject(vendorStyles, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(gulp.dest(paths.distSrc));
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: false, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.renameNgModule());
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.processedImagesProd());
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    del(paths.distDev, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});


gulp.task('webserver', function () {
    var stream = gulp.src(['.'])
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: false,
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
    gulp.src(["./test/e2e/*.js"])
        .pipe(protractor({
            configFile: "protractor.headless.conf.js",
            args: args
        }))
        .on('error', function(e) {
            http.request('http://localhost:8000/_kill_').on('close', done).end();
            throw e; })
        .on('success', function(e) {
            http.request('http://localhost:8000/_kill_').on('close', done).end();
            done();
        });
});

// Наблюдается проблемка с зависанием теста на 30 секундв после выполнения.
// Какие-то баги в карме и socket.io,
gulp.task('karma-test', function (done) {
    return new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

// Наблюдается проблемка с зависанием теста на 30 секундв после выполнения.
// Какие-то баги в карме и socket.io,
gulp.task('kt', function (done) {
    return new KarmaServer({
        configFile: __dirname + '/karma-unit.conf.js',
        singleRun: true
    }, done).start();
});

// Решение проблемы с зависанием на 30 секунд полсе теса. Баги в либах.
// https://github.com/karma-runner/karma/issues/1788
// https://github.com/karma-runner/gulp-karma/pull/23#issuecomment-232313832
gulp.task('karma-test-workaround', function(done) {
    var child_process = require('child_process');
    child_process.exec('karma start karma.conf.js', function (err, stdout){
        gutil.log(stdout);
        if (err) {
            throw new Error('There are test failures');
        }
        else {
            done();
        }
    });
});

// Downloads the selenium webdriver
gulp.task('webdriver-update', webdriver_update);

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-partials-dev', pipes.builtPartialsDev);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html and moves it to the dev environment
gulp.task('build-index-dev', pipes.builtIndexDev);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index-prod', pipes.builtIndexProd);

// builds a complete dev environment
gulp.task('build-app-dev', pipes.builtAppDev);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);



// default task builds for prod
gulp.task('d', ['clean-build-app-prod']);

// Web unit and end-to-end test
gulp.task('default', ['webserver', 'e2e', 'webserver-stop']);


