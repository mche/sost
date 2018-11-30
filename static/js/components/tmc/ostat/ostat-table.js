(function () {'use strict';
/*
*/

var moduleName = "ТМЦ текущие остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'Объекты', 'Номенклатура', 'Контрагенты',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $http, $timeout, $element, appRoutes, $ТМЦТекущиеОстатки, $Объекты, $Номенклатура, $Контрагенты) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $c.re = {'приход': new RegExp('приход'), 'расход': new RegExp('расход'), 'списание': new RegExp('списание'), 'инвентаризация': new RegExp('инвентаризация')};
  //~ $scope.Util = Util;
  $c['крыжики номенклатуры'] = {};///по ИД
  
  $c.$onInit = function(){
    if(!$c.param) $c.param={};
    if(!$c.data) $c.data=[];
    var async = [];
    async.push($Объекты["все объекты без доступа"]().then(function(resp){ $c.$объекты = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});}));
    async.push($Номенклатура.Load().then(function(data){ $c.nomen = /*data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {})*/ $Номенклатура.$Data(); }));
    
    if (Object.prototype.toString.call($c.data) == "[object Array]" && $c.data.length === 0) async.push($ТМЦТекущиеОстатки.Load($c.param).then(function(resp){
    //~ if ($c.data.then || Object.prototype.toString.call($c.data) == "[object Array]") $c.data.then(function(resp){
      if (resp.data.error) return;
      Array.prototype.push.apply($c.data, resp.data);//.map(function(row){ $c.InitRow(row); return row; }));//
    }));
    else if ($c.data.then) async.push($c.data.then(function(resp){
      if (resp.data.error) return;
      $c.data = resp.data;
    }));
    $q.all(async).then(function(){
      
      $c['@номенклатура/id'] = [];
      $c['@объекты/id'] = [];
      $c.$data = $c.data.reduce(function(result, row, index, array) {
        if (!result[row['объект/id']]) result[row['объект/id']]={};
        result[row['объект/id']][row['номенклатура/id']] = row;
        if (!$c['@номенклатура/id'].some(function(id){ return row['номенклатура/id'] == id; })) $c['@номенклатура/id'].push(row['номенклатура/id']);
        if (!$c['@объекты/id'].some(function(id){ return row['объект/id'] == id; })) $c['@объекты/id'].push(row['объект/id']);
        return result;
        
      }, {});
      
      $c.ready = !0;
      
      $timeout(function(){
        $('.modal', $($element[0])).modal({
          //~ endingTop: '0%',
          //~ ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            //~ $c.modal_trigger = trigger;
        });
      });
      
    });

    
    
    
  };

$c.FilterByNomen = function(nid){
  var nomen = $c.nomen[nid];
  //~ console.log("FilterByNomen", nomen);
  if (!$c['фильтр наименования']) return true;
  var title = nomen.parents_title.join('')+nomen.title;
  var re = new RegExp($c['фильтр наименования']);
  return re.test(title);
};

$c.OrderByNomen = function(nid) {///id номенклатуры
  //~ return row['номенклатура'] && row['объект'] && row['номенклатура'].parents_title.join('').toLowerCase()+row['номенклатура'].title.toLowerCase()+row['объект'].name.toLowerCase();
  var n = $c.nomen[nid];
  //~ console.log('OrderByNomen', n);
  return n && n.parents_title.join('').toLowerCase()+n.title.toLowerCase();
};

$c.OrderByObject = function(oid){
  var o = $c.$объекты[oid];
  return o.name.toLowerCase()+o['$проект'].name.toLowerCase();
  
};

$c.InitRow = function(row) {
  //~ if(row._init) return;
  if (!row) return;
  row['объект'] = /*$c.$объекты &&*/ $c.$объекты[row['объект/id']];
  row['номенклатура'] = /*$c.nomen &&*/ $c.nomen[row['номенклатура/id']];
  if (row['объект2/id']) row['$объект2'] = $c.$объекты[row['объект2/id']];
  if (row['с объекта/id']) row['$с объекта'] = $c.$объекты[row['с объекта/id']];
  if (row['движение']) {
    row['приход'] = $c.re['приход'].test(row['движение']);
    row['расход'] = $c.re['расход'].test(row['движение']);
    row['списание'] = $c.re['списание'].test(row['движение']);
    row['инвентаризация'] = $c.re['инвентаризация'].test(row['движение']);
  }
  //~ row._init = !0;
  return row;
};

