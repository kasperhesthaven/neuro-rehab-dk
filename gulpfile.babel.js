// =============================================================================
// Settings
// =============================================================================
// Most of what you'd usually want to change for a new project is here
// All gulp packages are loaded into $ and you shouldn't need to define them
// Use $.PackageName for gulp-package-name

// Primary dependencies & none-gulp packages
import beeper from 'beeper';
import browserSync from 'browser-sync';
import chalk from 'chalk';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import log from 'fancy-log';
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import svgo from 'imagemin-svgo';
import runSequence from 'run-sequence';
import uglifyEs from 'gulp-uglify-es';

// Load gulp packages into $
const $ = gulpLoadPlugins();

// Disable notifications
// process.env.DISABLE_NOTIFIER=true;

// Silence run-sequence
runSequence.options.showErrorStackTrace = false;

// Folder names
const folders = {
	src: 'src',
	dist: 'dist',
	tmp: '.tmp',
	assets: 'assets',
	vendors: 'vendors',
	libraries: 'libraries',
	fonts: 'fonts',
	images: 'images',
	scripts: 'scripts',
	styles: 'styles',
	videos: 'videos',
	favicon: 'favicon'
};

// Paths
const paths = {
	src: {
		fonts:						`${folders.src}/${folders.assets}/${folders.fonts}`,
		images:						`${folders.src}/${folders.assets}/${folders.images}`,
		videos:						`${folders.src}/${folders.assets}/${folders.videos}`,
		favicon:					`${folders.src}/${folders.assets}/${folders.favicon}`,
		scripts:					`${folders.src}/${folders.assets}/${folders.scripts}`,
		scriptsLibraries:	`${folders.src}/${folders.assets}/${folders.scripts}/${folders.libraries}`,
		scriptsVendors:		`${folders.src}/${folders.assets}/${folders.scripts}/${folders.vendors}`,
		styles:						`${folders.src}/${folders.assets}/${folders.styles}`,
		stylesVendors:		`${folders.src}/${folders.assets}/${folders.styles}/${folders.vendors}`
	},
	tmp: {
		fonts:						`${folders.tmp}/${folders.fonts}`,
		images: 					`${folders.tmp}/${folders.images}`,
		scripts: 					`${folders.tmp}/${folders.scripts}`,
		scriptsVendors: 	`${folders.tmp}/${folders.scripts}/${folders.vendors}`,
		styles: 					`${folders.tmp}/${folders.styles}`,
		stylesVendors: 		`${folders.tmp}/${folders.styles}/${folders.vendors}`
	},
	dist: {
		fonts: 						`${folders.dist}/${folders.assets}/${folders.fonts}`,
		images: 					`${folders.dist}/${folders.assets}/${folders.images}`,
		videos: 					`${folders.dist}/${folders.assets}/${folders.videos}`,
		favicon: 					`${folders.dist}/${folders.assets}/${folders.favicon}`,
		scripts: 					`${folders.dist}/${folders.assets}/${folders.scripts}`,
		scriptsVendors:		`${folders.dist}/${folders.assets}/${folders.scripts}/${folders.vendors}`,
		styles: 					`${folders.dist}/${folders.assets}/${folders.styles}`,
		stylesVendors:		`${folders.dist}/${folders.assets}/${folders.styles}/${folders.vendors}`
	}
};

// Autoprefixer list
const browsers = [
	'ie >= 11',
	'ie_mob >= 11',
	'ff >= 52',
	'chrome >= 49',
	'safari >= 9',
	'opera >= 48',
	'ios >= 9',
	'android >= 4.4'
];

// =============================================================================
// JavaScript
// =============================================================================

// Minifies load script used for feature detection
gulp.task('js-load', () => {
	return (gulp.src([`${paths.src.scripts}/load.js`])
		// Error handling
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `JS load compile error in ${err.message.filePath}`,
					message:
						`${err.message.loc.start.line}:
						${err.message.loc.start.column}
						${err.message.toString().replace(/\s\(\d+:[\S\s]*/, '')}`
				})(err);
				beeper(1);
				del([`${paths.tmp.scripts}/load.js`]);
			}
		}))
		// Compile
		.pipe($.prettierEslint({ logLevel: 'silent' }))
		.pipe(uglifyEs())
		// Output
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist.scripts))
			.on('data', () => {
				log(chalk.green('JS load file generated'));
			})
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
	);
});

