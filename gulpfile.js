'use strict';

var deploy = require('gulp-gh-pages'),
    jsdoc = require('gulp-jsdoc'),
    gulp = require('gulp');

gulp.task('docs', function () {
    gulp.src(['index.js', 'README.md'])
        .pipe(jsdoc('./docs'));
});

gulp.task('deploy', function () {
    gulp.src('./docs/**')
        .pipe(deploy('git@github.com:floatdrop/connect-once.git'));
});

gulp.task('default', ['docs', 'deploy']);
