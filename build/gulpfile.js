// Load plugins
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const sassGlob = require("gulp-sass-glob");
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const ejs = require('gulp-ejs');
const rename = require("gulp-rename");

// CSS task
function css() {
	return gulp
		.src("scss/**/*.scss", { sourcemaps: true })
		.pipe(sassGlob())
		.pipe(plumber({
			errorHandler: function (err) {
				console.log(err.messageFormatted);
				this.emit('end');
			}
		}))
		.pipe(sass({
			outputStyle: "expanded"
		}))
		.pipe(postcss([autoprefixer({
			cascade: false
		})]))
		.on("error", sass.logError)
		.pipe(cleanCSS())
		.pipe(gulp.dest("../src/css", { sourcemaps: './' }))
		.pipe(browsersync.stream());
}

// JS task
function js() {
	return gulp
		.src([
			'./js/*.js',
			'!./js/*.min.js'
		])
		.pipe(uglify())
		.pipe(gulp.dest('../src/js'))
		.pipe(browsersync.stream());
}

// Tasks
gulp.task("css", css);
gulp.task("js", js);

// BrowserSync
function browserSync(done) {
	browsersync.init({
		proxy: "http://192.168.10.10/sample_koyodou/"
	});
	done();
}

// BrowserSync Reload
function browserSyncReload(done) {
	browsersync.reload();
	done();
}
gulp.task("ejs", function () {
	return gulp.src(["ejs/**/*.ejs", '!' + "ejs/**/_*.ejs"])
		.pipe(ejs({}, {}, { ext: '.html' }))
		.pipe(rename({ extname: ".html" }))
		.pipe(gulp.dest("../"));
});
// Watch files
function watchFiles() {
	gulp.watch("scss/**/*", css);
	gulp.watch("../build/ejs/**/*.ejs", gulp.series("ejs"));
	gulp.watch(["../build/js/**/*.js", "!./js/*.min.js"], js);
	gulp.watch("../**/*.php", browserSyncReload);
}


// dev task
gulp.task("default", gulp.parallel(watchFiles, browserSync));
