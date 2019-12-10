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
 const props = {
  "showYearSelector": {
    "type": Boolean,
    "default": () => true
  },
  "activeDates": {
    "type": Array,
    "default": () => [],
    "validator": (dateArray) => {
      let isGood = true;
      let curDate = null;
      dateArray.forEach(date => {
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
        let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;
        if (!(day > 0 && day <= monthLength[month - 1])) isGood = false;
      });
      return isGood;
    }
  },
  // value 為從外層傳進來的 v-model="year"
  "value": {
    "type": [String, Number],
    "default": dayjs().year(),
  },
  "lang": {
    "type": String,
    "default": 'ru'
  },
  "activeClass": {
    "type": String,
    "default": () => ''
  },
  "prefixClass": {
    "type": String,
    "default": () => 'calendar--active'
  },
  "hideWeekend": {
    "type": Boolean,
    "default": false
  },
  "hideSunday": {
    "type": Boolean,
    "default": false
  }
};

const  data = ()=>{
  return {
    "isUsingString": true,
  };
};

const  computed = {
  month() {
    const month = {};
    this.activeDates.forEach(date => {
      let oDate;
      if (typeof date === 'string') {
        oDate = {
          "date": date,
          "className": this.activeClass
        };
      } else {
        // 若 activeDate 裡的物件少了 className 屬性，就自動填入空字串。否則會變成undefined
        oDate = {
          "date": date.date,
          "className": date.className || '',
        };
      }
      if (dayjs(oDate.date).year() !== this.value) return; // 讓2020年1月的資料，不會放到 2019年的1月資料裡
      let m = (dayjs(oDate.date).month() + 1).toString();
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
  }
};/*конец computed]*/

 const methods = {
   
  changeYear(idx) {
    this.activeYear = idx + this.activeYear - 3;
  },
  
  toggleDate(dateObj) {
    const activeDate = dayjs()
      .set('year', this.value)
      .set('month', dateObj.month - 1)
      .set('date', dateObj.date)
      .format('YYYY-MM-DD');
    this.$emit('toggleDate', {
      "date": activeDate,
      "selected": dateObj.selected,
      "className": dateObj.className
    });
    let dateIndex;
    let newDates;
    if (this.isUsingString) {
      dateIndex = this.activeDates.indexOf(activeDate);
      newDates = this.modifiedActiveDates(dateIndex, activeDate);
    } else {
      let oDate = {
        "date": activeDate,
        "className": dateObj.className // 原為 this.defaultClassName ，修正bug(丁丁)
      };
      dateIndex = this.activeDates.indexOf(this.activeDates.find((i) => i.date === activeDate));
      newDates = this.modifiedActiveDates(dateIndex, oDate);
    }
    this.$emit('update:activeDates', newDates);
  },
  
  modifiedActiveDates(dateIndex, activeDate) {
    let newDates = [...this.activeDates];
    if (dateIndex === -1) {
      newDates.push(activeDate);
    } else {
      newDates.splice(dateIndex, 1);
    }
    return newDates;
  }
};/*конец methods*/

const  created = ()=>{
  this.isUsingString = this.activeDates.length && typeof this.activeDates[0] === 'string';
};
//~ }
  
var $Компонент = {
  props,
  data,
  methods,
  computed,
  created,
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