var gulp = require('gulp'),
    concat = require('gulp-concat-util'),
    jshint = require('gulp-jshint'),
    runSequence = require('run-sequence'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    annotate = require('gulp-ng-annotate'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    refresh = require('gulp-livereload'),
    livereload = require('connect-livereload'),
    nodemon = require('gulp-nodemon'),
    ngDocs = require('gulp-ngdocs'),
    pkg = require('./package.json');


var livereloadport = 35729,
    serverport = 5200,
    header = ['/**',
        ' * '+pkg.name+' - '+pkg.description,
        ' * @version v'+ pkg.version,
        ' * @link '+pkg.homepage,
        ' * @license '+pkg.license,
        ' */',
        '(function(angular) {\'use strict\';\n'
    ].join('\n'),
    footer = '\n})(angular);\n';

// PATHS
var pathToJsSource = 'src/app/**/*.js',
    pathToDemoClientJsSource = 'src/demo/client/**/*.js',
    pathToDemoClientIndexFile = 'src/demo/client/index.html',
    pathToDemoServerSource = 'src/demo/server/**/*.js';


// DEV STATIC SERVER
var staticDevServer = express();
staticDevServer.use(livereload({port: livereloadport}));
staticDevServer.use(express.static('./src'));
staticDevServer.all('/*', function (req, res) {
    res.sendFile('demo/client/index.html', {root: 'src'});
});


// DEV
gulp.task('default', ['dev'], function () {
});

gulp.task('dev', [
    'lint',
    'buildDev',
    'startDemoStaticServer',
    'startDemoNodeServer',
    'watchSource'
], function () {
});

gulp.task('buildDev', [
    'concatJs'
], function () {
});

gulp.task('concatJs', function () {
    gulp.src(pathToJsSource)
        .pipe(sourcemaps.init())
        .pipe(concat('all-source.js', {process: function(src) { return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); }}))
        .pipe(concat.header(header))
        .pipe(concat.footer(footer))
        .pipe(annotate())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/build'))
        .pipe(refresh(lrserver));
});

gulp.task('startDemoStaticServer', function () {
    staticDevServer.listen(serverport);
    lrserver.listen(livereloadport);
});

gulp.task('startDemoNodeServer', function () {
    nodemon({script: 'src/demo/server/server.js'});
});

gulp.task('watchSource', function () {
    gulp.watch(pathToJsSource, ['concatJs', 'lint']);
    gulp.watch(pathToDemoClientJsSource, ['reloadIndex']);
    gulp.watch(pathToDemoClientIndexFile, ['reloadIndex']);
});

gulp.task('reloadIndex', function () {
    gulp.src(pathToDemoClientIndexFile)
        .pipe(refresh(lrserver));
});

gulp.task('lint', function () {
    gulp.src(pathToJsSource)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


// DIST
gulp.task('dist', [], function () {
        runSequence(
            'cleanBuildFolder',
            'cleanDistFolder',
            [
                'distJs',
                'distMinifiedJs'
            ]
        );
    }
);

gulp.task('cleanBuildFolder', function (cb) {
    del('src/build', cb);
});

gulp.task('cleanDistFolder', function (cb) {
    del('dist', cb);
});

gulp.task('distJs', function () {
    gulp.src([pathToJsSource])
        .pipe(concat('angular-persona-jwt.js', {process: function(src) { return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); }}))
        .pipe(annotate())
        .pipe(concat.header(header))
        .pipe(concat.footer(footer))
        .pipe(gulp.dest('dist'));
});

gulp.task('distMinifiedJs', function () {
    gulp.src([pathToJsSource])
        .pipe(concat('angular-persona-jwt.min.js', {process: function(src) { return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); }}))
        .pipe(annotate())
        .pipe(uglify())
        .pipe(concat.header(header))
        .pipe(concat.footer(footer))
        .pipe(gulp.dest('dist'));
});

gulp.task('docs',function(){
    var options = {
        scripts: [pathToJsSource],
        html5Mode: true,
        animation: true,
        startPage: '/',
        title: "angular persona jwt",
        image: "https://login.persona.org/v/7ad3be635d/pages/i/persona-logo-wordmark.png"
    };
    gulp.src(pathToJsSource)
        .pipe(ngDocs.process(options))
        .pipe(gulp.dest('./docs'));
    var docsServer = express();
    docsServer.use(express.static('docs'));
    docsServer.all('/*', function (req, res) {
        res.sendFile('index.html', {root: 'docs'});
    });
    docsServer.listen('5000');
    console.log('documentation is now available at localhost:5000/api')
});