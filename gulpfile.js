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

// Styles
const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

// Htmlmin
const htmls = () => {
  return gulp.src("source/**/*.html")
    .pipe(htmlmin({
      collapseBooleanAttributes: true,
      removeComments: true
    }))
    .pipe(gulp.dest('build'))
}

exports.htmls = htmls;

// Uglify
const jsmin = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"))
}

exports.jsmin = jsmin;

// Imagemin
const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
    ]))
    .pipe(gulp.dest("source/img"));
};

exports.images = images;

// Webp
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("source/img"));
};

exports.webp = createWebp;

// SVG
const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("source/img"));
};

exports.sprite = sprite;

// Copy
const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**"
  ], { base: "source" })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Clean
const clean = () => {
  return deleteAsync(["build"]);
};

exports.clean = clean;

// Build
const build = gulp.series(
  clean,
  copy,
  styles,
  htmls,
  jsmin
);

exports.build = build;

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher
const watcher = () => {
  gulp.watch("source/less/**/*.less", styles);
  gulp.watch("source/*.html", htmls).on("change", sync.reload);
  gulp.watch("surce/app/**/*.js", jsmin).on("change", sync.reload);
};

exports.default = gulp.series(
  build,
  server,
  watcher
);
