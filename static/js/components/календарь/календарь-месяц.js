(function () {'use strict';
/***
    <month-calendar
      class="container__month"
      v-for="n in 12"
      :key="`month-${n}`"
      :year="activeYear"
      :month="n"
      :activeDates="month[n]"
      :activeClass="activeClass"
      @toggleDate="toggleDate"
      :lang="lang"
      :nonActiveClass="nonActiveClass"
    >
    </month-calendar>

***/
var moduleName = "Компонент::Календарь::Месяц";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

module
.factory('$КомпонентКалендарьМесяц', function($templateCache,  /*$timeout,$rootScope, $Список, $EventBus/**$compile, Util */) {// factory
//~ import dayjs from "dayjs";
//~ export default {
  //~ name: "month-calendar",
const  props = {
  "activeDates": {
    "type": Array,
    "default": function(){ return [];},
  },
  "month": {
    "type": [String, Number],
    "default": function(){ return dayjs().month() + 1; },
  },
  "year": {
    "type": [String, Number],
    "default": function(){ return dayjs().year(); },
  },
  "lang": {
    "type": String,
    default: "ru",
  },
  "activeClass": {
    "type": String,
    "default": function(){ return ''; },
  },
  "nonActiveClass": {
    "type": String,
    "default": function(){ return 'calendar--active'; },
  },
};

const  data = function(){
  return {
    "showDays": [],
    "weekRows": undefined,
    "isMouseDown": false,
  };
};

const monthMapping = {
  "ru": ["Январь", "Февраль", "Март",  "Апрель", "Май", "Июнь",  "Июль",  "Август",  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
  //~ tw: [ "一月","二月", "三月","四月","五月","六月", "七月","八月", "九月", "十月", "十一月", "十二月"],
  //~ en: [ "January","February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  //~ pt: ["Janeiro", "Fevereiro", "Março", "Abril","Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro","Novembro", "Dezembro" ],
  //~ de: [    "Januar", "Februar","März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  //~ es: [    "Enero", "Febrero", "Marzo","Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ],
  //~ pl: [    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień" ]
};
const dayMapping = {
  "ru": ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  //~ tw: ["一", "二", "三", "四", "五", "六", "日"],
  //~ en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  //~ pt: ["2ª", "3ª", "4ª", "5ª", "6ª", "Sa", "Do"],
  //~ de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  //~ es: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"],
  //~ pl: ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"]
};

 const computed = {
    //~ weekTitleFontSizeAdjustLang() {
      //~ const fontSizeMapping = {
        //~ tw: "16px",
        //~ en: "14px",
        //~ pt: "14px",
        //~ de: "14px",
        //~ es: "14px",
        //~ pl: "12px"
      //~ };
      //~ return fontSizeMapping[this.lang];
    //~ },
  monthTitle() {
    return monthMapping[this.lang][this.month - 1];
  },
}; /*конец computed*/

//~ const WEEK = 7;

const  methods = {
  initCalendar() {
    if (!this.year || !this.month) return [];
    const activeMonth = dayjs()
      .set("date", 1)
      .set("year", this.year)
      .set("month", this.month - 1);
    let firstDay = activeMonth.startOf("month").day() - 1;
    if (firstDay < 0) firstDay += 7;
    let startDate = activeMonth.startOf("month").add(-firstDay, 'day');/// сусама
    const lastDate = activeMonth.endOf("month").date();
    this.weekRows = firstDay >= 5 && activeMonth.endOf("month").day() > 0 ? 6 : 5;
    
    //~ let day = 0;
    
    this.showDays = Array.from(Array(this.weekRows * 7).keys()).map(i => {
      //~ let value = firstDay <= i ? (day++ % lastDate) + 1 : "";
      //~ firstDay <= i && day++;
      let date = startDate.add(i, 'day');
      return {
        "date": date.format('YYYY-MM-DD'),/// сусама
        "day": date.date(),/// сусама
        //~ value,
        "active": false,
        "className": this.activeClass,/// сусама
        //~ "isOtherMonth": firstDay > i || day > lastDate,
        "isOtherMonth": date.month()+1 !=  this.month,///dayjs().isSame(dayjs(), 'year')
      };
    });
    // 把 toggleDate 的內容合併在 initCalendar 裡。
    
    this.activeDates.forEach(date => {
      let oDate;

      if (typeof date === "string") {
        oDate = {
          "date": date,
          "className": this.activeClass
        };
      } else if (typeof date === "object") {
        oDate = date;
        if (!oDate.className) oDate.className = this.activeClass;
      }

      let dayjsObj = dayjs(oDate.date);
      if (dayjsObj.year() !=  this.year) return;
      let activeDate = dayjsObj.date();
      let row = Math.floor(activeDate / 7);
      let activeArrayKey = (activeDate % 7) - 1 + firstDay + 7 * row;
      this.showDays[activeArrayKey].active = true; // to array index
      this.showDays[activeArrayKey].className = oDate.className;
    });
    //~ console.log('initCalendar =showDays', this.month, this.showDays);
  },
  
  showDayTitle(day) {
    return dayMapping[this.lang][day];
  },
  
  toggleDay(dayObj) {
    if (dayObj.isOtherMonth) return;
    dayObj.active = !dayObj.active;
    this.$emit("toggleDate", dayObj);
    //~ {
      //~ "month": this.month,
      //~ "date": dayObj.value,
      //~ "selected": !dayObj.active,
      //~ "className": this.activeClass
    //~ });
  },
  
  dragDay(dayObj) {
    if (this.isMouseDown) this.toggleDay(dayObj);
  },
  
  mouseDown(dayObj) {
    this.toggleDay(dayObj);
    this.isMouseDown = true;
  },
  
  mouseUp() {
    this.isMouseDown = false;
  },
  
  classList(dayObj) {
    let oClassList = {
      "calendar__day--otherMonth": dayObj.isOtherMonth,
      [this.nonActiveClass]: !dayObj.active,
    };

    if (dayObj.active && dayObj.className) oClassList[dayObj.className] = true;

    //~ console.log('classList', dayObj, oClassList);
    return oClassList;
  },
}; /*конец methods*/
  
//~ const  watch = {
  //~ year(val) {
    //~ this.initCalendar();
  //~ },
  //~ // 外層來的資料有變化時
  //~ activeDates(after, before) {
    //~ this.initCalendar();
  //~ }
//~ };

const  created = function(){
  this.initCalendar();
};


var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ watch,
  created,
  components: {},
};


const $Конструктор = function(){
  let $this = this;
  $Компонент.template = $Компонент.template || $templateCache.get('компонент/календарь/месяц');/// только в конструкторе
  return $Компонент;
};

return $Конструктор;
});

})();

