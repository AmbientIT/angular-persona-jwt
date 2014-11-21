var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    runSequence = require('run-sequence'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    annotate = require('gulp-ng-annotate'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    refresh = require('gulp-livereload'),
    livereload = require('connect-livereload');


var livereloadport = 35729,
    serverport = 5040;

// DEV SERVER
var devServer = express();
devServer.use(livereload({port: livereloadport}));
devServer.use(express.static('./src'));
devServer.all('/*', function (req, res) {
    res.sendFile('demo/client/index.html', {root: 'src'});
});

// PATHS
var pathToJsSource = 'src/app/**/*.js',
    pathToDemoClientJsSource = 'src/demo/client/**/*.js',
    pathToDemoClientIndexFile = 'src/demo/client/index.html';

// DEV
gulp.task('default', ['dev'], function () {
});

gulp.task('dev', [
    'buildDev',
    'startDevServer',
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
        .pipe(concat('all-source.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/build'))
        .pipe(refresh(lrserver));
});

gulp.task('startDevServer', function () {
    devServer.listen(serverport);
    lrserver.listen(livereloadport);
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
        .pipe(jshint.reporter('default'));
});


// DIST
gulp.task('dist', ['cacheTemplates'], function () {
        runSequence(
            'cleanBuildFolder',
            'cleanDistFolder',
            'cacheTemplates',
            [
                'distJs',
                'distMinifiedJs',
                'distStyle'
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
        .pipe(concat('angular-persona-jwt.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('distMinifiedJs', function () {
    gulp.src([pathToJsSource])
        .pipe(concat('angular-persona-jwt.min.js'))
        .pipe(annotate())
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});