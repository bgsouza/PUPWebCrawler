const gulp = require('gulp');
const shell = require('gulp-shell');
const del = require('del');

gulp.task('clean', () => {
  return del(['bin'])
})

gulp.task('start', shell.task('npm start'));

gulp.task('tsc', shell.task('tsc -w -p .'));

gulp.task('dev', ['tsc', 'start']);
