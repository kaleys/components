var gulp = require('gulp'),
	less = require('gulp-less'),
	lessAutoPrefix  = require('less-plugin-autoprefix'),
	lessCleanCss = require('less-plugin-clean-css'),
	sourcemaps = require('gulp-sourcemaps'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	distPath = 'dist', devPath = 'dev';


function lessTask(dest) {
	return () => {
		let plugins = [],
			autoPrefix = new lessAutoPrefix({browsers: ["Android > 2","iOS > 5"]});
		if(dest === distPath) {
			plugins.push(new lessCleanCss({advanced:true}))
		}
		gulp.src('src/**/*.less')
			.pipe(sourcemaps.init())
			.pipe(less({plugins:plugins}))
			.pipe(concat('lynn.css'))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(dest));
	}
}
gulp.task('less-dist',lessTask(distPath));
gulp.task('less-dev',lessTask(devPath));


function es6to5(dest){
	return () => {
		gulp.src('src/**/*.js')
			.pipe(babel({presets:['es2015']}))
			.pipe(gulp.dest(dest+'/js'));
	}
}
gulp.task('babel-dist',es6to5(distPath));
gulp.task('babel-dev',es6to5(devPath));

gulp.task('dev',function(){
	gulp.watch('src/**/*.less',['less-dev']);
	gulp.watch('src/**/*.js',['babel-dev']);
})













