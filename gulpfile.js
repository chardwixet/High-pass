const { src, dest, series, watch } = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const gulpif = require('gulp-if')
const sass = require("gulp-sass")(require('sass'))
const browserSync = require('browser-sync').create()

let condition = false

const changeCondition = (done) => {
  condition = true

  done()
}

const clean = () => {
  return del(['dist'])
}

const resources = () => {
  return src('src/resources/**')
    .pipe(dest('dist'))
}

const styles = () => {
    return src('src/scss/**/*.scss')
      .pipe(sass().on("error", sass.logError))
      .pipe(gulpif(!condition, sourcemaps.init()))
      .pipe(concat('main.css'))
      .pipe(gulpif(condition, autoprefixer({
          cascade: false
      })))
      .pipe(gulpif(condition, cleanCSS({
          level: 2
      })))
      .pipe(gulpif(!condition, sourcemaps.write()))
      .pipe(dest('dist/aseets/css/'))
      .pipe(browserSync.stream())
}

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(gulpif(condition,htmlMin({
            collapseWhitespace: true
        })))
        .pipe(dest('dist'))
        .pipe(browserSync.stream())
}

const svgSprites = () => {
    return src('src/img/svg-sprites/**/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(dest('dist/img/sprites'))
}

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
  .pipe(gulpif(condition,sourcemaps.init()))
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('app.js'))
  .pipe(gulpif(condition, uglify().on('error', notify.onError())))
  .pipe(gulpif(condition, sourcemaps.write()))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
}

const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.ico',
    'src/img/**/*.png',
    'src/img/*.svg',
    'src/img/**/*.jpeg'
  ])
  .pipe(image())
  .pipe(dest('dist/img'))
}

const fonts = () => {
  return src([
    'src/fonts/**/*.woff',
    'src/fonts/**/*.woff2'
  ])
  .pipe(dest('dist/aseets/fonts'))
}

watch('src/**/*.html', htmlMinify)
watch('src/**/*.scss', styles)
watch('src/img/svg/**/*.svg', svgSprites)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)

exports.styles = styles
exports.scripts = scripts
exports.htmlMinify = htmlMinify
exports.clean = clean
exports.dev = series(clean, resources, htmlMinify, scripts, styles, images, svgSprites, fonts, watchFiles)
exports.default = series(clean, changeCondition, resources, htmlMinify, scripts, styles, images, svgSprites, fonts, watchFiles)
