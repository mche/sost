(function () {'use strict';
/*
  отчет ДС
*/
var moduleName = "WaltexReport";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache',  'appRoutes', 'ProjectList', 'ReportTable', 'DateBetween', 'WaltexMoney' ]);//'ngSanitize',

var Controll = function($scope, $attrs, /*$element,*/ $timeout, /*$q,*/  TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {"проект":0};

    //~ ctrl.param = $scope.param;
    if($attrs.projectId) $scope.param["проект"] ={"id": parseInt($attrs.projectId)};
    $scope.param["дата"] = {"values":[dateFns.startOfMonth(new Date()), dateFns.endOfMonth(new Date())], "margin":"0"};
    $scope.param['интервал'] = '';
    $scope.param['кошелек'] = {"без сохранения": true, "проект": {"id":0, "ready":true}};
    $scope.param['кошелек2'] = {"без сохранения": true,};
    $scope.param['контрагент'] = {"без сохранения": true};
    $scope.param['профиль'] = {};
    $scope.param['объект'] = {"проект": {"id":0, "ready":true}};
    $scope.param['все проекты'] = true;
    
    
    //~ var async = [];
    
    //~ async.push(
    TemplateCache.split(appRoutes.url_for('assets', 'waltex/report.html'), 1)//, appRoutes.url_for('assets', 'waltex/money.html')
    //~ async.push(loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money.html')));
    //~ $q.all(async)
      .then(function(proms){
        //~ module.requires.push('WaltexMoney');
        ctrl.ready= true;
        
      });
  };
  
  ctrl.SelectProject = function(p){
    
    $scope.param["проект"] = undefined;
    ['кошелек', 'объект'].map(function(name){
      $scope.param[name]["проект"].ready = false;
      $scope.param[name].id = undefined;
      $scope.param[name].title = '';
      
      $timeout(function(){
        $scope.param["проект"] = p || 0; // 0 - все проекты
        if (p) $scope.param[name]['проект'].id = p.id;
        else $scope.param[name]['проект'].id = 0;
        $scope.param[name]['проект'].ready = true;
      });
    });
    
    //~ if(!p) return;
    
  };
  

  
  ctrl.ReadyProject = function(){
    return ctrl.ready;// && $scope.param['проект'] !== undefined;
    
  };
  
  ctrl.ReadyForm = function(){// основная таблица
    return ctrl.ReadyProject() && /*$scope.param['проект'] !== undefined &&*/ $scope.param["дата"] && $scope.param["дата"].ready;
    
  };
  
  //~ ctrl.ReadyFormWallets = function(){// по всем кошелькам таблица/компонент
    //~ return ctrl.ReadyProject() && $scope.param['проект'] !== undefined && $scope.param['все кошельки'] && $scope.param["дата"] && $scope.param["дата"].ready;
    
  //~ };
  
  ctrl.Refresh = function(){
    //~ console.log($scope.param);
    $scope.param["дата"].ready = false;
    $timeout(function(){
      $scope.param["дата"].ready = true;
    });
    
  };
  
};

var Component = function  ($scope, $timeout, $element) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $ctrl.ready = true;
    $timeout(function(){
      
      $ctrl.select_interval = $('select', $($element[0]));
      
      $ctrl.select_interval.material_select();
      $ctrl.select_interval.change($ctrl.ChangeInterval);
      $('input.select-dropdown', $ctrl.select_interval.parent()).val('Месяц');
      $ctrl.param['интервал'] = 'YYYYmm/TMMon YY';
      //~ $ctrl.select_interval.val('MM').change();
      //~ $('option[value="MM"]', $ctrl.select_interval).prop('selected', true);
      
      
      });
  };

  $ctrl.FilterObj  = function(item){/// по проекту
    if (!$ctrl.param["проект"].id) return true;
    return item.$проект.id == $ctrl.param["проект"].id;
    
  };
  
  $ctrl.Refresh = function(){
    if($ctrl.onRefresh) $ctrl.onRefresh();
    
  };
  
  $ctrl.ChangeInterval = function(event) {
    if(!event) return;
    //~ console.log();
    $ctrl.param['интервал'] = $(event.target).val();
    
  };
  
  $ctrl.ChangeAllCheckbox = function(name){
    $timeout(function(){
      ['кошельки', 'кошельки2', 'контрагенты', 'профили', 'объекты', 'пустое движение'].map(function(n){if(name != 'все '+n) $ctrl.param['все '+n] = false;});
    });
    
  };
  
  $ctrl.SelectItems = function(name){/// контрагент гасит сотрудника и наоборот
    [/*'кошелек',*/ 'контрагент', 'профиль', /*'объект'*/].map(function(n){if(name != n) {$ctrl.param[n].title=''; $ctrl.param[n].id=undefined;}});
  };
};

/*=====================================================================*/

module

.controller('Controll', Controll)

.component('reportForm', {
  templateUrl: "report/form",
  bindings: {
    param: '<',
    onRefresh: '&',
  },
  controller: Component
})

;

}());