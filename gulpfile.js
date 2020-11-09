const {gulp, src, dest, series, watch} = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const concat = require('gulp-concat');
const sync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')

function html() { // создание задачи
    return src('src/**.html') // ф-я, забираемая из галпа, где мы указываем какие файлы мы ходим обработать
        .pipe(include({  // стрим с методом .pipe, с его помощью можно добавлять модули привносящие некий функционал // пакет отвечающий за соединение файлов
            prefix: '@@' // объект конфигурации
        }))
        .pipe(htmlmin({ // минификация, в данном случае, удаление пробелов
            collapseWhitespace: true
        }))
        .pipe(dest('dist'))
}

function scss() {
    return src('src/scss/**.scss') // все файлы с расширением .scss
        .pipe(sass()) // compile with sass module
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(csso()) // минифицировать
        .pipe(concat('styles.css')) // соединяем неск. минифицированных файлов в один index.css
        .pipe(dest('dist'))
}

// function js() {
//     return src('src/js/**.js')
//         .pipe()
// }

function fonts() {
    return src('src/fonts/*')
        .pipe(dest('dist/fonts'))
}

// Minify and copy new images to dist

function images() {
    return src('src/img/**.{jpg,svg,jpeg,png}')
        // .pipe(imagemin())
        .pipe(dest('dist/img'));
}

function clear() { // чистим папку dist перед билдом
    return del('dist')
}

function serve() { // (для режима разработки) может запускать нам сервер авто-перезагрузки
    sync.init({ // инициализация
        server: './dist' // значение сервера, смотрящего в папку ***, именно оттуда сервер и будет запускаться и сёрвить статику, которую мы сгенерировали
    })

    watch('src/**.html', series(html)).on('change', sync.reload) // позволяет смотреть за изменением файлов и выполнять какие-либо действия
    watch('src/scss/**', series(scss)).on('change', sync.reload)
    watch('src/img/**.{jpg,svg,jpeg,png}', series(images)).on('change', sync.reload)
    watch('dist/style.css').on('change', sync.reload)
}



// exports.html = html
// exports.scss = scss
exports.build = series(scss, html, fonts) // series позволяет последовательно вызывать некоторые задачи
exports.serve = series(clear, scss, html, fonts, images, serve)
exports.clear = clear