// Concatenates & minifies ES6 JavaScript
// If order issues arise, list scripts orderly below instead of using **/*.js path
gulp.task('js-es6', () =>
	gulp.src([
			`${paths.src.scriptsLibraries}/**/*.js`,
			`${paths.src.scripts}/**/*.js`,
			`!${paths.src.scriptsVendors}/**/*.js`,
			`!${paths.src.scripts}/load.js`
		])
		// Error handling
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `JS ES6 compile error in ${err.filename}`,
					message: `${err.line}:${err.col} ${err.message}`,
				})(err);
				beeper(1);
				del([`${paths.tmp.scripts}/**/*.js`]);
			}
		}))
		// Compile
		.pipe($.concat('main.js', { newLine: ';' }))
		//.pipe(uglifyEs())
		// Output ES6
		.pipe($.rename({ suffix: '.es6.min' }))
		.pipe(gulp.dest(paths.dist.scripts))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Concatenates & minifies ES5 JavaScript
// If order issues arise, list scripts orderly below instead of using **/*.js path
gulp.task('js', () =>
	gulp.src([
			`${paths.src.scriptsLibraries}/**/*.js`,
			`${paths.src.scripts}/**/*.js`,
			`!${paths.src.scriptsVendors}/**/*.js`,
			`!${paths.src.scripts}/load.js`
		])
		// Error handling
		.pipe($.plumber({
			errorHandler: (err) => {
				switch (err.plugin) {
					case 'gulp-babel':
						let errMsg = err.message.split(': ').pop();
						errMsg = errMsg.substr(0, errMsg.indexOf(' ('));
						$.notify.onError({
							title: `JS ES5 compile error in ${err.fileName.substring(err.fileName.lastIndexOf('\\') + 1)}`,
							message: `${err.loc.line}:${err.loc.column} ${errMsg}`,
						})(err);
						console.log(err.codeFrame);
						break;
					case 'gulp-uglify':
						$.notify.onError({
							title: `JS ES5 compile error in ${err.filename}`,
							message: `${err.line}:${err.col} ${err.message}`,
						})(err);
						break;
					default:
						$.notify.onError({
							title: `JS ES5 compile error in ${err.plugin}`,
							message: err.message,
						})(err);
				}
				beeper(1);
				del([`${paths.tmp.scripts}/**/*.js`]);
			}
		}))
		// Compile
		.pipe($.concat('main.js', { newLine: ';' }))
		.pipe($.babel())
		//.pipe($.uglify())
		// Output ES5
		.pipe($.rename({ suffix: '.es5.min' }))
		.pipe(gulp.dest(paths.dist.scripts))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Transpiles to ES5 & minifies vendor JavaScript
// If order issues arise, list scripts orderly below instead of using **/*.js path
// Vendor scripts aren't concatenated, because they should be individually requested
// on an as-needed basis. Scripts needed globally should be added as libraries
gulp.task('js-vendors', () =>
	gulp.src([`${paths.src.scriptsVendors}/**/*.js`])
		// Error handling
		.pipe($.plumber({
			errorHandler: (err) => {
				switch (err.plugin) {
					case 'gulp-babel':
						let errMsg = err.message.split(': ').pop();
						errMsg = errMsg.substr(0, errMsg.indexOf(' ('));
						$.notify.onError({
							title: `JS compile error in ${err.fileName.substring(err.fileName.lastIndexOf('\\') + 1)}`,
							message: `${err.loc.line}:${err.loc.column} ${errMsg}`,
						})(err);
						console.log(err.codeFrame);
						break;
					case 'gulp-uglify':
						$.notify.onError({
							title: `JS compile error in ${err.filename}`,
							message: `${err.line}:${err.col} ${err.message}`,
						})(err);
						break;
					default:
						$.notify.onError({
							title: `JS compile error in ${err.plugin}`,
							message: err.message,
						})(err);
				}
				beeper(1);
				del([`${paths.tmp.scriptsVendors}/**/*.js`]);
			}
		}))
		// Compile
		.pipe($.changed(paths.tmp.scriptsVendors, {
			hasChanged: $.changed.compareContents,
		}))
		.pipe(gulp.dest(paths.tmp.scriptsVendors))
		//.pipe($.babel())
		.pipe($.uglify())
		// Output
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist.scriptsVendors))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
		.pipe($.notify({
			title: 'JS vendor files generated',
			sound: false,
			onLast: true
		}))
);

// =============================================================================
// SCSS
// =============================================================================

// Lint own SCSS according to stylelint styleguide, with minor modifications
gulp.task('scss-lint', () =>
	gulp.src([
			`${paths.src.styles}/**/*.scss`,
			`!${paths.src.stylesVendors}/**/*.scss`
		])
		.pipe($.stylelint({
			failAfterError: true,
			reporters: [{ formatter: 'string', console: true }],
			syntax: 'scss'
		}))
);

