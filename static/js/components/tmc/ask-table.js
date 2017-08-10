(function () {'use strict';
/*
*/

var moduleName = "TMC-Ask-Table";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'DateBetween']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;

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
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/список заявок', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };

  $ctrl.FormatMoney = function(val){
    if(val === undefined || val === null ) return '';
    return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  };
  
  $ctrl.Edit = function(it){
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
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
    
  };

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    $ctrl.LoadData();//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.table['сумма'].sign = abs;
    //~ }
    $ctrl.param.table[name].ready = 1;
    $ctrl.LoadData();//$ctrl.param.table
    
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

.component('tmcAskTable', {
  templateUrl: "tmc/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());