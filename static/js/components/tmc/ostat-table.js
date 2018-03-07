(function () {'use strict';
/*
*/

var moduleName = "ТМЦ текущие остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'ObjectMy', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $q, $http, $timeout, $element, appRoutes, TMCOstData, ObjectMyData, NomenData) {
  var $ctrl = this;
  //~ $scope.parseFloat = parseFloat;
  //~ $scope.Util = Util;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param={};
    if(!$ctrl.data) $ctrl.data=[];
    var async = [];
    //~ async.push(ObjectMyData.Load().then(function(resp){ $ctrl.objects = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {}); }));
    async.push(ObjectMyData["все объекты без доступа"]().then(function(resp){ $ctrl.objects = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});}));
    async.push(NomenData.Load().then(function(resp){ $ctrl.nomen = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {}); }));
    
    if (Object.prototype.toString.call($ctrl.data) == "[object Array]" && $ctrl.data.length === 0) async.push(TMCOstData.Load($ctrl.param).then(function(resp){
    //~ if ($ctrl.data.then || Object.prototype.toString.call($ctrl.data) == "[object Array]") $ctrl.data.then(function(resp){
      if (resp.data.error) return;
      Array.prototype.push.apply($ctrl.data, resp.data);//.map(function(row){ $ctrl.InitRow(row); return row; }));//
      
    }));
    $q.all(async).then(function(){ $ctrl.ready = !0; });

    
    $timeout(function(){
      $('.modal', $($element[0])).modal({
        //~ endingTop: '0%',
        //~ ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          //~ $ctrl.modal_trigger = trigger;
      });
    });
    
  };

$ctrl.OrderBy = function(row) {
  return row['номенклатура'] && row['объект'] && row['номенклатура'].parents_title.join('')+row['номенклатура'].title+row['объект'].name;
};

$ctrl.InitRow = function(row) {
  //~ if(row._init) return;
  row['объект'] = /*$ctrl.objects &&*/ $ctrl.objects[row['объект/id']];
  row['номенклатура'] = /*$ctrl.nomen &&*/ $ctrl.nomen[row['номенклатура/id']];
  //~ row._init = !0;
  
};

$ctrl.ShowMoveTMC = function(row){
  $ctrl.moveDetailTMC = row;
  row['движение'] = undefined;
  $http.post(appRoutes.url_for('тмц/движение'), row).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
    row['движение'] = resp.data;//.map(function(r){
      //~ r['объект'] = $ctrl.objects[r['объект/id']];
      //~ r['номенклатура'] = $ctrl.nomen[r['номенклатура/id']];
      //~ return r;
    //~ });
    $('#move-detail').modal('open');
  });
  
};
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  //~ var data;
  var $this = {
    //~ Objects: function() {return objects;},
    Load: function(param){ return $http.post(appRoutes.url_for('тмц/текущие остатки'), param); /*return $this;*/ },
  };
  return $this;//.RefreshObjects();
  
};

/*=============================================================*/

module

.factory('TMCOstData', Data)

.component('tmcOstatTable', {
  templateUrl: "tmc/ostat/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data:'<',

  },
  controller: Component
})

;

}());