$c.ShowMoveTMC = function(row){
  if(!row) return;///нет движения
  $c.moveDetailTMC = row;
  $('#move-detail').modal('open');
  row['движение'] = undefined;
  $http.post(appRoutes.url_for('тмц/движение'), row).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
    var ka = $Контрагенты.$Data();
    row['движение'] = resp.data.map(function(r){
      //~ r['объект'] = $c.$объекты[r['объект/id']];
      //~ r['номенклатура'] = $c.nomen[r['номенклатура/id']];
      if (!r['@грузоотправители'] && r['@грузоотправители/id']) r['@грузоотправители'] = r['@грузоотправители/id'].map(function(kid){ return kid ? ka[kid] : {}; });
      return r;
    });
    
  });
  
};

var IsCheckedNomen = function(nid){ return !!$c['крыжики номенклатуры'][nid]; };
$c.ShowMoveBtn = function(oid){
  return Object.keys($c['крыжики номенклатуры']).some(IsCheckedNomen);
  
};

  $c.NewMove = function(oid){///позиции остатков в перемещение
    var ask = {};
    
    ask['@позиции тмц'] = angular.copy($c.data)
      .filter(function(row){
        return row['объект/id'] == oid /*[row['номенклатура/id']] */ && parseFloat(row['остаток']) > 0;
        
      })
      .sort(function(a, b){
      var an = $c.OrderByNomen(a['номенклатура/id']);
      var bn = $c.OrderByNomen(b['номенклатура/id']);
      if (an > bn) return 1;
      if (an < bn) return -1;
      return 0;
    }).map(function(row){
      var n = row['номенклатура'].parents_title.slice();
      n.push(row['номенклатура'].title);
      return {'номенклатура/id': row['номенклатура/id'], 'номенклатура': n, 'количество': row['остаток'], /*'количество/принято': row['остаток'],*/ '$тмц/заявка':{},};
    });///{nomen:  {'selectedItem': {'id': row['номенклатура/id']}}}
    //~ ask['фильтр тмц'] = $c.param['фильтр тмц']
    console.log("NewMove", oid, ask);
    $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    //~ ask['статус'] = undefined;
    
  };
  
};

/******************************************************/
var Data  = function($http, appRoutes, Util){
  var then = {}, Data = {}, DataByNomenId = {};
  var $this = {
    //~ Objects: function() {return objects;},
    "Load": function(param){
      var oid = (param['объект'] && param['объект'].id) || 0;
      if (!Data[oid]) Data[oid] = [];
      if (!then[oid]) then[oid] = $http.post(appRoutes.url_for('тмц/текущие остатки'), param).then(function(resp){
        Array.prototype.push.apply(Data[oid], resp.data);
        return resp;
      });
      return then[oid]; /*return $this;*/
    },
    "Data": function(oid){
      if (Util.IsType(oid, 'object')) oid = (oid['объект'] && oid['объект'].id) || 0;
      return Data[oid];
    },
    "$DataByNomenId": function(oid){
      if (Util.IsType(oid, 'object')) oid = (oid['объект'] && oid['объект'].id) || 0;
      if (!DataByNomenId[oid]) DataByNomenId[oid] = Data[oid].reduce(function(result, item, index, array) {
        if (!result[item['номенклатура/id']]) result[item['номенклатура/id']] = [];
        result[item['номенклатура/id']].push(item);
        return result;
      }, {});
      return DataByNomenId[oid];
    },
    "Clear": function(param){
      var oid = (param['объект'] && param['объект'].id) || 0;
      if (Data[oid])  Data[oid].splice(0, Data[oid].length);
      if (then[oid]) delete then[oid];
      if (DataByNomenId[oid]) delete DataByNomenId[oid];
    },
  };
  return $this;//.RefreshObjects();
  
};

/*=============================================================*/

module

.factory('$ТМЦТекущиеОстатки', Data)

.component('tmcOstatTable', {
  controllerAs: '$c',
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