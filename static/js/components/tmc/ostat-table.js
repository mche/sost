(function () {'use strict';
/*
*/

var moduleName = "ТМЦ текущие остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'ObjectMy', 'Номенклатура', 'ContragentData',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $http, $timeout, $element, appRoutes, TMCOstData, ObjectMyData, NomenData, ContragentData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  //~ $scope.Util = Util;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param={};
    if(!$ctrl.data) $ctrl.data=[];
    var async = [];
    //~ async.push(ObjectMyData.Load().then(function(resp){ $ctrl.objects = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {}); }));
    async.push(ObjectMyData["все объекты без доступа"]().then(function(resp){ $ctrl.objects = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});}));
    async.push(NomenData.Load().then(function(data){ $ctrl.nomen = /*data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {})*/ NomenData.$Data(); }));
    
    if (Object.prototype.toString.call($ctrl.data) == "[object Array]" && $ctrl.data.length === 0) async.push(TMCOstData.Load($ctrl.param).then(function(resp){
    //~ if ($ctrl.data.then || Object.prototype.toString.call($ctrl.data) == "[object Array]") $ctrl.data.then(function(resp){
      if (resp.data.error) return;
      Array.prototype.push.apply($ctrl.data, resp.data);//.map(function(row){ $ctrl.InitRow(row); return row; }));//
      $ctrl['@номенклатура/id'] = [];
      $ctrl['@объекты/id'] = [];
      $ctrl.$data = $ctrl.data.reduce(function(result, row, index, array) {
        if (!result[row['номенклатура/id']]) result[row['номенклатура/id']]={};
        result[row['номенклатура/id']][row['объект/id']] = row;
        if (!$ctrl['@номенклатура/id'].some(function(id){ return row['номенклатура/id'] == id; })) $ctrl['@номенклатура/id'].push(row['номенклатура/id']);
        if (!$ctrl['@объекты/id'].some(function(id){ return row['объект/id'] == id; })) $ctrl['@объекты/id'].push(row['объект/id']);
        return result;
        
      }, {});
      
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

$ctrl.OrderByNomen = function(nid) {///id номенклатуры
  //~ return row['номенклатура'] && row['объект'] && row['номенклатура'].parents_title.join('').toLowerCase()+row['номенклатура'].title.toLowerCase()+row['объект'].name.toLowerCase();
  var n = $ctrl.nomen[nid];
  return n.parents_title.join('').toLowerCase()+n.title.toLowerCase();
};

$ctrl.OrderByObject = function(oid){
  var o = $ctrl.objects[oid];
  return o.name.toLowerCase()+o['$проект'].name.toLowerCase();
  
};

$ctrl.InitRow = function(row) {
  //~ if(row._init) return;
  if (!row) return;
  row['объект'] = /*$ctrl.objects &&*/ $ctrl.objects[row['объект/id']];
  row['номенклатура'] = /*$ctrl.nomen &&*/ $ctrl.nomen[row['номенклатура/id']];
  if (row['объект2/id']) row['$объект2'] = $ctrl.objects[row['объект2/id']];
  if (row['с объекта/id']) row['$с объекта'] = $ctrl.objects[row['с объекта/id']];
  //~ row._init = !0;
  return row;
};

$ctrl.ShowMoveTMC = function(row){
  $ctrl.moveDetailTMC = row;
  row['движение'] = undefined;
  $http.post(appRoutes.url_for('тмц/движение'), row).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
    var ka = ContragentData.$Data();
    row['движение'] = resp.data.map(function(r){
      //~ r['объект'] = $ctrl.objects[r['объект/id']];
      //~ r['номенклатура'] = $ctrl.nomen[r['номенклатура/id']];
      if (!r['@грузоотправители'] && r['@грузоотправители/id']) r['@грузоотправители'] = r['@грузоотправители/id'].map(function(kid){ return kid ? ka[kid] : {}; });
      return r;
    });
    $('#move-detail').modal('open');
  });
  
};

  $ctrl.NewMove = function(){///все позиции остатков в одно перемещение
    var ask = {};
    ask['@позиции тмц'] = angular.copy($ctrl.data)
      .filter(function(row){
        return parseFloat(row['остаток']) > 0;
        
      })
      .sort(function(a, b){
      var an = $ctrl.OrderByNomen(a['номенклатура/id']);
      var bn = $ctrl.OrderByNomen(b['номенклатура/id']);
      if (an > bn) return 1;
      if (an < bn) return -1;
      return 0;
    }).map(function(row){
      var n = row['номенклатура'].parents_title.slice();
      n.push(row['номенклатура'].title);
      return {'номенклатура/id': row['номенклатура/id'], 'номенклатура': n, 'количество': row['остаток'], 'количество/принято': row['остаток'], '$тмц/заявка':{},};
    });///{nomen:  {'selectedItem': {'id': row['номенклатура/id']}}}
    //~ ask['фильтр тмц'] = $ctrl.param['фильтр тмц']
    $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    //~ ask['статус'] = undefined;
    
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