// Compile SASS, prefix CSS, minify CSS and concatenate files into main.min.css
gulp.task('scss', () =>
	gulp.src([
				`${paths.src.styles}/**/*.scss`,
				`!${paths.src.stylesVendors}/**/*.scss`
			], { base: paths.src.styles }
		)
		// Error handling
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `SCSS compile error in ${err.file.replace(/^.*[\\]/, '')}`,
					message:
						`${err.line}:${err.column}
						${err.messageOriginal.replace('\t', '')}`
				})(err);
				beeper(1);
			}
		}))
		// Compile
		.pipe($.size({ title: 'Stylesheet size before:' }))
		.pipe($.sass({
			includePaths: ['node_modules/normalize-scss/sass/'],
			outputStyle: 'expanded',
			// Sub-pixel rendering differs across browsers, but 6 decimals is fairly encompassing - http://cruft.io/static/rounding/
			precision: 6,
			indentType: 'tab'
		}))
		.pipe($.changed(paths.tmp.styles, { hasChanged: $.changed.compareContents }))
		.pipe(gulp.dest(paths.tmp.styles))
		.pipe($.autoprefixer(browsers))
		// Output
		.pipe($.concat('main.css'))
		.pipe($.cssnano())
		.pipe($.size({ title: 'Stylesheet size after:' }))
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist.styles))
		.pipe($.if(browserSync.active, browserSync.stream()))
);

// Compile SASS, prefix CSS and minify CSS
// Vendor styles aren't concatenated, as they should be individually requested
// on an as-needed basis. Styles needed globally should be added as dependencies
gulp.task('scss-vendors', () =>
	gulp.src([`${paths.src.stylesVendors}/**/*.scss`], { base: paths.src.styles })
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `Gulp error in ${err.plugin}`,
					message: err.message
				})(err);
				beeper(1);
			}
		}))
		.pipe($.sass({ style: 'compressed', precision: 6 }))
		.pipe($.cssnano())
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist.stylesVendors)));


// =============================================================================
// Images
// =============================================================================

gulp.task('images', () =>
	gulp.src([
				`${paths.src.images}/**/*.{png,gif,jpg,jpeg,svg,PNG,GIF,JPG,JPEG,SVG}`
			], { base: '' }
		)
		.pipe($.imagemin([
			$.imagemin.gifsicle(),
			mozjpeg({ quality: 75 }),
			pngquant(),
			svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: true }
				]
			})
		]))
		.pipe(gulp.dest(paths.dist.images))
);

// =============================================================================
// Various assets
// =============================================================================

// Subset ttf fonts to WOFF & WOFF2
// Supports Basic Latin (U+0020-007F), Latin-1 supplement (U+00A0-00FF),
// Latin Extended-A (U+0100-017F) and Latin Extended-B (U+0180-024F)
// Essentially most modern Germanic languages, alongside vulgar latin.
// Add specific characters as ',U+####' to the whitelist

// Convert all ttf font files into woff
gulp.task('fonts2woff', () =>
	gulp.src(`${paths.src.fonts}/**/*.{ttf,TTF}`)
		.pipe($.changed(paths.tmp.fonts, { hasChanged: $.changed.compareContents }))
		.pipe($.ttf2woff())
		.pipe(gulp.dest(paths.dist.fonts))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Convert all ttf font files into woff2
gulp.task('fonts2woff2', () =>
	gulp.src(`${paths.src.fonts}/**/*.{ttf,TTF}`)
		.pipe($.changed(paths.tmp.fonts, { hasChanged: $.changed.compareContents }))
		.pipe($.ttf2woff2())
		.pipe(gulp.dest(paths.dist.fonts))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Copy all video files into dist
gulp.task('video', () =>
	gulp.src(`${paths.src.videos}/**/*.*`)
		.pipe(gulp.dest(paths.dist.videos))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Copy all favicon files into dist
gulp.task('favicon', () =>
	gulp.src(`${paths.src.favicon}/**/*.*`)
		.pipe(gulp.dest(paths.dist.favicon))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);

// Copy all project files into dist
gulp.task('copy', () =>
	gulp.src([
			`${folders.src}/**/*.*`,
			`!${folders.src}/${folders.assets}/**/*.*`,
			`!*.csproj`
		])
		.pipe(gulp.dest(folders.dist))
);


// =============================================================================
// Pug, HTML & CSHTML
// =============================================================================

// Lint HTML according to .htmlintrc
function htmllintReporter(filepath, issues) {
	if (issues.length > 0) {
		issues.forEach((issue) => {
			log(chalk.cyan('[HTML error] ') +
					chalk.white(`${filepath} [${issue.line},${issue.column}]: `) +
					chalk.red(`(${issue.code}) ${issue.msg}`));
		});
		process.exitCode = 1;
	}
}

gulp.task('html-lint', () =>
	gulp.src(`${folders.dist}/**/*.{html,HTML}`)
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `Gulp error in ${err.plugin}`,
					message: err.message
				})(err);
				beeper(1);
			}
		}))
		.pipe($.htmllint({}, htmllintReporter))
);

