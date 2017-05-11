(function () {'use strict';
/*
  отчет ДС
*/

var moduleName = "WaltexReport";

var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache',  'appRoutes', 'ProjectList', 'ReportTable',  'DateBetween'  ]);//'ngSanitize',

var Controll = function($scope, $attrs, $element, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};
    //~ ctrl.param = $scope.param;
    if($attrs.projectId) $scope.param["проект"] ={"id": parseInt($attrs.projectId)};
    $scope.param["дата"] = {"values":[dateFns.startOfYear(new Date()), dateFns.endOfMonth(new Date())]};
    $scope.param['интервал'] = '';
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/report.html'), 1)
      .then(function(proms){
        
        ctrl.ready= true;
        
      });
  };
  
  ctrl.SelectProject = function(p){
    //~ console.log("SelectProject");
    $scope.param["проект"] = undefined;
    if(!p) return;
    $timeout(function(){
      $scope.param["проект"] = p;
    });
  };
  
  ctrl.ReadyProject = function(){
    return ctrl.ready && $scope.param['проект'] && $scope.param['проект'].id !== 0;
    
  };
  
  ctrl.ReadyDate = function(){
    return ctrl.ReadyProject() && $scope.param["дата"] && $scope.param["дата"].ready;
    
  };
  
  ctrl.Refresh = function(){
    console.log($scope.param);
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
      $ctrl.param['интервал'] = 'MM';
      //~ $ctrl.select_interval.val('MM').change();
      //~ $('option[value="MM"]', $ctrl.select_interval).prop('selected', true);
      
      
      });
  };
  
  $ctrl.Refresh = function(){
    if($ctrl.onRefresh) $ctrl.onRefresh();
    
  };
  
  $ctrl.ChangeInterval = function(event) {
    if(!event) return;
    //~ console.log();
    $ctrl.param['интервал'] = $(event.target).val();
    
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