// Import everything important
const gulp = require('gulp');
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const browserify = require('browserify');
const sourcemaps = require('gulp-sourcemaps');

// For SASS -> CSS
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript/TypeScript
const terser = require('gulp-terser-js');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// Define Important Varaibles
const src = './src';
const dest = './dist';

// Function for reload the Browser
const reload = (done) => {
    browserSync.reload();
    done();
};

// Function for serve the dev server in borwsaer
const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: `${dest}`
        }
    });
    done();
};

// Compile sass into css with gulp
const css = () => {
    // Find SASS
    return gulp.src(`${src}/assets/sass/**/*.sass`)
        // Init Plumber
        .pipe(plumber())
        // Start Source Map
        .pipe(sourcemaps.init())
        // Compile SASS -> CSS
        .pipe(sass.sync({ outputStyle: "compressed" })).on('error', sass.logError)
        // add SUffix
        .pipe(rename({ basename: 'main', suffix: ".min" }))
        // Add Autoprefixer & cssNano
        .pipe(postcss([autoprefixer(), cssnano()]))
        // Write Source Map
        .pipe(sourcemaps.write(''))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}/assets/css`))
        // Reload Page
        .pipe(browserSync.stream());
};

// Compile .html to minify .html
const html = () => {
    // Find SASS
    return gulp.src(`${src}/*.html`)
        // Init Plumber
        .pipe(plumber())
        // Compile HTML -> minified HTML
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        }))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}`));
};

// Compile .js to minify .js
const script = () => {
    return browserify(`${src}/assets/js/main.js`, {debug: true})
        .transform('babelify', {
            presets: ['babel-preset-env'],
            plugins: ['babel-plugin-transform-runtime']
        }).plugin('tinyify')
        .bundle()
        .pipe(source(`main.bundle.js`))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${dest}/assets/js`));
};

// Copy Assets
const img = () => {
    return gulp.src(`${src}/assets/img/**`)
    .pipe(gulp.dest(`${dest}/assets/img`));
};

// Copy Fonts
const font = () => {
    return gulp.src(`${src}/assets/font/**`)
    .pipe(gulp.dest(`${dest}/assets/font`));
};

// Function to watch our Changes and refreash page
const watch = () => gulp.watch(
    [`${src}/*.html`, `${src}/assets/js/**/*.js`, `${src}/assets/sass/**/*.sass`, `${src}/assets/**/*.*`],
    gulp.series(img, font, css, script, html, reload));

// All Tasks for this Project
const dev = gulp.series(img, font, css, script, html, serve, watch);

// Just Build the Project
const build = gulp.series(css, script, html, img, font);

// Default function (used when type gulp)
exports.dev = dev;
exports.build = build;
exports.default = build;