// Compile any Pug files to HTML
gulp.task('pug', () =>
	gulp.src(`${folders.src}/*.pug`)
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `Gulp error in ${err.plugin}`,
					message: err.message
				})(err);
				beeper(1);
			}
		}))
		.pipe($.pug({ pretty: '\t' }))
		.pipe($.rename({ extname: '.html' }))
		.pipe(gulp.dest(folders.src))
		.pipe(gulp.dest(folders.dist))
);

// Minify cshtml & html
gulp.task('cshtml', () =>
	gulp.src(`${folders.src}/**/*.{cshtml,html,CSHTML,HTML}`)
		.pipe($.plumber({
			errorHandler: (err) => {
				$.notify.onError({
					title: `Gulp error in ${err.plugin}`,
					message: err.message
				})(err);
				beeper(1);
			}
		}))
		.pipe($.changed(folders.tmp, { hasChanged: $.changed.compareContents }))
		.pipe(gulp.dest(folders.tmp))
		/*.pipe($.cshtmlMinifier({
			htmlComments: true,
			jsComments: true,
			razorComments: true,
			whitespace: true
		}))*/
		.pipe(gulp.dest(folders.dist))
		.pipe($.if(browserSync.active, browserSync.stream({ once: true })))
);


// =============================================================================
// Various tasks, like watch, initialize & browser reload
// =============================================================================

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

// Initialize project
gulp.task('init', (cb) => {
	runSequence(
		'clean',
		'js-load',
		['js-es6', 'js', 'js-vendors'],
		'scss-lint',
		['scss', 'scss-vendors'],
		[
			'images',
			'video',
			'favicon'
		],
		'html-lint',
		'cshtml',
		'copy',
		cb
	);
});

// Handles tasks writing to source
function pausedWatch(glob, tasks) {
	const watcher = $.watch(glob, () => {
		watcher.close();
		gulp.start(tasks, () => {
			pausedWatch(glob, tasks);
		});
	});
}

// Watch files for changes & reload browser
gulp.task('default', (cb) => {
	runSequence(
		'clean',
		'js-load',
		['js-es6', 'js', 'js-vendors'],
		['scss', 'scss-vendors'],
		[
			'images',
			'video',
			'favicon'
		],
		'cshtml',
		'copy',
		cb
	);
});

// Watch files for changes & reload browser
gulp.task('watch', () => {
	// BrowserSync
	browserSync({
		notify: false,
		logPrefix: 'Browser',
		// Change if you don't use <main></main>
		scrollElementMapping: ['main'],
		// https: true,
		server: [folders.dist],
		port: 3000,
	});
	$.watch([`${folders.dist}/**/*.*`], () => {
		browserSync.reload;
	});

	// JavaScript
	$.watch([`${paths.src.scripts}/**/*.js`], () => {
		runSequence('js-es6', 'js', 'js-vendors', () => {});
	});

	// SCSS
	// () => {} to silence run-sequence errors
	$.watch([`${paths.src.styles}/**/*.scss`, `!${paths.src.stylesVendors}/**/*.scss`],	() => {
		runSequence('scss-lint', 'scss', () => {});
	});

	$.watch([`${paths.src.stylesVendors}/**/*.scss`], () => {
		['scss-vendors'];
	});

	// Assets
	$.watch([`${paths.src.fonts}/**/*.*`], () => {
		runSequence('fonts2woff', 'fonts2woff2', () => {});
	});
	$.watch([`${paths.src.images}/**/*.*`], () => {
		gulp.start(['images']);
	});
	$.watch([`${paths.src.videos}/**/*.*`], () => {
		gulp.start(['video']);
	});
	$.watch([`${paths.src.favicon}/**/*.*`], () => {
		gulp.start(['favicon']);
	});
	$.watch([`${folders.src}/**/*.pug`], () => {
		gulp.start(['pug']);
	});
	$.watch([`${folders.src}/**/*.{cshtml,html,CSHTML,HTML}`], () => {
		gulp.start(['cshtml']);
	});
	$.watch([`${folders.dist}/**/*.html`], () => {
		gulp.start(['html-lint']);
	});
});
