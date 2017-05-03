(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param={};
    
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
    delete $ctrl.param.new;
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
    var n = $ctrl.param.new;
    delete n._newInit;
    n._new = true;
    $ctrl.data.unshift(n);
    //~ $timeout(function(){
    $timeout(function(){
      $('html, body').animate({
        scrollTop: $("table tbody tr:first-child", $($element[0])).offset().top
      }, 1500);
    });
    //~ });
    
    
    
  };
  
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