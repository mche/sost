// Russian

//~ console.log("jQuery.fn.pickadate.defaults", jQuery.fn.pickadate.defaults);

jQuery.extend( jQuery.fn.pickadate.defaults, {
    monthsFull: [ 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря' ],
    "месяц": [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
    monthsShort: [ 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек' ],
    weekdaysFull: [ 'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота' ],
    weekdaysShort: [ 'вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб' ],
    weekdaysLetter: [ 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ],
    today: 'сегодня',
    clear: '',// удалить
    labelMonthNext: 'Следующий месяц',
    labelMonthPrev: 'Предыдущий месяц',
    close: '<i class="material-icons">cancel</i>',
    firstDay: 1,
    //~ format: 'cccc dddd, d mmmm yyyy г.', // длинный день недели
    format: 'cccc ddd, d mmmm yyyy',
    formatSkipYear: false,// true тогда доп костыль - дописывать год при установке
    today: 'сегодня',
    tomorrow: 'завтра',
    yesterday: 'вчера',
    formatSubmit: 'yyyy-mm-dd',
    showMonthsShort: false,
    closeOnSelect: true,
    //~ min: new Date(),
    hiddenName: true,
    //~ klass: {opened: prefix + '--opened 123'},
     klass: Object.assign(jQuery.fn.pickadate.defaults.klass, {frame: 'picker__frame animated fadeIn fast', year_display:'picker__year-display hover-shadow3d'}),
});

jQuery.extend( jQuery.fn.pickatime.defaults, {
    clear: '',
    format: 'HH:i',
    formatLabel: function(time) { return  'HH:i'; },
    formatSubmit: 'HH:i',
    hiddenName: true,
    //~ klass: {listItem: 'picker__list-item center'},
    table: true
});
