(function () {'use strict';
/*
  Форма табеля рабочего времени
*/

var moduleName = "TimeWorkForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    $ctrl.LoadObjects()
      .then(function(){
        $ctrl.ready=true;
        
        $ctrl.InitMonth();
        
      });
    
    
  };
  
  $ctrl.LoadObjects = function(){
    return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
      .then(function(resp){
        $ctrl.data['объекты'] = resp.data;
        if ($ctrl.data['объекты'] && $ctrl.data['объекты'].length == 1) $ctrl.SelectObj($ctrl.data['объекты'][0]);
      });
    
  };
  
  $ctrl.LoadData = function(){
    if (!$ctrl.obj || !$ctrl.param['месяц']) return;
    var data = {"объект": $ctrl.obj, "месяц": $ctrl.param['месяц']};
    return $http.post(appRoutes.url_for('табель рабочего времени/данные'), data)
      .then(function(resp){
        angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
      });
    
  };
  
  $ctrl.InitMonth = function(){
    
    $ctrl.InitDays();
    
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        //~ onClose: $ctrl.SetDate,
        onSet: $ctrl.SetDate,
        monthsFull: [ 'январь', 'февраль', 'марта', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
    
  };
  
  $ctrl.InitTable = function(){
    var maxWidth = 0;
    $timeout(function(){
      var td1 = $('.horizontal-scroll > table > * > tr > td:first-child');
      td1.each(function(){
        var w = $(this).outerWidth(true);
        if (maxWidth < w) maxWidth = w;
        
      });
      //~ console.log("outerWidth", maxWidth);
      td1.css("margin-left", '-'+maxWidth+'px');
      $('.horizontal-scroll > table > * > tr > th:first-child').css("margin-left", '-'+maxWidth+'px');
      $('.horizontal-scroll').css("margin-left", maxWidth+'px');
      
      
    });
   
    //~ $('table.timework', $($element[0])).DataTable( {
        //~ fixedColumns: {leftColumns: 2  }
    //~ } );
    
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
    $ctrl.days = undefined;
    $ctrl.data['значения'] = undefined;
    $timeout(function(){
      $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  $ctrl.InitDays = function(){
    $ctrl.days = dateFns.eachDay(dateFns.startOfMonth($ctrl.param['месяц']), dateFns.endOfMonth($ctrl.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
    
  };
  
  var weekdays2char = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  $ctrl.FormatThDay = function(d){
    return [weekdays2char[dateFns.format(d, 'd')], dateFns.getDate(d)];
  };
  
  $ctrl.IsSunSat = function(d){
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  
  $ctrl.SelectObj = function(obj){
    if (obj === $ctrl.obj) return;
    $ctrl.obj = undefined;
    $ctrl.data['значения'] = undefined;
    $timeout(function(){
      $ctrl.obj = obj;
      $ctrl.LoadData();
      
      //~ if(!$ctrl.obj['ид профиля--дата']) $ctrl.obj['ид профиля--дата'] = {};
    });
    
  };
  
  $scope.inputSelect = [
    {"title": '1 час', "value": '1'},
    {"title": '2 часа', "value": '2'},
    {"title": '3 часа', "value": '3'},
    {"title": '4 часа', "value": '4'},
    {"title": '5 часов', "value": '5'},
    {"title": '6 часов', "value": '6'},
    {"title": '7 часов', "value": '7'},
    {"title": '8 часов', "value": '8'},
    {"title": '9 часов', "value": '9'},
    {"title": '10 часов', "value": '10'},
    {"title": '11 часов', "value": '11'},
    {"title": '12 часов', "value": '12'},
    {"title": '13 часов', "value": '13'},
    {"title": 'Прогул', "value": 'П'},
    {"title": 'Не был', "value": 'Н'},
    {"title": 'Больничный', "value": 'Б'},
    {"title": 'Отпуск', "value": 'О'},
  
  ];
  $ctrl.FocusInput = function(profile, d, event) {
    var df = dateFns.format(d, 'YYYY-MM-DD');
    if (!$ctrl.data['значения'][profile.id]) $ctrl.data['значения'][profile.id]={};
    if (!$ctrl.data['значения'][profile.id][df]) $ctrl.data['значения'][profile.id][df] = {};
    var data = $ctrl.data['значения'][profile.id][df];
    if(event) {
      var input = $(event.target);
      input.autocomplete({
        lookup: $scope.inputSelect.map(function(item){ return {"value":item.title, "data": item};}),
        appendTo: input.parent(),
        formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
          //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
          if (data['значение'] == suggestion.data.value) return '<strong>'+suggestion.value+'</strong>';
          return suggestion.value;
        },
        onSelect: function (suggestion) {
          $timeout(function() {
            data['значение'] = suggestion.data.value;
            data._edit = true;
            $ctrl.Total(profile);
          });
          $ctrl.Save({"профиль": profile.id, "дата":df, "объект":$ctrl.obj.id, "значение":suggestion.data.value});
          
        },
        //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
        //~ onHide: function (container) {}
        
      });
      input.autocomplete().toggleAll();
    }
    //~ console.log("FocusInput", $ctrl.data['значения'][profile.id]);
    return data;
  };
  
  $ctrl.Total = function(profile, flag){
    if (!$ctrl.data['значения'][profile.id]) $ctrl.data['значения'][profile.id]={};
    var data = $ctrl.data['значения'][profile.id];
    if (flag) return data.total;
    data.total = 0;
    angular.forEach(data, function(val, key){data.total += parseInt(val['значение']) || 0;});
    return data.total;
  }
  
  $ctrl.Save = function(data){// click list item
    console.log("Save", data);
    
  };
  
  $ctrl.DblclickInput = function(profile, d){
    var data  = $ctrl.FocusInput(profile, d);
    $timeout(function(){data._dblclick = !data._dblclick;});
    console.log("DblclickInput", data);
  };
  
  $ctrl.SaveDesrc = function(profile, d) {
    var data  = $ctrl.FocusInput(profile, d);
    data._dblclick = false;
  };
  //~ 
  
};

/*==========================================================*/
module

.component('timeWorkForm', {
  templateUrl: "time/work/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());