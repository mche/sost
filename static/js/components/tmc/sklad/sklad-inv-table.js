(function () {'use strict';
/*
  Таблица инвентаризаций
*/

var moduleName = "ТМЦ список инвентаризаций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'ТМЦ таблица позиций', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, $q, $timeout, $element, /*$http, appRoutes,*/ Util, $Номенклатура) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  $scope.extend = angular.extend;
  


  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param = {};
    //~ if(!$ctrl.param['фильтр тмц']) $ctrl.param['фильтр тмц'] = function(){ return !0;};
    
    var async = [];
    
    if ($ctrl.data.Load) async.push($ctrl.data.Load($ctrl.param).then(function(){
      $ctrl.$data = $ctrl.data;
      $ctrl.data = $ctrl.$data.Data();///не копия массива
    }));
    
    async.push($Номенклатура.Load());
    $q.all(async).then(function(){
      $ctrl.ready = true;
    
      $timeout(function(){
        $('.show-on-ready', $element[0]).slideDown();
        
      });
      
    })
    
    
    
  };
  
  $ctrl.FilterData = function(item){
    var filter = $ctrl.param['фильтр'];
    if(!filter) return !item._hide;
    return filter(item);
    
  };
  
  $ctrl.OrderByData = function(item){
    return 1;///item['дата1'];
  };
  
  var MapTMC = function(row){
    var nomen = this;
    if (!row['$номенклатура']) row['$номенклатура'] = nomen[row['номенклатура/id']];
    
  };
  $ctrl.InitRow = function(item){
    item['@позиции тмц'].map(MapTMC,  $Номенклатура.$Data());
  };
  
  $ctrl.Edit = function(item){
    //~ if ($ctrl.onEdit) $ctrl.onEdit({item:item});
    $rootScope.$broadcast('Редактировать инвентаризацию ТМЦ', angular.copy(item));
    
  };
  
};
/*********************************************/

///получение данных
/*var $ТМЦинвентаризации  = function($http, appRoutes){
  var Data = [], $Data = {},
    Del = function(key){ delete $Data[key]; },
    Set = function(key){ this[key] = $Data[key]; },
    Reduce = function(result, item, index, array) {  result[item.id] = item; return result; }
  ;
  var $this = {
    "Clear": function(){
      Data.splice(0, Data.length);
      Object.keys($Data).map(Del);
      
      },
    "Load": function(param, $scope) {//
        $this.Clear();
        return $http.post(appRoutes.url_for('тмц/склад/список инвентаризаций'), param) //'список движения ДС'
          .then(function(resp){
            if(resp.data.error) {
              Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
              if ($scope) $scope.error = resp.data.error;
            }
            else {
              Array.prototype.push.apply(Data, resp.data);// первый список - позиции тмц(необработанные и обработанные)
              resp.data.reduce(Reduce, $Data);
              return resp.data;
            }
          });
      },
      "Data": function(arr){///если передан массив - в него закинуть позиции
        if (!arr) return Data;
        Array.prototype.push.apply(arr, Data);
        return arr;
      },
      "$Data": function(obj){///если передан объект - в него закинуть позиции
        if (!obj) return $Data;
        Object.keys($Data).map(Set, obj);
        return obj;
      },
  };
  return $this;
};
*/
/************************************************/
module

//~ .factory('$ТМЦинвентаризации', $ТМЦинвентаризации)

.component('tmcSkladInvTable', {
  templateUrl: "tmc/sklad/inv/table",
  //~ scope: {},
  bindings: {
    data: '<', //массив
    param: '<',
    onEdit: '&',

  },
  controller: Component
})

;

}());