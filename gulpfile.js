var gulp = require('gulp');
var gutil = require('gulp-util');
var color = gutil.colors;

// Include Our Plugins
var bs = require('browser-sync');
var reload = bs.reload;
var compass = require('gulp-compass');
var paths = require('compass-options').paths();
var taskListing = require('gulp-task-listing');

console.log(paths);

//////////////////////////////
// Compass
//////////////////////////////
gulp.task('compass', function () {
  return gulp.src(paths.sass + '/**/*.scss')
    .pipe(compass({
      config_file: 'config.rb',
      bundle_exec: true,
      sourcemap: false,
      time: true,
      css: paths.css,
      sass: paths.sass,
      image: paths.img,
      fonts: paths.fonts
    }))
    .on('error', function(error) {
      // Compass prints the error, so only have to log that we handled it.
      gutil.log(
        color.red('compass'),
        'Error caught. Continuing...'
      );
      this.emit('end');
    })
    .pipe(gulp.dest(paths.css));
});


// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.sass + '/**/*.scss', ['compass']);
});

// Add a task to render the output
gulp.task('help', taskListing);

// Default task
gulp.task('default', ['help']);
