(function () {'use strict';
/*
  Отчет на основе отчета сводки-начисления ЗП
  Для спец-та по тендерам
*/
var moduleName = "TimeWorkReportObj";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'loadTemplateCache', 'appRoutes', 'angular-toArrayFilter']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/report-obj.html'), 1)
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
    
    /*
    var async = [];
    async.push($ctrl.LoadObjects());
    async.push($ctrl.LoadBrigs());
    $q.all(async).then(function(){
      $ctrl.ready= true;
      
      $timeout(function() {
        $('.modal', $($element[0])).modal({"dismissible": false,});
        $ctrl.InitDays();
        $('select', $($element[0])).material_select();
      });
    });
    */
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
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
    
    $timeout(function(){
      $ctrl.LoadData();
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
    $timeout(function(){
      $ctrl.param['объект'] = obj;
      //~ $ctrl.LoadData().then(function(){});
    });
    
  };
  
  $ctrl.LoadData = function(){
    $ctrl.data['данные'] = undefined;
    $ctrl.data['данные/профили'] = undefined;
    $ctrl.data['объекты'] = undefined;
    //~ if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    //~ var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/сотрудники на объектах/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        //~ angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
        $ctrl.data['данные'] = resp.data;
        $ctrl.data['объекты'] = {};
        $ctrl.data['объекты']["0"] = {"id":0, "name":'Все объекты'};
        //~ if (!$ctrl.data['данные/профили']) $ctrl.data['данные/профили']=[]; // для фильтации по одному ФИО
        $ctrl.data['данные/профили'] = {};// для фильтации по одному ФИО
        angular.forEach($ctrl.data['данные'], function(item) {
          if (!$ctrl.data['данные/профили'][item['ФИО']]) $ctrl.data['данные/профили'][item['ФИО']] = {"id": item['профиль'], "names":item['ФИО']};
          angular.forEach(item['объекты'], function(oid, idx) {
            if(!$ctrl.data['объекты'][oid+'']) $ctrl.data['объекты'][oid+''] = {"id":oid+'', "name":item['объекты/название'][idx]};
          });
        });
        if (!$ctrl.autocompleteSelectProfile) $ctrl.autocompleteSelectProfile = [];
        $ctrl.autocompleteSelectProfile.length = 0;
        $ctrl.filterProfile=undefined;
      });
    
  };
  
  $ctrl.DataObj = function() {// выдать список объектов или бригад
    if ($ctrl.param['общий список'] || $ctrl.param['объект']) return $ctrl.data['объекты'];
    //~ if () return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    //~ if ($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return $ctrl.data['бригады'];
    
    return [];
    //~ if ($ctrl.param['объект']) return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    
  };
  
  var filter_true = function(row){return true;};
  
  $ctrl.objFilter = function(obj, index){// 
    if($ctrl.param['общий список']) return index === 0;
    if(!$ctrl.param['объект'].id) return !!obj.id;//filter_true;
    
    //~ if ($ctrl.param['объект']) {
      //~ if($ctrl.data['объекты'].indexOf($ctrl.param['объект']) ===0 && obj.id) return true;
      return $ctrl.param['объект'] === obj;//true;
    //~ }
    
  };
  
  
  /*логика фильтрации строк*/
  $ctrl.FilterObj = function(oid){ return oid == this.id;};
  $ctrl.FilterObj0 = function(oid){ if(this.id === 0) {return true;} else {return oid == this.id;}};// это надо
  $ctrl.dataFilter = function(obj, index) {// вернуть фильтующую функцию для объекта/бригады
    if($ctrl.filterProfile) {
      //~ if($ctrl.param['общий список'] || $ctrl.param['объект']) 
      var re = new RegExp($ctrl.filterProfile,"i");
      return function(row, idx){ return re.test(row["ФИО"]) && ($ctrl.param['общий список'] || row["объекты"].filter($ctrl.FilterObj, obj).pop()); };
      
    }
    if($ctrl.param['общий список']) return filter_true;
    return function(row, idx){ return row["объекты"].filter($ctrl.FilterObj0, obj).pop();  };
  };
  
  $ctrl.RowObjFilter = function(obj) {// фильтр для колонки всего смен
    if($ctrl.param['общий список']) return filter_true;
    return function(oid, idx){ return oid == obj.id;  };
  };
  
  $ctrl.InitRow = function(row){
    row['месяц'] = $ctrl.param['месяц'];
  };

  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkReportObj', {
  templateUrl: "timework/report/obj",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());