var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    es = require('event-stream'),
    inject = require("gulp-inject"),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    filesize = require('gulp-filesize'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    watch = require('gulp-watch'),
    ngmin = require('gulp-ngmin'),
    wiredep = require('wiredep'),
    shell = require('gulp-shell'),
    open = require('open');
    http_proxy = require("http-proxy");

/**
 * Configure paths
 */

var paths = {
    index: ['./app/index.html'],
    app_js: ['./app/app.js'],
    components_js: ['./app/components/**/*.js'],
    states_js: ['./app/states/**/*.js','./app/controllers/**/*.js','./app/models/**/*.js'],
    scss: ['./scss/**/*.scss'],
    css: ['./app/assets/css/**/*.css'],
    states_html: ['./app/states/**/*.html'],
    fonts: ['./bower_components/ionic/release/fonts/*.*'],
    lib_js: wiredep().js,
    lib_css: wiredep().css,
    images: ['./app/images/**/*.*']
};

/**
 * Configure error handling
 */

var beep_on_error = {
    errorHandler: function (err) {
        gutil.beep();
        console.log(err);
    }
}

/**
 * Default tasks load bower components into app/lib
 * compiles external scss into app/css, injects
 * references into index.html and starts server on
 * port 9000
 */

var app_server = require('./tasks/api_proxy_server.js');

gulp.task('default', ['app_scss', 'app_watch', 'app_serve', 'app_build']);

gulp.task('app_serve', function() {
    app_server.run(9000, '/app');
});

gulp.task('app_scss', function(done) {
    gulp.src(paths.scss)
        .pipe(plumber(beep_on_error))
        .pipe(sass())
        .pipe(plumber.stop())
        .pipe(gulp.dest('./app/css'));
});

gulp.task('app_build', function(done) {
    //  Compile scss and inject css and js into index.html
    var fonts = gulp.src(paths.fonts)
        .pipe(gulp.dest('./app/fonts'));
//    var app_js = gulp.src(paths.app_js);
    var components_js = gulp.src(paths.components_js, {base: './app/components'});
    var states_js = gulp.src(paths.states_js, { base: './app/states' });
    var lib_js = gulp.src(paths.lib_js)
        .pipe(gulp.dest('./app/lib'));
    var app_js = gulp.src(paths.app_js);
    var lib_css = gulp.src(paths.lib_css)
        .pipe(gulp.dest('./app/lib'));

    var css = gulp.src(paths.css);
    gulp.src('./app/index.html')
        .pipe(inject(es.merge(lib_js, lib_css),
            {
                starttag: '<!-- bower:{{ext}} -->',
                ignorePath: '/app'
            }))
        .pipe(inject(es.merge( app_js, states_js, components_js, css),
            {
                ignorePath: '/app'
            }))
        .pipe(gulp.dest('./app'))
        .pipe(app_server.reload())
        .on('end', done)
})

gulp.task('app_watch', function() {
    watch({glob: './app/**/*.*'},['app_build']);
    watch({glob: './scss/**/*.*'},['app_build']);
});

/**
 * www related tasks concat and minify into the www folder
 * and launches a server on port 9080
 */

var www_server = require('./tasks/api_proxy_server.js');

gulp.task('www', ['app_scss','www_watch','www_serve','www_build']);

gulp.task('www_clean', function () {
    return gulp.src('www', {read: false})
        .pipe(clean());
});

gulp.task('www_build', function(done) {
    //  Compile scss and inject css and js into index.html
    var states_html = gulp.src(paths.states_html, {base: './app/states'})
        .pipe(minifyHTML())
        .pipe(gulp.dest('./www/states'));
    var fonts = gulp.src(paths.fonts)
        .pipe(gulp.dest('./www/fonts'))
    var css = gulp.src(paths.css)
        .pipe(concat("app.css"))
        .pipe(filesize())
        .pipe(minifyCss())
        .pipe(filesize())
        .pipe(gulp.dest("./www/css"))
    var app_js = gulp.src(paths.app_js)
        .pipe(concat("app.js"))
        .pipe(filesize())
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(filesize())
        .pipe(gulp.dest("./www/js"))
    var components_js = gulp.src(paths.components_js)
        .pipe(concat("components.js"))
        .pipe(filesize())
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(filesize())
        .pipe(gulp.dest("./www/js"))
    var states_js = gulp.src(paths.states_js)
        .pipe(concat("states.js"))
        .pipe(filesize())
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(filesize())
        .pipe(gulp.dest("./www/js"))
    var lib_js = gulp.src(paths.lib_js)
        .pipe(concat("lib.js"))
        .pipe(filesize())
        .pipe(ngmin())
        .pipe(uglify({mangle: false}))
        .pipe(filesize())
        .pipe(gulp.dest("./www/js"))

    var lib_css = gulp.src(paths.lib_css)
        .pipe(concat("lib.css"))
        .pipe(gulp.dest('./www/css'));

    var images = gulp.src(paths.images)
        .pipe(gulp.dest('./www/images'));

    gulp.src('./app/index.html')
        .pipe(inject(es.merge(lib_js, lib_css),
            {
                starttag: '<!-- bower:{{ext}} -->',
                ignorePath: '/www'
            }))
        .pipe(inject(es.merge(app_js, states_js, components_js, css),
            {
                ignorePath: '/www'
            }))
        .pipe(minifyHTML())
        .pipe(gulp.dest('./www'))
        .pipe(www_server.reload())
        .on('end', done)
});

gulp.task('www_serve', function() {
    www_server.run(9080, '/www');
});

gulp.task('www_watch', function() {
    watch({glob: './app/**/*.*'},['www_build']);
    watch({glob: './scss/**/*.*'},['www_build']);
});

/**
 * hoodie boots up the vagrant vm and starts hoodie
 * relax opens couch's web client
 */

gulp.task('hoodie', shell.task(
    ['vagrant up'],
    {cwd: './hoodie_vm'}
));

gulp.task('relax', function(){
    open("http://localhost:6003/_utils")
});