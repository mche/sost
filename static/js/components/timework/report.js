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
  
var Comp = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    $ctrl.LoadProfiles();
    
    $ctrl.LoadObjects().then(function(){
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
        $ctrl.param['объект'] = {"name": 'Все объекты/подразделения',"id": null};
        $ctrl.data['объекты'].unshift($ctrl.param['объект']);
        $ctrl.data['объекты'].push({"name": 'Сданные объекты', "id":0, "_class":'grey-text'});
        if (resp.data && resp.data.length == 1) $ctrl.SelectObj( resp.data[0]);
      });
    
  };
  
  /*
  $ctrl.InitSelectObj = function(event){
    var input = $(event.target);
    if (event.target['список активирован']) {
      input.autocomplete().toggleAll();
      return;
    }
    
    var lookup = $ctrl.data['объекты'].map(function(obj){return {"value": obj.name, "data": obj,}});
    lookup.unshift({"value": "Все объекты", "data": null,});
    lookup.push({"value": "Сданные объекты", "data": undefined,});
    
    input.autocomplete({
      lookup: lookup,
      appendTo: input.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if ($ctrl.param['объект'] === suggestion.data) return '<strong>'+suggestion.value+'</strong>';
        return suggestion.value;
      },
      onSelect: function (suggestion) {
        $ctrl.SelectObj(suggestion.data);
      },
      
    });
    event.target['список активирован'] = true;
    input.autocomplete().toggleAll();
  };
  $ctrl.ChangeObj = function(){
    console.log("ChangeObj");
  };*/
  $ctrl.ToggleSelectObj = function(event, hide){
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
    //~ if (obj === $ctrl.param['объект']) return;// всегда обновлять
    $ctrl.param['объект'] = undefined;
    //~ $ctrl.param['данные'] = undefined;
    //~ $ctrl.param['отключенные объекты'] = undefined;
    //~ $ctrl.param['общий список'] = false;
    
    $timeout(function(){
      $ctrl.param['объект'] = obj;
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
      });
    
  };
  
  $ctrl.objFilter = function(obj, index){
    if($ctrl.param['общий список']) return index === 0;
    if(!obj.id) return false;
    if($ctrl.data['объекты'].indexOf($ctrl.param['объект']) ===0 && obj.id) return true;
    return $ctrl.param['объект'] === obj;//true;
    
  };
  
  var filter1 = function(row){return true;};
  $ctrl.dataFilter = function(obj) {// вернуть фильтующую функцию для объекта
    //~ console.log("dataFilter", obj);
    if($ctrl.param['общий список']) return filter1;
    return function(row, idx){ if(row["объект"] == obj.id) {return true;} else {return false;} };
  };
  
  $ctrl.InitRow = function(row){
    var profile = $ctrl.allProfiles.filter(function(p){ return p.id == row["профиль"];}).pop();
    if (!profile) row._profile = ['?'];
    row._profile =  profile;
    row._object = $ctrl.Obj(row);
    row['месяц'] = $ctrl.param['месяц'];
    row['пересчитать сумму'] = true;
    //~ if(!row['Сумма']) row['Сумма'] = $ctrl.DataSum(row);
  };
  
  $ctrl.Obj = function(row){// полноценные объекты
    
    if(row["объект"]) return [$ctrl.FindObj(row["объект"])];
    
    //~ return $ctrl.data['объекты'].filter(function(obj){
      //~ return row["объекты"].filter(function(oid){
        //~ return obj.id == oid;
      //~ }).pop() && true;
      
    //~ }).map(function(obj){
      //~ return obj.name;
    //~ });
    
    if(row["объекты"]) return row["объекты"].map(function(oid){
      return $ctrl.FindObj(oid);
    });
    
  };
  $ctrl.FindObj = function(oid){// найти объект по ИДу
    return $ctrl.data['объекты'].filter(function(obj){
      return obj.id == oid;
    }).pop();
  };
  
  var text2numRE = /[^\d,\.]/g;
  var saveValueTimeout = undefined;
  var numFields = ["Ставка","КТУ2", "Сумма"]; //  влияют на сумму (часы тут не меняются)
  $ctrl.SaveValue = function(row, name, idx){//сохранить разные значения
    if (saveValueTimeout) $timeout.cancel(saveValueTimeout);
    
    if(name == 'Выплачено' &&  !$ctrl['костыль для крыжика выплаты']) {// клик костыль однократно, но не долечил при отключении крыжика еще раз нужно кликнуть
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
      
    } else {// Примечание и Выплачено
      row['коммент'] = row[name];
    }
    
    var sum_row = undefined;
    if (name == 'Сумма') {
      
      row['пересчитать сумму'] = false;
      
      if (idx !== undefined) {
        sum_row = angular.copy(row);
        sum_row['объект'] = row['объекты'][idx];
        sum_row['коммент'] = row['коммент'][idx];
      }
      
    }
    
    saveValueTimeout = $timeout(function(){
      saveValueTimeout = undefined;
       //~ console.log("Сохранить значение", row, event);
      $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), sum_row || row)
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
      
    }, name == 'Выплачено' ? 0 : 1000);
  };
  
  $ctrl.DataSumIf = function(row){// сумма денег (инициализирует _sum для row)
    //~ if (!row.hasOwnProperty('Сумма')) row['Сумма'] = $ctrl.DataSum(row);
    //~ $timeout(function(){
    if (!row['пересчитать сумму']) return true;
    if (angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx) {
      if( !val ) //{ === null
        row['Сумма'][idx] = $ctrl.DataSumIdx(row, idx);
        //~ row['вычислить сумму'][idx] = true;
      //~ } else {
        //~ row['вычислить сумму'][idx] = false;
      //~ }
    });
    else if (!row['Сумма']) row['Сумма'] = $ctrl.DataSumIdx(row);
    //~ });
    return true;
  };  
  $ctrl.DataSum = function(row){// сумма денег
    //~ var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    if (row['объекты']) return row['объекты'].map(function(o, idx){
      return $ctrl.DataSumIdx(row, idx);
    });
    // по одному объекту
    return $ctrl.DataSumIdx(row);

  };
  $ctrl.DataSumIdx = function(row, idx){// сумма денег по объекту или
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    var ktu = (idx === undefined) ? parseFloat(row['КТУ2']) : parseFloat(row['КТУ2'][idx]);
    var st = (idx === undefined) ? parseFloat(row['Ставка']) : parseFloat(row['Ставка'][idx]);
    var count =  (idx === undefined) ? parseFloat(row[cname]) : parseFloat(row[cname][idx]);
    return Math.floor(count * ktu * st);
  };
  /*$ctrl.DataSumTotal = function(row, obj){// общая сумма по объектам / без row считает по всем строкам
    //~ console.log("общая сумма по объектам", row._sum);
    var sum = 0;
    
    if (row) {
      row._sum.map(function(val){
         sum += parseFloat(val) || 0;
      });
      
    } else {
      $ctrl.data['данные'].filter($ctrl.dataFilter(obj)).map(function(row){
        if (!angular.isArray(row._sum)) sum += parseFloat(row._sum) || 0;
        else row._sum.map(function(val){
           sum += parseFloat(val) || 0;
        });
      });
      
    }
    return sum.toLocaleString('ru-RU');
  };*/
  $ctrl.DataValueTotal = function(row, name, obj) {// общая сумма по объектам / без row считает по всем строкам
    var sum = 0;
    if (row && row[name]) {
      row[name].map(function(val){
         sum += parseFloat(val) || 0;
      });
    } else {
      $ctrl.data['данные'].filter($ctrl.dataFilter(obj)).map(function(row){
        if (!row[name]) return;
        if (!angular.isArray(row[name])) sum += parseFloat(row[name]) || 0;
        else row[name].map(function(val){
          sum += parseFloat(val) || 0;
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
        var v = parseFloat(val['значение'])
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