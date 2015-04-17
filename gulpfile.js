// Gulp utils
var gulp = require('gulp');
var gutil = require('gulp-util');
var color = gutil.colors;
var cp = require('child_process');

// Include Our Plugins
var bs = require('browser-sync');
var reload = bs.reload;
var compass = require('gulp-compass');
var paths = require('compass-options').paths();
var prefix = require('gulp-autoprefixer');
var taskListing = require('gulp-task-listing');

//////////////////////////////
// Jekyll
//////////////////////////////
gulp.task('jekyll', function() {
  return cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config.dev.yml'], {stdio: 'inherit'})
    .on('close', reload);
});

//////////////////////////////
// BrowserSync
//////////////////////////////
gulp.task('browser-sync', function() {
  bs({
    server: './_site/'
  });
});

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
    .pipe(gulp.dest(paths.css))
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest('_site/' + paths.css))
    .pipe(reload({stream: true}));
});

//////////////////////////////
// BrowserSync + Gulp watch
//////////////////////////////
gulp.task('bs', ['jekyll', 'compass', 'browser-sync', 'watch']);

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.sass + '/**/*.scss', ['compass']);
  gulp.watch(['./**/*.{md,html}', '!./_site/**/*.*'], ['jekyll']);
});

// Add a task to render the output
gulp.task('help', taskListing);

// Default task
gulp.task('default', ['help']);
