var gulp = require('gulp'),
  concat = require('gulp-concat'),
  jshint = require('gulp-jshint'),
  runSequence = require('run-sequence'),
  del = require('del'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  annotate = require('gulp-ng-annotate'),
  templateCache = require('gulp-angular-templatecache');


// PATHS
var pathToJsSource = ['src/index.js','src/**/*.js'];

gulp.task('default', ['build'], function () {
});


gulp.task('buildJs', function () {
  gulp.src(pathToJsSource)
    .pipe(sourcemaps.init())
    .pipe(concat('angular-persona-jwt.js'))
    .pipe(annotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});


gulp.task('watchSource', function () {
  gulp.watch(pathToJsSource, ['buildJs', 'lint']);
});


gulp.task('lint', function () {
  gulp.src(pathToJsSource)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


gulp.task('build', function () {
    runSequence(
      'cleanDistFolder',
      'buildJs'
    );
  }
);

gulp.task('cleanDistFolder', function (cb) {
  del('dist', cb);
});
