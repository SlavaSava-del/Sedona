const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp").default;
const rename = require("gulp-rename");
const svgstore = require("gulp-svgstore");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const { deleteAsync } = require("del");

const styles = () => {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("docs/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

const htmls = () => {
  return gulp
    .src("source/**/*.html")
    .pipe(
      htmlmin({
        collapseBooleanAttributes: true,
        removeComments: true,
      }),
    )
    .pipe(gulp.dest("docs"));
};

exports.htmls = htmls;

const jsmin = () => {
  return gulp
    .src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("docs/js"));
};

exports.jsmin = jsmin;

const images = () => {
  return gulp
    .src("source/img/**/*.{jpg,png,svg}")
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
      ]),
    )
    .pipe(gulp.dest("source/img"));
};

exports.images = images;

const createWebp = () => {
  return gulp
    .src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("source/img"));
};

exports.webp = createWebp;

const sprite = () => {
  return gulp
    .src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
};

exports.sprite = sprite;

const copy = () => {
  return gulp
    .src(["source/fonts/**/*.{woff,woff2}", "source/img/**"], {
      base: "source",
    })
    .pipe(gulp.dest("docs"));
};

exports.copy = copy;

const clean = () => {
  return deleteAsync(["docs"]);
};

exports.clean = clean;

const build = gulp.series(clean, copy, styles, htmls, jsmin);

exports.build = build;

const server = (done) => {
  sync.init({
    server: {
      baseDir: "docs",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

const watcher = () => {
  gulp.watch("source/less/**/*.less", styles);
  gulp.watch("source/**/*.html", htmls).on("change", sync.reload);
  gulp.watch("source/js/**/*.js", jsmin).on("change", sync.reload);
};

exports.default = gulp.series(build, server, watcher);
