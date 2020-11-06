const {src, dest, series, watch} = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const include = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const concat = require('gulp-concat');
const sync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer')

function html() { // создание задачи
    return src('src/**.html') // ф-я, забираемая из галпа, где мы указываем какие файлы мы ходим обработать
        .pipe(include({  // стрим с методом .pipe, с его помощью можно добавлять модули привносящие некий функционал // пакет отвечающий за соединение файлов
            prefix: '@@' // обхект конфигурации
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
        .pipe(concat('index.css')) // соединяем неск. минифицированных файлов в один index.css
        .pipe(dest('dist'))
}

function clear() { // чистим папку dist перед билдом
    return del('dist')
}

function serve() { // (для режима разработки) может запускать нам сервер авто-перезагрузки
    sync.init({ // инициализация
        server: './dist' // значение сервера, смотрящего в папку ***, именно оттуда сервер и будет запускаться и сёрвить статику, которую мы сгенерировали
    })

    watch('src/**.html', series(html)).on('change', sync.reload) // позволяет смотреть за изменением файлов и выполнять какие-либо действия
    watch('src/scss/**.scss', series(scss)).on('change', sync.reload)
}

// exports.html = html
// exports.scss = scss
exports.build = series(clear, scss, html) // series позволяет последовательно вызывать некоторые задачи
exports.serve = series(clear, scss, html, serve)
exports.clear = clear