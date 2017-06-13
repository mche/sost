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
        monthsFull: [ 'январь', 'февраль', 'марта', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
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
      //~ $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  $ctrl.LoadObjects = function(){
    return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
      .then(function(resp){
        $ctrl.data['объекты'] = resp.data;
        if ($ctrl.data['объекты'] && $ctrl.data['объекты'].length == 1) $ctrl.SelectObj($ctrl.data['объекты'][0]);
      });
    
  };
  
  $ctrl.SelectObj = function(obj){
    //~ if (obj === $ctrl.param['объект']) return;// всегда обновлять
    $ctrl.param['объект'] = undefined;
    $ctrl.data['данные'] = undefined;
    $timeout(function(){
      $ctrl.param['объект'] = obj;
      $ctrl.LoadData();
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        //~ angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
        $ctrl.data['данные'] = resp.data;
      });
    
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