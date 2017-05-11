(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'DateBetween']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      //~ if(!$ctrl.param) $ctrl.param={};
      if(!$ctrl.param.table) $ctrl.param.table={"дата":{"values":[]}, "сумма":{"values":[]}};// фильтры
      $scope.param = $ctrl.param;
      //~ console.log(moduleName, "$onInit", $ctrl.param.table);
      
      $ctrl.LoadData().then(function(){
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
        });
        
      });
    });
    
  };
  
  $ctrl.LoadData = function(param){
    
    //~ if (param) Object.values(param).filter(function(data){ return data._ready}) angular.forEach(, function(){}).unshift();
    
    return $http.post(appRoutes.url_for('список движения ДС', $ctrl.param['проект'].id), param || {}).then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else $ctrl.data= resp.data;
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
    
    //~ $timeout(function(){
      //~ $('html, body').animate({
        //~ scrollTop: $("table tbody tr:first-child", $($element[0])).offset().top
      //~ }, 1500);
    //~ });
    
  };
  
  $ctrl.SendDate = function(){
    //~ console.log($ctrl.param.table['дата']);
    $ctrl.param.table['дата'].ready = 1;
    $ctrl.LoadData($ctrl.param.table).then(function(){
      //~ $ctrl.param.table['дата'].ready = true;
      
    });
    
  };
  
  $ctrl.CancelDate = function(){
    if(!$ctrl.param.table['дата'].ready) return;
    $ctrl.param.table['дата'].ready = 0;
    $ctrl.LoadData($ctrl.param.table);
    
  };
  
  $ctrl.CancelSum = function(){
    if(!$ctrl.param.table['сумма'].ready) return;
    $ctrl.param.table['сумма'].ready = 0;
    $ctrl.LoadData($ctrl.param.table);
  };
  
  $ctrl.SendSum = function(){
    var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
    $ctrl.param.table['сумма'].sign = abs;
    $ctrl.param.table['сумма'].ready = 1;
    $ctrl.LoadData($ctrl.param.table);
    
  };
  

  
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.newX && newVal.newX._append) return $ctrl.AppendNew();
    if (newVal.delete) return $ctrl.Delete();
}, true);
  
};


/*=============================================================*/

module

.component('moneyTable', {
  templateUrl: "money/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());