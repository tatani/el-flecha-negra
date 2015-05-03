// Gulp utils
var gulp = require('gulp');
var u = require('gulp-util');
var log = u.log;
var c = u.colors;
var spawn = require('child_process').spawn;

// Include Our Plugins
var bs = require('browser-sync');
var reload = bs.reload;
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var minCSS = require('gulp-minify-css');
var critical = require('critical');
var imagemin = require('gulp-imagemin');
var taskListing = require('gulp-task-listing');

//////////////////////////////
// Jekyll
//////////////////////////////
gulp.task('jekyll', function() {
  return spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config.dev.yml'], {stdio: 'inherit'})
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
// Sass
//////////////////////////////
gulp.task('sass', function () {
  return gulp.src('_sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested',
      onSuccess: function(css) {
        var dest = css.stats.entry.split('/');
        log(c.green('sass'), 'compiled to', dest[dest.length - 1]);
      },
      onError: function(err, res) {
        log(c.red('Sass failed to compile'));
        log(c.red('> ') + err.file.split('/')[err.file.split('/').length - 1] + ' ' + c.underline('line ' + err.line) + ': ' + err.message);
      }
    }))
    .pipe(gulp.dest('css'))
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(minCSS())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('css'))
    .pipe(reload({stream: true}));
});

//////////////////////////////
// JS
//////////////////////////////
gulp.task('js-pf', function () {
  return gulp.src('node_modules/picturefill/dist/picturefill.js')
    .pipe(uglify())
    .pipe(rename("main.js"))
    .pipe(gulp.dest('js/'));
});
gulp.task('js-lc', function () {
  return gulp.src('node_modules/fg-loadcss/loadCSS.js')
    .pipe(uglify())
    .pipe(gulp.dest('_includes/'));
});
gulp.task('js', ['js-pf', 'js-lc']);

//////////////////////////////
// Generate & Inline Critical-path CSS
//////////////////////////////
gulp.task('critical', function (cb) {
  critical.generate({
    base: '_site/',
    src: 'index.html',
    css: ['css/main.min.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 1280,
      height: 960
    }],
    dest: '../_includes/critical.css',
    minify: true,
    extract: false
  });
});

//////////////////////////////
// Minify images
//////////////////////////////
gulp.task('imagemin', function() {
  return gulp.src('_img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('img'));
});

//////////////////////////////
// BrowserSync + Gulp watch
//////////////////////////////
gulp.task('bs', ['sass', 'js', 'imagemin', 'jekyll', 'browser-sync', 'watch']);

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('_sass/**/*.scss', ['sass']);
  // gulp.watch('_img/**/*', ['imagemin']);
  gulp.watch(['./**/*.{md,html}', '!./_site/**/*.*'], ['jekyll']);
});

// Add a task to render the output
gulp.task('help', taskListing);

// Default task
gulp.task('default', ['help']);
