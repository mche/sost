(function () {'use strict';
/*
*/

var moduleName = "TMCAskSnabTable";

var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, Util, TMCAskSnabData, $filter, $sce) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Требуется', "icon_svg": '!sign-round-fill', "filter":function(item, tab){
        return !item["транспорт/заявки/id"];
      },
    },
    {"title":'Обработано', "icon_svg":'checked1', "filter":function(item, tab){
        return !!item["транспорт/заявки/id"];
      },
    }
  
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
    
    /*$scope.$watch(
      function(scope) { return $ctrl.param['новые данные']; },// после сохранения из компонента-формы
      function(newValue, oldValue) {
        if (newValue) {
          //~ console.log("watch edit newValue", newValue);
          Array.prototype.unshift.apply($ctrl.data, $ctrl.param['новые данные']);
          delete $ctrl.param['новые данные'];
          $ctrl.tab = $ctrl.tabs[1];
        }
        //~ else console.log("watch edit oldValue", oldValue);
      });*/
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/снаб/список заявок', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data.shift());
        console.log("данные", resp.data);
      });
    
  };
  $ctrl.DataOK = function(){//// подготовка обработанных данных для отдельного шаблона
    $ctrl.data.forEach(function(item){
      var id1 = item['тмц/снаб/id'];
      if(id1) {
        //~ item._sort1 = new Date(item['дата отгрузки']);
        if (!$ctrl.dataOK[id1]) $ctrl.dataOK[id1] = {};
        var id2 = [id1, item.id].join(':');
        if(!$ctrl.dataOK[id1][id2]) $ctrl.dataOK[id1][id2] = item;
      }
    });
  };
  
  $ctrl.SumMoney = function(ID1){
    var s = 0;
    var data = $ctrl.dataOK[ID1];
    Object.keys(data).forEach(function(id2){
      //~ console.log("SumMoney", data1[id2]);
      var k = parseFloat(Util.numeric(data[id2]['количество']));
      var c = parseFloat(Util.numeric(data[id2]['цена']));
      s += Math.round(k*c*100)/100;
    });
    return Math.round(s*100)/100;
    
  };
  
  $ctrl.FilterData = function(item){
    var tab;
    if (this !== undefined) tab = this;// это подсчет
    else tab = $ctrl.tab;
    return tab.filter(item, tab);
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    return it["дата1"]+'-'+it.id;//["объект/id"];
  };
  /*ключи обработанных позиций (в шаблоне не может Object.keys)*/
  $ctrl.Keys1DataOK = function(){
    return Object.keys($ctrl.dataOK);
  };
  $ctrl.Keys2DataOK = function(ID1) {
    return Object.keys($ctrl.dataOK[ID1]);
  };
  /*сортировка обработанных позиций на уровне ИДов "тмц/снаб"*/
  $ctrl.OrderBy1DataOK = function(id){
    return $ctrl.Data1OK(id)['дата отгрузки'];
  };
  $ctrl.OrderBy2DataOK = function(id2){// id2 - joined 
    var data = $ctrl.Data2OK(id2);
    //~ return new Date(data['дата1']);
    return data["связь/тмц/снаб"];
  };
  /*получить поле из шапки обработанной  позиции*/
  //~ $ctrl.GetFieldDataOK = function(id, name){
    //~ return $ctrl.Data1OK(id)[name];
  //~ };
  $ctrl.Data1OK = function(id1) {// получить первую позицию по ключу тмц/снаб
    var data = $ctrl.dataOK[id1];
    var k = Object.keys(data);
    return data[k[0]];
  };
  $ctrl.Data2OK = function(id2) {//  id2 - joined 
    var ids = id2.split(':');
    var data =  $ctrl.dataOK[ids[0]][id2];
    var k = parseFloat(data['количество']);
    var c = parseFloat(data['цена']);
    var s = Math.round(k*c*100)/100;
    if(s) data['сумма'] = Util.money(s.toLocaleString('ru-RU'));
    data['цена'] = Util.money(c.toLocaleString('ru-RU'));
    //~ data['количество'] = k.toLocaleString('ru-RU');
    //~ console.log("Data2OK", k, k.toLocaleString('ru-RU'));
    return data;
  };
  $ctrl.Edit = function(id1){
    var data = $ctrl.dataOK[id1];
    var edit = {};
    var copy = ["дата отгрузки", "дата отгрузки/формат", "контрагент", "контрагент/id",  "адрес отгрузки", "тмц/снаб/id", "тмц/снаб/коммент"];
    //~ var del2 = ["id", "ts", "uid", "дата1", "дата1 формат", "ед",  "количество", "номенклатура", "номенклатура/id", "цена", "сумма", "коммент",  "объект",  "объект/id"];
    edit['позиции'] = $filter('orderBy')(Object.keys(data), $ctrl.OrderBy2DataOK)//.sort($ctrl.OrderBy2DataOK) не так сортировало
    .map(function(id2){
      var row = angular.copy(data[id2]);
      row._data = data[id2];// после сохранения в позициях найдешь строки первоначальных данных
      if(!edit.id) edit.id = row["тмц/снаб/id"];
      if(!edit.contragent) edit.contragent={id:row['контрагент/id']};
      if(!edit['коммент']) edit['коммент'] = row["тмц/снаб/коммент"];
      copy.forEach(function(name){if(!edit[name]) edit[name] =  row[name]; delete row[name];});
      return row;
    });
    if(!edit['позиции'].length) edit['позиции'].push({});
    
    $ctrl.param.edit = undefined;
    $timeout(function(){
      $ctrl.param.edit = edit;
      
    });
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