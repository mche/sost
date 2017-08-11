(function () {'use strict';
/*
*/

var moduleName = "TMCAskSnabTable";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'Util', 'appRoutes', 'DateBetween']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, Util, TMCAskSnabData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $ctrl.tabs = [
    {"title":'Требуется', "icon":'input', "value":false,},
    {"title":'Обработано', "icon":'done', "value":true,}
  
  ];
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.tab = $ctrl.tabs[0];
      $ctrl.dataOK = {};// при фильтрации закидывать сюда обработанные позиции
      //~ $ctrl.dataOK_keys = [];

      $ctrl.LoadData().then(function(){
        $ctrl.ready = true;
        $ctrl.tabsReady = true;
        
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
    
    return $http.post(appRoutes.url_for('тмц/список заявок/оплата', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };
  $ctrl.FilterData = function(item){
    //~ console.log("FilterData", item);
    if(item['тмц/оплата/id']) {
      item._sort1 = new Date(item['дата отгрузки']);
      if (!$ctrl.dataOK[item['тмц/оплата/id']]) $ctrl.dataOK[item['тмц/оплата/id']] = {};
      $ctrl.dataOK[item['тмц/оплата/id']][item.id] = item;
    }
    //~ $ctrl.dataOK_keys.length = 0;
    //~ Array.prototype.push.apply($ctrl.dataOK_keys, Object.keys($ctrl.dataOK));
    
    var tab;
    if (this !== undefined) tab = this;// это подсчет
    else tab = $ctrl.tab;
    return !!item['тмц/оплата/id'] === tab.value;
    
  };
  /*ключи обработанных позиций (в шаблоне не может Object.keys)*/
  $ctrl.Keys1DataOK = function(){
    return Object.keys($ctrl.dataOK);
  };
  $ctrl.Keys2DataOK = function(ID1) {
    return Object.keys($ctrl.dataOK[ID1]);
  };
  /*сортировка обработанных позиций на уровне ИДов "тмц/оплата"*/
  $ctrl.OrderBy1DataOK = function(id){
    return $ctrl.GetFieldDataOK(id, '_sort1');
  };
  $ctrl.OrderBy2DataOK = function(id1, id2){
    return $ctrl.GetFieldDataOK(id, '_sort1');
  };
  /*получить поле из шапки обработанной  позиции*/
  $ctrl.GetFieldDataOK = function(id, name){
    var pos = $ctrl.dataOK[id];
    var k = Object.keys(pos);
    return pos[k[0]][name];
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
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    if(!$ctrl.param.edit) {
      $ctrl.param.edit = TMCAskSnabData.InitAskForm();//{"позиции": []};
      $ctrl.param.edit["позиции"].length=0;
    }
    
    //~ if(it['обработка']) 
    var idx = $ctrl.param.edit['позиции'].indexOf(it);
    //~ console.log("Checked", idx, it);
    if(idx >= 0) $ctrl.param.edit['позиции'].splice(idx, 1);
    else $ctrl.param.edit['позиции'].push(it);
    //~ if(!$ctrl.param.edit["дата отгрузки"]) $ctrl.param.edit["дата отгрузки"]=Util.dateISO(1);
    
  };
  
};


/*=============================================================*/

module

.component('tmcAskSnabTable', {
  templateUrl: "tmc/ask/snab/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());