(function () {'use strict';
/*
*/

var moduleName = "TMC-Ask-Form";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'NomenItem']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.ready = true;
    
  };
  $ctrl.New = function(){
      $ctrl.ask = {"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    
  };
  $ctrl.Cancel = function(){
     delete $ctrl.ask;
    
  };
  
  var filterValidPos = function(row){
    var id = row["номенклатура"] && row["номенклатура"].selectedItem && row["номенклатура"].selectedItem.id;
    var newItem = row["номенклатура"] && row["номенклатура"].newPath && row["номенклатура"].newPath[0] && row["номенклатура"].newPath[0].title;
    var kol = parseInt(row["количество"]);
    //~ console.log("filterValidPos", this, id, newItem, row["количество"]);
    if(this) return !!id || !!newItem || !!kol;
    return (!!id || !!newItem) & !!kol;
  };
  $ctrl.Save = function(ask){
    var edit = $ctrl.ask["позиции"].filter(filterValidPos, true);
    if(!ask) {
      var valid = $ctrl.ask["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return edit.length && valid.length == edit.length;
      
    }
    ask['объект'] = $ctrl.param["объект"].id;
    return console.log("Save", ask);
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        console.log("Save", resp.data);
      });
  };
  
  $ctrl.ChangeKol=function($last, row){// автовставка новой строки
    if($last && row['количество']) $ctrl.AddRow(true);
  };
  
  $ctrl.DeleteRow = function($index){
    $ctrl.ask['позиции'].splice($index, 1);
  };
  
  $ctrl.FocusRow= function(row){
    //~ console.log("FocusRow", row);
    $ctrl.lastFocusRow = row;
  };
  $ctrl.AddRow = function(last){// last - в конец
    var n = {"номенклатура":{}};
    if(last || !$ctrl.lastFocusRow) return $ctrl.ask["позиции"].push(n);
    var index = 1000;
    if($ctrl.lastFocusRow) index = $ctrl.ask['позиции'].indexOf($ctrl.lastFocusRow)+1;
    $ctrl.ask['позиции'].splice(index, 0, n);
  };

  
};

/*=============================================================*/

module

.component('tmcAskForm', {
  templateUrl: "tmc/ask/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());