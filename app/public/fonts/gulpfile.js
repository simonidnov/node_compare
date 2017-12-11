/*var gulp = require('gulp');
var webfont = require('gulp-webfont');
 
var webfont_config = {
    types:'woff2,woff,ttf,svg',
    ligatures: true
};
 
gulp.task('default', function () {
  return gulp.src('../images/font_assets/*.svg')
    .pipe(webfont(webfont_config))
    .pipe(gulp.dest('dist'));
});*/

/*var async = require('async');
var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
 
gulp.task('default', function(done){
  var iconStream = gulp.src(['../images/font_assets/*.svg'])
    .pipe(iconfont({ fontName: 'idkids-icons' }));
 
  async.parallel([
    function handleGlyphs (cb) {
      iconStream.on('glyphs', function(glyphs, options) {
        gulp.src('idkids-icons/idkids-icons.css')
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: 'idkidsIcons',
            fontPath: 'idkids-icons/',
            className: 'idk_'
          }))
          .pipe(gulp.dest('idkids-icons/'))
          .on('finish', cb);
      });
    },
    function handleFonts (cb) {
      iconStream
        .pipe(gulp.dest('idkids-icons/'))
        .on('finish', cb);
    }
  ], done);
});*/

// import
var gulp = require("gulp");

var iconfont = require("gulp-iconfont");
var iconfontCss = require("gulp-iconfont-css");
var webfont = require('gulp-webfont');

var webfont_config = {
    types:'woff2,woff,ttf,svg',
    ligatures: true
};

gulp.task("default", function() {
  return gulp
    .src('../images/font_assets/*.svg')
    .pipe(
      iconfontCss({
        fontName: "idkids-icons", // nom de la fonte, doit être identique au nom du plugin iconfont
        targetPath: "idkids-icons.css", // emplacement de la css finale
        fontPath: "", // emplacement des fontes finales
        className: 'idk_'
      })
    )
    .pipe(
      iconfont({
        fontName: "idkids-icons" // identique au nom de iconfontCss
      })
    )
    .pipe(gulp.dest("dist/"));
});