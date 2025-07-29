const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const esbuild = require('esbuild');
const { spawn } = require('child_process');
const cssnano = require('cssnano');

// CSS and JS source paths
const cssSrc = 'themes/hugo-boilerplate/assets/css/main.css';
const cssDest = 'static/css';
const jsEntryPoints = ['themes/hugo-boilerplate/assets/js/main.js'];
const jsDest = 'static/js';

// CSS build with @import processing
function buildCSS() {
    return gulp.src(cssSrc)
        .pipe(postcss([
            postcssImport, // Process @import statements first
            tailwindcss,
            autoprefixer,
            cssnano()
        ]))
        .pipe(gulp.dest(cssDest));
}

// JavaScript build with ESBuild
async function buildJS() {
    try {
        await esbuild.build({
            entryPoints: jsEntryPoints,
            bundle: true,
            minify: true,
            format: 'iife',
            outdir: jsDest,
            target: 'es2015'
        });
        console.log('JavaScript build completed successfully');
    } catch (error) {
        console.error('JavaScript build failed:', error);
        throw error;
    }
}

// Hugo server
function startHugo(done) {
    const hugo = spawn('hugo', ['server', '--buildDrafts', '--buildFuture'], {
        stdio: 'inherit'
    });
    
    hugo.on('close', (code) => {
        if (code !== 0) {
            console.error(`Hugo exited with code ${code}`);
        }
        done();
    });
}

// Watch tasks
function watchFiles() {
    gulp.watch('themes/hugo-boilerplate/assets/css/**/*.css', buildCSS);
    gulp.watch('themes/hugo-boilerplate/assets/js/**/*.js', buildJS);
}

// Define tasks
gulp.task('css', buildCSS);
gulp.task('js', buildJS);
gulp.task('build', gulp.parallel(buildCSS, buildJS));
gulp.task('watch', gulp.series('build', watchFiles));
gulp.task('dev', gulp.series('build', gulp.parallel(watchFiles, startHugo)));
gulp.task('default', gulp.series('build', startHugo));

// Export tasks
exports.css = buildCSS;
exports.js = buildJS;
exports.build = gulp.parallel(buildCSS, buildJS);
exports.watch = gulp.series('build', watchFiles);
exports.dev = gulp.series('build', gulp.parallel(watchFiles, startHugo));
exports.default = gulp.series('build', startHugo);
