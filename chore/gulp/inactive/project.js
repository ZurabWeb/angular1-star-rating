/**
 * main.js
 *
 * This file requires following npm modules:
 * ``
 * npm install gulp gulp-run-sequence merge-stream gulp-inject --save-dev
 * ``
 *
 * This files bundles several tasks from the tasks folder
 *
 *
 */

'use strict';

var gulp = require('gulp'),
  helper = require('../helper'),
  merge = require('merge-stream'),
  runSequence = require('gulp-run-sequence');

var config = require('../config.js');

//////////////////


//For environment specific compilations prefix you command with $NODE_ENV="[EnvName]"
// ```
// NODE_ENV='staging' gulp project:compile
// ```
gulp.task('project:compile', ['project:copy'], function (done) {

  return runSequence(
    'images:copy', 'ionic-resources:copy',
    'env:compile', 'env:inject',
    'html:copy',
    'css:compile', 'css:inject',
    'bower:inject',
    'ts:compile',
    //removed because the injection order is broken. tihis is done manually in src/index.html
    /*'script:inject',*/
    done);

});


gulp.task('project:watch', ['ts:watch', 'css:watch', 'html:watch'], function (done) {
  return done();
});

gulp.task('project:optimize', function (done) {
  return runSequence('css:compile-optimize', 'css:inject-optimize', 'templatecache:compile', 'templatecache:inject', done);
});

gulp.task('project:build', function (done) {
  return runSequence('project:init', 'project:optimize', 'build:compile', done);
});

gulp.task('project:ship', function (done) {
  var bumpType = 'patch' || args.type;
  return runSequence('project:clean', 'version:bump-' + bumpType, 'project:build', 'project:copy-dist', done);
});


//clean all but lib folder in www
gulp.task('project:clean', function (done) {
  helper.log('delete all autogenerated files');
  return helper.clean([config.buildFolder + '**/*', '!' + config.buildFolder + 'lib/**'], done);
});

gulp.task('project:copy', function (done) {

  var merged = merge();

  merged.add(
    gulp.src(['./src/index.html'])
      .pipe(gulp.dest('./www'))
  );


  return merged;

});

gulp.task('project:copy-dist', function (done) {

  var merged = merge();

  merged.add(
    gulp.src(['./www/index.html'])
      .pipe(gulp.dest('./dist'))
  );

  merged.add(
    gulp.src(['./www/assets/**/*.bundle.*'])
      .pipe(gulp.dest('./dist/assets'))
  );

  return merged;

});