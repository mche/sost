(function () {'use strict';
/*
  Таблица закупок и перемещений
*/

var moduleName = "ТМЦ обработка снабжением";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Объект или адрес', 'ContragentItem', 'ТМЦ таблица позиций', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, $q, $timeout, $element, /*$http, appRoutes,*/ Util, ObjectAddrData, $Номенклатура) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  
  $c.Ready = function(){
    $c.ready = true;
    
    $timeout(function(){
      
      //~ $('.modal', $($element[0])).modal({
        //~ endingTop: '0%',
        //~ ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          //~ $c.modal_trigger = trigger;
        //~ },
      //~ });
    });
    
  };
  
  $c.$onInit = function(){
    
    if(!$c.param) $c.param = {};
    if (!$c.param.where) $c.param.where={};
    //~ if(!$c.param['фильтр тмц']) $c.param['фильтр тмц'] = function(){ return !0;};
    
    
    var async = [];
    async.push($c.LoadData());
    async.push(ObjectAddrData.Objects().then(function(resp){
        $c.objects  = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
      }));
    
    $q.all(async).then(function(){
      $c.Ready();
      $timeout(function(){ 
      
        //~ $('.show-on-ready', $element[0]).slideDown(
        $timeout(function(){ 
          var target = $('table.tmc-snab tbody', $element[0]).get(0);
          if (!target) return;
          //~ $c.mutationObserver = new MutationObserver($c.MutationObserverCallback);
          //~ $c.mutationObserver.observe(target, { childList: true });
        }, 1000);
        
        $('.modal', $($element[0])).modal();///{"dismissible0000": false,}
      });
      
      $Номенклатура.Load().then(function(data){
        $c.$номенклатура = /*data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {})*/ $Номенклатура.$Data();
        $c['номенклатура'] = $Номенклатура.Data();
      });
      
    });
    
  };
  
  $c.LoadData = function(param){
    const Loader = $c.data.Load || $c.$data && $c.$data.Load;
    if (!Loader) return console.log("Нет $c.data.Load || $c.$data && $c.$data.Load");
    const Where = $c.data.Where || $c.$data && $c.$data.Where;///сохраненые фильтры

    var p = {
      'объект': {"id": $c.param['объект'].id},
      "where": angular.copy(param && param.where) || {},
    };
    if ($c.$data) $c.$data.Clear();
    $c.refreshTable = !0;
    //~ if (Util.IsType($c.data, 'array')) $c.data.splice(0, $c.data.length);
    return Loader(p)
      .then(function(){
        $c.refreshTable = undefined;
        if (!$c.$data) $c.$data = $c.data;///это Util.$Список
        $c.data = $c.$data.Data();///не копия массива
        $c.param.where = $c.$data.Where();// фильтры
        //~ console.log("Loader where", $c.param.where);
      });
    
  };
  
  $c.LoadDataAppend = function(param){
    var p = {
      'объект': {"id": $c.param['объект'].id},
      "where": angular.copy(param && param.where) || {},
      "offset": $c.data.length,
      "append": !0,
    };
    $c.cancelerHttp = !0;
    return $c.$data.Load(p)
      .then(function(){
        $c.cancelerHttp = undefined;
        $c.InitTable();
      });
  };
  
  /***$c.MutationObserverCallback  = function (mutationsList) {
    var status,
    id = mutationsList.map(function(m){
      var tr  = m.removedNodes && m.removedNodes[0];
      if (!tr) return;
      if (tr.id) status = tr.getAttribute('status');
      return  tr.id;///&& m.removedNodes[0]
    }).filter(function(id){ return !!id; }).pop();
    if (id) $rootScope.$broadcast('ТМЦ/сменился статус', id, status);///console.log("mutationObserver", id);//$(tr).find('tmc-snab-table-tmc')
  };***/
  
  $c.$onDestroy = function(){
    if($c.mutationObserver) $c.mutationObserver.disconnect();
  };
  
  $c.InitTable = function(){
    $c.dataFiltered = $c.data.filter($c.FilterData);
    
  };
  
  $c.RefreshTable = function(){
    $c.refreshTable = !0;
    $timeout(function(){
      $c.refreshTable = undefined;
    });
    
  };
  
  $c.FilterData = function(ask){
    var filter = $c.param['фильтр'];
    //~ var tab = $c.tab;
    //~ if(!tab) return !1;
    //~ var filter = tab.filter;
    if(!filter) return !ask._hide;
    return filter(ask);
    
  };
  
  $c.OrderByData = function(item){
    return item['дата1'];
    
    
  };
  
  $c.InitAsk = function(ask){// обработанные снабжением
    ask.driver = {"id": ask['водитель-профиль/id'], "title": (ask['водитель-профиль'] && ask['водитель-профиль'].join(' ')) || ask['водитель'] && ask['водитель'][0], "phone": ask['водитель-профиль/телефон'] || ask['водитель'] && ask['водитель'][1],  "doc": ask['водитель-профиль/док'] || ask['водитель'] && ask['водитель'][2]};
    if (ask['с объекта/id']) ask['$с объекта'] = $c.objects[ask['с объекта/id']];
    if (ask['на объект/id']) ask['$на объект'] = $c.objects[ask['на объект/id']];
    //~ ask._init = true;
    //~ console.log("InitAsk", ask);
    return ask;
  };
  $c.ObjectOrAddress =  function(adr, ask){// adr - строка адреса откуда, ask - заявка
    var id = (/^#(\d+)$/.exec(adr) || [])[1];
    if (!id) return {name: adr};
    var ob = ask['$с объекта'] || $c.objects[id];//.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $c.EditAsk = function(ask){
    if(!ask) return !!$attrs.onEditAsk;
    if($attrs.onEditAsk) return $c.onEditAsk({ask: ask});
  };
  
  $c.NewMove = function(ask){
    //~ ask['фильтр тмц'] = $c.param['фильтр тмц'];
    //~ 
    //~ ask['статус'] = undefined;
    //~ console.log('переместить', ask['$на объект']);
    //~ $c['переместить'] = undefined;
    //~ $scope.moveParam = undefined;
    
    $timeout(function(){
      $scope.moveParam= {'объект': angular.copy(ask['$на объект'] || $c.param['объект']), 'перемещение': !0, 'modal000': !0,};
      
      var move = {
        '$на объект': angular.copy(ask['$на объект'] || $c.param['объект']),
        '@позиции тмц': ask['@позиции тмц'].map(function(row){
          //~ var n = row['номенклатура'].parents_title.slice();
          //~ n.push(row['номенклатура'].title);
          //~ console.log("@позиции тмц", row);
          return {'$объект': row['$объект'], 'номенклатура/id': row['номенклатура/id'], 'номенклатура': {}, 'количество': row['количество'], /*'количество/принято': row['остаток'],*/ '$тмц/заявка':row['$тмц/заявка'] || {},};
        }),
        'дата1': Date.now(),
        'перемещение': !0,
        'коммент': ask['коммент'] || '',///+' закуплено через склад '+$scope.moveParam['объект'].name,
        //~ '$тмц/заявка':{},
      };
      //~ console.log('переместить', move);

      $timeout(function(){
        $c['переместить'] = move;
        //~ $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', move);
      });
      
    });
    
  };
  
  $c.CloseModalMove = function(data){
    if (data._successSave) $rootScope.$broadcast('ТМЦ/сохранено в новое перемещение', data);///console.log('CloseModalMove', data);
    
    $timeout(function(){
      //~ $scope.moveParam=undefined;
      $c['переместить'] = undefined;
    }, 300);///для анимации
    //~ $('#modal-move').modal('close');
  };
  
  $c.FilterRowAccepted = function(row){///подсчет крыжиков принято позиций
    return !!row['количество/принято'];
    
  };
  
  ///фильтры
  $c.OpenModalFilter = function(modalID, name, val){
    if (!$c.param.where) $c.param.where = {};///костыль
    $c.param.where[name] = undefined;
    $timeout(function(){
      $c.param.where[name] = val;
      $(modalID).modal('open');
    });
    
  };
  
  $c.CancelWhere = function(name){
    //~ if(!$c.param.where || !$c.param.where[name] || !$c.param.where[name].ready) return;
    $c.param.where[name].ready = 0;
    $c.ready = false;
    $c.LoadData($c.param).then(function(){ $c.Ready(); });
  };
  
  $c.SendWhere = function(name){
    if (!$c.param.where) $c.param.where = {};///костыль
    $c.param.where[name].ready = 1;
    $c.ready = false;
    $c.LoadData($c.param).then(function(){ $c.Ready(); });
    
  };
  
  $c.PosNomenClick = function(nid){/// проброс клика tmc-snab-table-tmc
    //~ console.log("PosOnNomenClick", arguments);
    
    $c.OpenModalFilter('#modal-nomen', 'тмц/номенклатура', {id: nid});
  };
  
  /*$c.SaveAsk = function(ask){
    if($c.param['ТМЦ заявки транспорт/событие сохранения']) $rootScope.$broadcast($c.param['ТМЦ заявки транспорт/событие сохранения'], ask);
    
  };*/
  
};

/*=============================================================*/

module

.component('tmcSnabTable', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/table",
  //~ scope: {},
  bindings: {
    data: '<', //массив заявок
    param: '<',
    onEditAsk: '&',

  },
  controller: Component
})

;

}());