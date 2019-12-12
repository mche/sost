(function () {'use strict';
/***
<year-calendar
  v-model="year"
  :activeDates.sync="activeDates"
  @toggleDate="ToggleDate"
  :lang="ru"
  prefixClass="your_customized_wrapper_class"
  :activeClass="activeClass"
  :showYearSelector="false"
  hideWeekend="false"
  hideSunday="false"
></year-calendar>

***/
var moduleName = "Компонент::Календарь::Год";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Календарь::Месяц', ]);

module
.factory('$КомпонентКалендарьГод', function($templateCache, $КомпонентКалендарьМесяц,  /*$timeout,$rootScope, $Список, $EventBus/**$compile, Util */) {// factory

//~ import dayjs from 'dayjs'
//~ import MonthCalendar from './MonthCalendar'
//~ export default {
  ///name: 'year-calendar',
var  monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
 const props = {
  "showYearSelector": {
    "type": Boolean,
    "default": function(){ return true; },
  },
  "activeDates": {
    "type": Array,
    "default": function(){ return []; },
    "validator": function(dateArray){
      let isGood = true;
      let curDate = null;
      dateArray.forEach(function(date){
        if (typeof date === 'string') {
          curDate = date;
        } else if (typeof date === 'object' && date.hasOwnProperty('date')) {
          curDate = date.date;
        }
        // 以下程式碼參考「How to validate date with format mm/dd/yyyy in JavaScript?」in Stackoverflow
        // 由於 「^\d{4}\-\d{1,2}\-\d{1,2}$」會被ESLint 判為錯誤，所以暫時關閉 EsLint 對下一行的驗證 by丁丁
        // eslint-disable-next-line no-useless-escape
        if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(curDate)) {
          isGood = false;
        }
        // Parse the date parts to integers
        var parts = curDate.split('-');
        var day = parseInt(parts[2], 10);
        var month = parseInt(parts[1], 10);
        var year = parseInt(parts[0], 10);
        if (year < 1000 || year > 3000 || month === 0 || month > 12) isGood = false;

        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;
        else monthLength[1] = 28;
        
        if (!(day > 0 && day <= monthLength[month - 1])) isGood = false;
      });
      return isGood;
    },
  },
  // value 為從外層傳進來的 v-model="year"
  "value": {
    "type": [String, Number],
    "default": function(){ return dayjs().year(); },
  },
  "lang": {
    "type": String,
    "default": function(){ return 'ru'; },
  },
  "activeClass": {
    "type": String,
    "default": function(){ return ''; },
  },
  "prefixClass": {
    "type": String,
    "default": function(){ return 'calendar--active'; },
  },
  "hideWeekend": {
    "type": Boolean,
    "default": function(){ return false; },
  },
  "hideSunday": {
    "type": Boolean,
    "default": function(){ return false; },
  }
};

const  data = function(){
  return {
    //~ "isUsingString": true,
  };
};

const  computed = {
  Month() {
    var vm = this;
    var month = {};
    
    vm.activeDates.forEach(function(date){
      let oDate;
      if (typeof date === 'string') {
        oDate = {
          "date": date,
          "className": vm.activeClass
        };
      } else {
        // 若 date 裡的物件少了 className 屬性，就自動填入空字串。否則會變成undefined
        oDate = {
          "date": date.date,
          "className": date.className || '',
        };
      }
      
      if (dayjs(oDate.date).year() != vm.value) return; // 讓2020年1月的資料，不會放到 2019年的1月資料裡
      let m = (dayjs(oDate.date).month() + 1).toString();
      //~ console.log("Month", oDate, m);
      if (!month[m]) month[m] = [];
      month[m].push(oDate);
    });
    
    return month;
  },
  
  activeYear: {
    get() {
      return parseInt(this.value); // this.value 為從外層傳進來的 v-model="year"
    },
    set(val) {
      this.$emit('input', val);
    }
  },
};/*конец computed*/

 const methods = {
   
  changeYear(idx) {
    this.activeYear = idx + this.activeYear - 3;
  },
  
  toggleDate(dateObj) {
    const date = dateObj.date;///dayjs().set('year', this.value).set('month', dateObj.month - 1).set('date', dateObj.date)format('YYYY-MM-DD');
    this.$emit('toggleDate', dateObj);
    //~ {
      //~ "date": date,
      //~ "selected": dateObj.selected,
      //~ "className": dateObj.className
    //~ });
    //~ let dateIndex;
    let newDates;
    //~ if (this.isUsingString) {
      //~ dateIndex = this.activeDates.indexOf(date);
      //~ newDates = this.modifiedActiveDates(dateIndex, date);
    //~ } else {
      //~ let oDate = {
        //~ "date": date,
        //~ "className": dateObj.className // 原為 this.defaultClassName ，修正bug(丁丁)
      //~ };
      //~ dateIndex = this.activeDates.indexOf(this.activeDates.find((i) => i.date === date));
      //~ newDates = this.modifiedActiveDates(dateIndex, oDate);
    //~ }
    let dateIndex = this.activeDates.indexOf(date);
    if (dateIndex < 0) {
      dateIndex = this.activeDates.findIndex((i) => i.date === date);
      newDates = this.modifiedActiveDates(dateIndex, dateObj);
    }
    else
      newDates = this.modifiedActiveDates(dateIndex, date);
    this.$emit('update:activeDates', newDates);
  },
  
  modifiedActiveDates(dateIndex, date) {
    let newDates = [...this.activeDates];
    if (dateIndex === -1) {
      newDates.push(date);
    } else {
      newDates.splice(dateIndex, 1);
    }
    return newDates;
  },
};/*конец methods*/

//~ const  created = function(){
  //~ this.isUsingString = this.activeDates.length && typeof this.activeDates[0] === 'string';
//~ };
  
var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ created,
  components: {},
};


const $Конструктор = function(){
  let $this = this;
  $Компонент.template = $Компонент.template || $templateCache.get('компонент/календарь/год');/// только в конструкторе
  $Компонент.components['month-calendar'] = new $КомпонентКалендарьМесяц();
  return $Компонент;
};

return $Конструктор;
});

})();