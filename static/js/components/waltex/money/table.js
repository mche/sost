(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param={};
    $scope.param = $ctrl.param;
    
    //~ console.log(moduleName, "$onInit");
    //~ $ctrl.project =  $ctrl.param['проект/id'];
    
    $http.get(appRoutes.url_for('список движения ДС', $ctrl.param['проект/id'])).then(function(resp){
      if(resp.data.error) $scope.error = resp.data.error;
      else $ctrl.data= resp.data;
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.parseSum = function(it) {//
    if(!it['сумма']) return '';
    var sum = parseFloat(it['сумма']);
    delete it["приход"];
    delete it["расход"];
    
    if(sum > 0) it["приход"] = it['сумма'];
    else it["расход"] = it['сумма'].replace(/-/g, "");
  };
  
  $ctrl.Edit = function(it){
    $ctrl.param.id = it.id;
    delete $ctrl.param.newX;
    $ctrl.param.edit = it;
    $ctrl.param.edit._init=true;
    //~ $timeout(function(){$ctrl.param.form= true;});
    
  };
  
  $ctrl.Delete = function(){
    var it = $ctrl.param.delete;
    delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.AppendNew = function(){
    //~ console.log("AppendNew");
    var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    delete n._append;
    n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(n);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    $timeout(function(){
      
      //~ $ctrl.ready = true;
      $('html, body').animate({
        scrollTop: $("table tbody tr:first-child", $($element[0])).offset().top
      }, 1500);
    });
    //~ });
    
    
    
  };
  
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if (newVal.edit)  return;
    if (newVal.newX && newVal.newX._append) return $ctrl.AppendNew();
    if (newVal.delete) return $ctrl.Delete();
}, true);
  
};


/*=============================================================*/

module

.component('moneyTable', {
  templateUrl: "money/table",
  scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());