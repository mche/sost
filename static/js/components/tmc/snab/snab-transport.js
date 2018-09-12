(function () {'use strict';
/*
  
*/

var moduleName = "ТМЦ обработка снабжением";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Объект или адрес', 'ТМЦ таблица позиций']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, /*$q,*/ $timeout, $element, /*$http, appRoutes,*/ Util, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param = {};
    //~ if(!$ctrl.param['фильтр тмц']) $ctrl.param['фильтр тмц'] = function(){ return !0;};
    
    ObjectAddrData.Objects().then(function(resp){
        $ctrl.objects  = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        $ctrl.ready = true;
        $timeout(function(){ 
        
          $('.show-on-ready', $element[0]).slideDown();
          
          $ctrl.mutationObserver = new MutationObserver($ctrl.MutationObserverCallback)
          var target = $('table.tmc-snab tbody', $element[0]).get(0);
          $ctrl.mutationObserver.observe(target, { childList: true });
        });
      });
  };
  
  $ctrl.MutationObserverCallback  = function (mutationsList) {
    var status,
    id = mutationsList.map(function(m){
      var tr  = m.removedNodes && m.removedNodes[0];
      if (!tr) return;
      if (tr.id) status = tr.getAttribute('status');
      return  tr.id/* && m.removedNodes[0]*/;
    }).filter(function(id){ return !!id; }).pop();
    if (id) $rootScope.$broadcast('ТМЦ/сменился статус', id, status);///console.log("mutationObserver", id);//$(tr).find('tmc-snab-table-tmc')
  };
  
  $ctrl.$onDestroy = function(){
    if($ctrl.mutationObserver) $ctrl.mutationObserver.disconnect();
  };
  
  $ctrl.FilterData = function(ask){
    var filter = $ctrl.param['фильтр'];
    //~ var tab = $ctrl.tab;
    //~ if(!tab) return !1;
    //~ var filter = tab.filter;
    if(!filter) return !ask._hide;
    return filter(ask);
    
  };
  
  $ctrl.OrderByData = function(item){
    return item['дата1'];
    
    
  };
  
  $ctrl.InitAsk = function(ask){// обработанные снабжением
    //~ if(ask._init) return;
    //~ if(ask['@позиции тмц']) ask['@позиции тмц'].map(function(row){ /*var r = angular.isString(row) ? JSON.parse(row) : row; /*r['$дата/принято'] = JSON.parse(r['$дата/принято'] || '{}');*/ if($ctrl.param['ТМЦ/крыжик позиций/событие'] && !row.hasOwnProperty('крыжик количества')) {row['крыжик количества'] = !!row['количество/принято'];} return row; }); не тут, в компоненте tmc/snab/table/tmc
    //~ if(ask['@дата1']) ask['@дата1'] = JSON.parse(ask['@дата1']);
    //~ ask['грузоотправители'] = ask['грузоотправители/json'].map(function(it){ return JSON.parse(it); });
    ask.driver = {"id": ask['водитель-профиль/id'], "title": (ask['водитель-профиль'] && ask['водитель-профиль'].join(' ')) || ask['водитель'] && ask['водитель'][0], "phone": ask['водитель-профиль/телефон'] || ask['водитель'] && ask['водитель'][1],  "doc": ask['водитель-профиль/док'] || ask['водитель'] && ask['водитель'][2]};
    //~ ask.addr1= JSON.parse(ask['откуда'] || '[[]]');
    //~ ask.addr2= JSON.parse(ask['куда'] || '[[]]');
   
    //~ ask['с объекта'] = JSON.parse(ask['с объекта/json'] || '{}');//.map(function(js){ return JSON.parse(js || '[]'); });
    //~ ask['на объект'] =  JSON.parse(ask['на объект/json'] || '{}');
    //~ console.log("InitSnabAsk", ask);
    if (ask['с объекта/id']) ask['$с объекта'] = $ctrl.objects[ask['с объекта/id']];
    if (ask['на объект/id']) ask['$на объект'] = $ctrl.objects[ask['на объект/id']];
    //~ ask._init = true;
    //~ console.log("InitAsk", ask);
    return ask;
  };
  $ctrl.ObjectOrAddress =  function(adr, ask){// adr - строка адреса откуда, ask - заявка
    var id = (/^#(\d+)$/.exec(adr) || [])[1];
    if (!id) return {name: adr};
    var ob = ask['$с объекта'] || $ctrl.objects[id];//.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $ctrl.EditAsk = function(ask){
    if(!ask) return !!$attrs.onEditAsk;
    if($attrs.onEditAsk) return $ctrl.onEditAsk({ask: ask});
  };
  
  $ctrl.NewMove = function(ask){
    ask['фильтр тмц'] = $ctrl.param['фильтр тмц']
    $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    ask['статус'] = undefined;
    
  };
  
  $ctrl.FilterRowAccepted = function(row){///подсчет крыжиков принято позиций
    return !!row['количество/принято'];
    
  }
  
  /*$ctrl.SaveAsk = function(ask){
    if($ctrl.param['ТМЦ заявки транспорт/событие сохранения']) $rootScope.$broadcast($ctrl.param['ТМЦ заявки транспорт/событие сохранения'], ask);
    
  };*/
  
};

/*=============================================================*/

module

.component('tmcSnabTransport', {
  templateUrl: "tmc/snab/transport",
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