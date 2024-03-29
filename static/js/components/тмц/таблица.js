(function () {'use strict';
/*
  Таблица закупок и перемещений
*/

var moduleName = "ТМЦ таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Объект или адрес', 'ContragentItem', 'ТМЦ таблица позиций', 'Номенклатура', 'TMCTableLib', 'DateBetween',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, $q, $timeout, $element, /*$http, appRoutes,*/ Util, ObjectAddrData, $Номенклатура, $TMCTableLib) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  
  new $TMCTableLib($c, $scope, $element);///методы для списка
  
  $c.Ready = function(){
    $c['обратно сортировать'] = true;
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
        $c['$объекты']  = ObjectAddrData.$Data();//resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
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
  
  $c.OrderByData = function(item){///overide
    if (item._new) return '';
    return 1;
    
    
  };
  
  $c.InitItem = function(item){// обработанные снабжением
    item.driver = {"id": item['водитель-профиль/id'], "title": (item['водитель-профиль'] && item['водитель-профиль'].join(' ')) || item['водитель'] && item['водитель'][0], "phone": item['водитель-профиль/телефон'] || item['водитель'] && item['водитель'][1],  "doc": item['водитель-профиль/док'] || item['водитель'] && item['водитель'][2]};
    if (item['с объекта/id']) item['$с объекта'] = $c['$объекты'][item['с объекта/id']];
    if (item['на объект/id']) item['$на объект'] = $c['$объекты'][item['на объект/id']];
    //~ item._init = true;
    //~ console.log("InitAsk", item);
    return item;
  };
  $c.ObjectOrAddress =  function(adr, item){// adr - строка адреса откуда, item - заявка
    var id = (/^#(\d+)$/.exec(adr) || [])[1];
    if (!id) return {name: adr};
    var ob = item['$с объекта'] || $c['$объекты'][id];//.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    //~ 
    return {"id": ob.id, "name": ob.name};//ob;
  };
  
  $c.EditItem = function(item){
    if(!item) return !!$attrs.onEditAsk;
    if($attrs.onEditAsk) return $c.onEditAsk({"ask": item, "param": $c.param});
  };
  
  //~ const FilterNotMoved = function(row){ return !row['тмц/перемещение/id'];/***уже перемещено*/ };
  $c.NewMoveCount = function(item){
    return item['@позиции тмц'].filter($c.param['фильтр в перемещение']).length;
  };
  $c.NewMove = function(item){
    //~ $timeout(function(){
    //~ if (check) return item['@позиции тмц'].some(FilterNotMoved);
      $scope.moveParam= {'объект': angular.copy(item['$на объект'] || $c.param['объект']), 'перемещение': !0, 'modal000': !0,};
      
      var move = {
        '$на объект': angular.copy(item['$на объект'] || $c.param['объект']),
        '@позиции тмц': item['@позиции тмц'].filter($c.param['фильтр в перемещение']).map(function(row){
          //~ var n = row['номенклатура'].parents_title.slice();
          //~ n.push(row['номенклатура'].title);
          //~ console.log("@позиции тмц", row);
          return {'$объект': row['$объект'], 'номенклатура/id': row['номенклатура/id'], 'номенклатура': {}, 'количество': row['количество'], /*'количество/принято': row['остаток'],*/ '$тмц/заявка':row['$тмц/заявка'] || {}, 'тмц/закупка/id': row.id};
        }),
        'дата1': Date.now(),
        'перемещение': !0,
        'коммент': item['коммент'] || '',///+' закуплено через склад '+$scope.moveParam['объект'].name,
        'закупка/id': item.id, /// это через склад
        //~ '$тмц/заявка':{},
      };
      //~ console.log('переместить', move, item);

      $timeout(function(){
        $c['переместить'] = move;
        //~ $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', move);
      });
      
    //~ });
    
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
  
  $c.NomenAutocompleteAppendSuggestions = function(suggestions, $that) {/// в tree-item
    $that.lastTop = '';
    suggestions.map($that.ac.options.MapSuggestionsArrayTop, $that);
  };
  
  /*$c.SaveAsk = function(ask){
    if($c.param['ТМЦ заявки транспорт/событие сохранения']) $rootScope.$broadcast($c.param['ТМЦ заявки транспорт/событие сохранения'], ask);
    
  };*/
  //~ console.log("SnabTable", $c);
};

/*=============================================================*/

module

.component('tmcSnabTable', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/table",
  //~ scope: {},
  bindings: {
    data: '<', //массив заявок
    //~ item: '<',
    param: '<',
    onEditAsk: '&',

  },
  controller: Component
})

;

}());