var gulp = require('gulp'); // Подключаем Gulp
    sass = require('gulp-sass'); //Подключаем Sass пакет
    browserSync = require('browser-sync'); // Подключаем Browser Sync
    del         = require('del'); // Подключаем библиотеку для удаления файлов и папок
    imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache       = require('gulp-cache'); // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
    useref = require('gulp-useref'); // Подключаем библиотеку для конкатенации файлов
    uglify = require('gulp-uglify'); // Подключаем библиотеку для минификации JS файлов
    gulpIf = require('gulp-if'); // Удостоверяемся, что uglify() запускается только для JS файлов
    cssnano = require('gulp-cssnano'); // Подключаем пакет для минификации CSS

gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('app/sass/**/*.sass') // Берем источник
        .pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass и добавляем обработчик ошибок
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
        .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('useref', function(){ // Создаем таск useref
    return gulp.src('app/*.html')
        .pipe(useref()) // Конкатенация
        .pipe(gulpIf('*.js', uglify())) // Uglifies only if it's a Javascript file (Минификация JS)
        .pipe(gulpIf('*.css', cssnano())) // Минифицируем только CSS файлы
        .pipe(gulp.dest('dist')); // Выгружаем в продакшен
});

gulp.task('watch', ['browser-sync', 'sass'], function() { // Создаем таск watch
    gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
    // Наблюдение за другими типами файлов
});

gulp.task('clean', function() { // Создаем таск clean для удаления dist
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() { // Создаем таск img
    return gulp.src('app/images/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/images')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'sass', 'useref'], function() { // Создаем таск build
    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))
    var buildJs = gulp.src('app/files/**/*') // Переносим файлы в продакшен
    .pipe(gulp.dest('dist/files'));
});

gulp.task('clear', function () { // Создаем таск clear для очистки кеша
    return cache.clearAll();
});

gulp.task('default', ['watch']); // Создаем таск default