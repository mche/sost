(function () {'use strict';
/*
*/
var moduleName = "TimeWorkReport";

var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache', 'appRoutes']);//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/report.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

var text2numRE = /[^\d,\.]/g;
  
var Comp = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    $ctrl.LoadProfiles();
    
    var async = [];
    async.push($ctrl.LoadObjects());
    async.push($ctrl.LoadBrigs());
    $q.all(async).then(function(){
      $ctrl.ready= true;
      
      $timeout(function() {
        //~ $('.tabs', $($element[0])).tabs();
        //~ $ctrl.tabsReady = true;
        $('.modal', $($element[0])).modal();
        $ctrl.InitDays();
        $('select', $($element[0])).material_select();
      });
    });
    
    
    
  };
  
  $ctrl.LoadProfiles = function(){
    
    return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//, data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data) $ctrl.allProfiles = resp.data;
        
      });
    
  };
  
  $ctrl.InitMonth = function(){
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        //~ onClose: $ctrl.SetDate,
        onSet: $ctrl.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: true,// кнопка
        selectYears: true,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
  };
  
  var datepicker;
  $ctrl.SetDate = function (event) {// заход из двух мест datepicker+поле даты фокусировка
    if(event && event.target) {    // фокусировка
      datepicker =  event.target;
      return;
    }
    var target = $(datepicker);
    var p = target.parent();
    var h = $("input:hidden", p);// скрытое поле
    if (dateFns.isSameMonth($ctrl.param['месяц'], h.val())) return;
    $ctrl.param['месяц'] = h.val();
    //~ $ctrl.days = undefined;
    
    $timeout(function(){
      $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  $ctrl.LoadObjects = function(){
    return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
      .then(function(resp){
        $ctrl.data['объекты'] = resp.data;
        //~ $ctrl.param['объект']
        var all = {"name": 'Все объекты/подразделения',"id": null};
        $ctrl.data['объекты'].unshift(all);//$ctrl.param['объект']
        $ctrl.data['объекты'].push({"name": 'Сданные объекты', "id":0, "_class":'grey-text'});
        if (resp.data && resp.data.length == 1) $ctrl.SelectObj( resp.data[0]);
      });
  };
  $ctrl.LoadBrigs = function(){// бригады
    return $http.get(appRoutes.url_for('табель рабочего времени/бригады'))
      .then(function(resp){
        $ctrl.data['бригады'] = resp.data;
        var all = {"name": 'Все бригады',"id": null};
        $ctrl.data['бригады'].unshift(all);//$ctrl.param['бригада']
      });
  };
  
  
  $ctrl.ToggleSelectObj = function(event, hide){// бригады тоже
    var select =  $('.select-dropdown', $(event.target).parent());
    if (!hide) {
      select.show();
      return;
    }
    $timeout(function(){
      select.hide();
    }, 300);
  };
  $ctrl.SelectObj = function(obj){
    $ctrl.param['объект'] = undefined;
    $ctrl.param['бригада'] = undefined;
    $timeout(function(){
      $ctrl.param['объект'] = obj;
      $ctrl.LoadData().then(function(){});
    });
    
  };
  $ctrl.SelectBrig = function(obj){
    $ctrl.param['бригада'] = undefined;
    $ctrl.param['объект'] = undefined;
    $timeout(function(){
      $ctrl.param['бригада'] = obj;
      $ctrl.LoadData().then(function(){});
    });
    
  };
  
  $ctrl.LoadData = function(){
    $ctrl.data['данные'] = undefined;
    $ctrl['костыль для крыжика выплаты'] = undefined;
    //~ if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    //~ var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        //~ angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
        $ctrl.data['данные'] = resp.data;
        $ctrl.data['данные/профили']=undefined; // для фильтации по одному ФИО
        if (!$ctrl.autocompleteSelectProfile) $ctrl.autocompleteSelectProfile = [];
        $ctrl.autocompleteSelectProfile.length = 0;
        $ctrl.filterProfile=undefined;
      });
    
  };
  
  //~ $ctrl.ChangeCheckboxBrig = function(event){
    
    
  //~ };
  
  $ctrl.FocusSelectProfile = function(event){// для фильтации по одному ФИО
    
    if ($ctrl.autocompleteSelectProfile.length === 0) angular.forEach($ctrl.data['данные/профили'], function(profile, fio) {
      $ctrl.autocompleteSelectProfile.push({"value": fio, "data":profile});
    });
    
    var field = $(event.target);
   
    field.autocomplete({
      lookup: $ctrl.autocompleteSelectProfile,
      appendTo: field.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        //~ field.val('');
        $timeout(function(){
          $ctrl.filterProfile = suggestion.data;
        });
      },
      
    });
    
  };
  $ctrl.ChangeSelectProfile = function(clear){// event
    //~ console.log("ChangeSelectProfile", $ctrl.selectProfile, clear);
    if (clear ) $ctrl.selectProfile = '';
    if ($ctrl.selectProfile === '') $ctrl.filterProfile=undefined;
    
  };
  
  $ctrl.DataObjsOrBrigs = function() {// выдать список объектов или бригад
    if ($ctrl.param['общий список'] || $ctrl.param['объект']) return $ctrl.data['объекты'];
    //~ if () return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    if ($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return $ctrl.data['бригады'];
    
    return [];
    //~ if ($ctrl.param['объект']) return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    
  };
  
  $ctrl.objFilter = function(obj, index){// 
    if($ctrl.param['общий список']) return index === 0;
    if($ctrl.param['общий список бригад']) return index === 0;
    if(!obj.id) return false;
    
    if ($ctrl.param['объект']) {
      if($ctrl.data['объекты'].indexOf($ctrl.param['объект']) ===0 && obj.id) return true;
      return $ctrl.param['объект'] === obj;//true;
    }
    if ($ctrl.param['бригада']) {
      if($ctrl.data['бригады'].indexOf($ctrl.param['бригада']) ===0 && obj.id) return true;
      return $ctrl.param['бригада'] === obj;//true;
      
    }
    
  };
  
  var filter_true = function(row){return true;};
  /*логика фильтрации строк*/
  $ctrl.dataFilter = function(obj) {// вернуть фильтующую функцию для объекта/бригады
    //~ console.log("dataFilter", obj);
    if($ctrl.filterProfile) {
      if($ctrl.param['общий список'] || $ctrl.param['объект']) return function(row, idx){ return row["профиль"] == $ctrl.filterProfile.id && ($ctrl.param['общий список'] || row["объект"] == obj.id); };
      if($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return function(row, idx){
        $ctrl.RowProfile(row);
        if(!row._profile["бригада"]) return false;
        return row["профиль"] == $ctrl.filterProfile.id && row._profile["бригада"].some(function(name){ return ($ctrl.param['общий список бригад'] && !!name) || name == obj.name;});
      };
      
    }
    if($ctrl.param['общий список']) return filter_true;
    if($ctrl.param['общий список бригад']) return function(row, idx){
      $ctrl.RowProfile(row);
      if(!row._profile["бригада"]) return false;
      return row._profile["бригада"].some(function(name){ return !!name;});// в общем списке чтобы была бригада
    };
    if($ctrl.param['объект']) return function(row, idx){ return row["объект"] == obj.id; };
    if($ctrl.param['бригада']) return function(row, idx){
      $ctrl.RowProfile(row);
      if(!row._profile["бригада"]) return false;
      return row._profile["бригада"].some(function(name){ return name == obj.name;});
    };
  };
  /**/
  $ctrl.RowProfile = function(row){// к строке данных полноценный профиль
    if (row._profile) return row._profile;
    var profile = $ctrl.allProfiles.filter(function(p){ return p.id == row["профиль"];}).pop();
    if (!profile) profile = ['не найден?'];
    row._profile =  profile;
    return profile;
  };
  
  $ctrl.InitRow = function(row){
    var profile = $ctrl.RowProfile(row);
    
    var fio = profile.names.join(' ');
    if (!$ctrl.data['данные/профили']) $ctrl.data['данные/профили'] = {};
    if(!$ctrl.data['данные/профили'][fio]) $ctrl.data['данные/профили'][fio] = profile;
    
    row._object = $ctrl.Obj(row);
    row['месяц'] = $ctrl.param['месяц'];
    row['пересчитать сумму'] = true;
    //~ console.log("InitRow", row['Сумма']);
    if (row['Сумма'] && !angular.isArray(row['Сумма'])) row['Сумма'] = parseFloat(row['Сумма'].replace(text2numRE, '').replace(/,/, '.')).toLocaleString('ru-RU');
    else if (row['Сумма'] && angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx){
      if(!val) return;
      
      if(val.replace) row['Сумма'][idx] = parseFloat(val.replace(text2numRE, '').replace(/,/, '.')).toLocaleString('ru-RU');
      else row['Сумма'][idx] = val.toLocaleString('ru-RU');
    });
    
    //~ if(!row['Сумма']) row['Сумма'] = $ctrl.DataSum(row);
  };
  
  $ctrl.Obj = function(row){// полноценные объекты
    
    if(row["объект"]) return [$ctrl.FindObj(row["объект"])];
    
    if(row["объекты"]) return row["объекты"].map(function(oid){
      return $ctrl.FindObj(oid);
    });
    
  };
  $ctrl.FindObj = function(oid){// найти объект по ИДу
    return $ctrl.data['объекты'].filter(function(obj){
      return obj.id == oid;
    }).pop()
     ||
    $ctrl.data['бригады'].filter(function(obj){
      return obj.id == oid;
    }).pop();
  };
  

  var saveValueTimeout;
  var numFields = ["Ставка","КТУ2", "Сумма"]; //  влияют на сумму (часы тут не меняются)
  $ctrl.SaveValue = function(row, name, idx){//сохранить разные значения
    if (saveValueTimeout) $timeout.cancel(saveValueTimeout);
    
    if(name == 'Начислено' &&  !$ctrl['костыль для крыжика выплаты']) {// клик костыль однократно, но не долечил при отключении крыжика еще раз нужно кликнуть
      $ctrl['костыль для крыжика выплаты']  = true;
      
      //~ console.log("костыль для крыжика выплаты", angular.copy(row[name]));
      
      if (idx === undefined) {
        if(row[name]) row[name] = 1;
        else row[name] = 1;
      }
      else {
        if (row[name][idx]) row[name][idx] = 1;
        else row[name][idx] = 1;
      }
      //~ console.log("костыль для крыжика выплаты", angular.copy(row[name]));
    }
    var num = numFields.some(function(n){ return n == name;});
    
    row['дата'] = dateFns.format($ctrl.param['месяц'], 'YYYY-MM')+'-01';
    row['значение'] = name;
    
    if (num) {// к числу
      
      if(angular.isArray(row[name])) row['коммент'] = row[name].map(function(val){
        if(!val) return val;
        val += '';
        //~ console.log("text2numRE", val);
        return parseFloat(val.replace(text2numRE, '').replace(/,/, '.'));
      });
      else if (row[name]) row['коммент'] = parseFloat(row[name].replace(text2numRE, '').replace(/,/, '.'));
      else row['коммент'] = row[name];
      //~ if (idx !== undefined) {
        //~ row['коммент'][idx] = parseFloat(row[name][idx].replace(text2numRE, '').replace(/,/, '.'));
      //~ }
      
    } else {// Примечание и Начислено
      row['коммент'] = row[name];
    }
    
    var copy_row;
    if (name == 'Сумма') {
      
      row['пересчитать сумму'] = false;
      
      if (idx !== undefined) {
        copy_row = angular.copy(row);
        copy_row['объект'] = row['объекты'][idx];
        copy_row['коммент'] = row['коммент'][idx];
      }
      
    } else if (name == 'Начислено' ) {
      
      if (idx !== undefined) {
        copy_row = angular.copy(row);
        copy_row['объект'] = row['объекты'][idx];
        copy_row['коммент'] = row['Начислено'][idx] ? row['Сумма'][idx] : null;
      }
      else row['коммент'] = row['Начислено'] ? row['Сумма'] : null;
      
    }
    
    saveValueTimeout = $timeout(function(){
      saveValueTimeout = undefined;
       //~ console.log("Сохранить значение", row, event);
      $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), copy_row || row)
        .then(function(resp){
          //~ if (num && name != 'Сумма') delete row['Сумма'];
          console.log(resp.data);
          
          if (name == 'Сумма') {
            if (idx === undefined) row['пересчитать сумму'] =  !row['коммент'];
            else row['пересчитать сумму'] = !row['коммент'][idx];
          }
          else if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {
            row['пересчитать сумму'] = false;
            if (idx === undefined) row['Сумма'] = null;
            else row['Сумма'][idx] = null;
            $ctrl.SaveValue(row, 'Сумма', idx);
            
          }
          
        });
      
    }, name == 'Начислено' ? 0 : 1000);
  };
  
  $ctrl.DataSumIf = function(row){// сумма денег (инициализирует _sum для row)

    if (!row['пересчитать сумму']) return true;
    if (angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx) {
      if( !val ) //{ === null
        row['Сумма'][idx] = $ctrl.DataSumIdx(row, idx).toLocaleString('ru-RU');
    });
    else if (!row['Сумма']) row['Сумма'] = $ctrl.DataSumIdx(row).toLocaleString('ru-RU');
    
    return true;
  };  

  $ctrl.DataSumIdx = function(row, idx){// сумма денег по объекту или
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    var ktu = (idx === undefined) ? parseFloat(row['КТУ2']) : parseFloat(row['КТУ2'][idx]);
    var st = (idx === undefined) ? parseFloat(row['Ставка']) : parseFloat(row['Ставка'][idx]);
    var count =  (idx === undefined) ? parseFloat(row[cname]) : parseFloat(row[cname][idx]);
    return Math.floor(count * ktu * st);
  };

  $ctrl.DataValueTotal = function(row, name, obj) {// общая сумма по объектам / без row считает по всем строкам
    var sum = 0;
    if (row && row[name]) {
      row[name].map(function(val){
         sum += (val.replace ? parseFloat(val.replace(text2numRE, '').replace(/,/, '.')) : parseFloat(val)) || 0;
      });
    } else {
      $ctrl.data['данные'].filter($ctrl.dataFilter(obj)).map(function(row){
        if (!row[name]) return;
        if (!angular.isArray(row[name])) sum += (row[name].replace ? parseFloat(row[name].replace(text2numRE, '').replace(/,/, '.')) : parseFloat(row[name])) || 0;
        else row[name].map(function(val){
          sum += (val.replace ? parseFloat(val.replace(text2numRE, '').replace(/,/, '.')) : parseFloat(val)) || 0;
        });
      });
    }
    //~ console.log("DataValueTotal", name, sum);
    return sum.toLocaleString('ru-RU');
  };
  
  /*************Детальная таблица по профилю*************/
  $ctrl.ShowDetail = function(row){// показать по сотруднику модально детализацию
    $ctrl.showDetail = row;
    
    if (!row['детально']) $http.post(appRoutes.url_for('табель рабочего времени/отчет/детально'), {"профиль": row["профиль"], "месяц": row["месяц"],}).then(function(resp){
      row['детально']  = resp.data;
    });
  };
  
  $ctrl.InitDays = function(){// для детальной табл
    $ctrl.days = dateFns.eachDay(dateFns.startOfMonth($ctrl.param['месяц']), dateFns.endOfMonth($ctrl.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
  };
  $ctrl.FormatThDay = function(d){// для детальной табл
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $ctrl.IsSunSat = function(d){// для детальной табл
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  
  $ctrl.InitDetailRow = function(oid, row){
    row._object = $ctrl.FindObj(oid);
    row._total = 0;
    row._cnt = 0;
    angular.forEach(row, function(val, d){
      if (val['значение']) {
        var v = parseFloat(val['значение'].replace(text2numRE, '').replace(/,/, '.'));
        row._total += v || 0;
        if(v) row._cnt++;
      }
    });
    
  };
  $ctrl.InitDetailCell = function(row, d){// для детальной табл
    var df = dateFns.format(d, 'YYYY-MM-DD');
    var data = row[df] || {};
    data._d = d;
    //~ data._title = dateFns.isFuture(d) ? "Редактирование заблокировано для будущих дат" : profile.names.join(' ') + " " + (dateFns.isToday(d) ? "сегодня" : dateFns.format(d, 'dddd DD.MM.YYYY', {locale: dateFns.locale_ru}));
    return data;
  };
  $ctrl.TotalDetail = function(name){
    var total = 0;
    if($ctrl.showDetail)  angular.forEach($ctrl.showDetail['детально'], function(row){
      total += row[name];
      
    });
    
    return total;
  };
  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeWorkReport', {
  templateUrl: "time/work/report",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());