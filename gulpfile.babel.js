import gulp from 'gulp';
const sass = require('gulp-sass')(require('sass'));
import del from 'del';
import plumber from 'gulp-plumber';
import sourceMaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
// import imagemin from 'gulp-imagemin';
// import imageminJpegRecompress from 'imagemin-jpeg-recompress';
// import pngquant from 'imagemin-pngquant';
import svgmin from 'gulp-svgmin';
import cheerio from "gulp-cheerio";
import replace from "gulp-replace";
import svgSprite from "gulp-svg-sprite";

const paths = {
    styles: {
        src: 'scss/style.scss',
        dest: 'build/css/'
    },
    scripts: {
        src: 'js/!**!/!*.js',
        dest: 'build/scripts/'
    },
    css: {
        src: 'css/!**!/!*.css',
        dest: 'build/css/'
    }
};

/*
 * For small tasks you can export arrow functions
 */
export const clean = () => del(['build']);

/*
 * You can also declare named functions and export them as tasks
 */
export function styles() {
    return gulp.src(paths.styles.src)
        .pipe(plumber())
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload({stream: true}));
}

export function html() {
    return gulp.src('*.html')
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream: true}));
}

export function script() {
    return gulp.src(paths.scripts.src)
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.reload({stream: true}));
}

export function stylesCss() {
    return gulp.src(paths.css.src)
        .pipe(gulp.dest(paths.css.dest))
        .pipe(browserSync.reload({stream: true}));
}

export function allimg() {
    return gulp.src('img/*.{png,jpg}')
        .pipe(gulp.dest('build/img'))
        .pipe(browserSync.reload({stream: true}));
}

/*export function images() {
    return gulp.src('build/img/!**!/!*.{png,jpg}')
        // .pipe(imagemin([
        //     imagemin.jpeg({progressive: true}),
        //     imageminJpegRecompress({
        //         loops: 5,
        //         min: 65,
        //         max: 70,
        //         quality: 'medium'
        //     }),
        //     imagemin.optipng({optimizationLevel: 3}),
        //     // pngquant({quality: '65-70', speed: 5})
        // ]))
        .pipe(gulp.dest('build/img'));
}*/

export function svg(){
    return gulp.src('img/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('build/img'));
}

export function serve(){
    browserSync.init({server: "build"});
    gulp.watch("scss/*.scss", styles);
    gulp.watch("*.html", html);
    gulp.watch(paths.scripts.src, script);
    gulp.watch("css/**/*.css", stylesCss);
    gulp.watch("img/**/*.{png,jpg}", allimg);
    gulp.watch("img/**/*.{svg}", svg);
}

const build = gulp.series(clean, gulp.parallel(
    styles,
    html,
    script,
    stylesCss,
    allimg,
    // images
    svg
    ));
exports.build = build;

/*
 * Export a default task
 */
export default build;