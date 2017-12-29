(function () {'use strict';
/*
*/

var moduleName = "TMCAskSnabTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', 'Объект или адрес']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, Util, TMCAskSnabData, ObjectAddrData, $filter, $sce) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Требуется', "icon_svg": '!sign-round-fill', "length":function(){
        //~ return !item["транспорт/заявки/id"];
        return $ctrl.data.length;
      },
    },
    {"title":'Обработано', "icon_svg":'checked1', "length":function(){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl['заявки снаб'].length;
      },
    }
  
  ];
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.tab = $ctrl.tabs[0];
      //~ $ctrl.dataOK = {};// при фильтрации закидывать сюда обработанные позиции
      //~ $ctrl.dataOK_keys = [];
      
      var async = [];
      async.push(ObjectAddrData.Objects().then(function(resp){
        $ctrl.dataObjects  = resp.data;
        
      }));

      async.push($ctrl.LoadData());//.then()
      
      $q.all(async).then(function(){
        $ctrl.ready = true;
        if(!$ctrl.data.length) $ctrl.tab = $ctrl.tabs[1];
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
      
      //~ $scope.$on('ТМЦ/снаб сохранена заявка', function(event, ask) {
        //~ console.log('ТМЦ/снаб сохранена заявка', ask);
      //~ });
      /*$scope.$watch(// тоже как и форма следит за редактированием/ждем сохранения
        //~ function(scope) { return $ctrl.param.edit; },
        'param',
        function(newValue, oldValue) {
          console.log("table watch edit newValue", newValue);
          if (newValue && newValue._success_save) {
            console.log("table watch edit newValue", newValue);
          }
        }
      );*/
      
    });
    
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
        else {
          console.log("данные два списка: ", resp.data);
          Array.prototype.push.apply($ctrl.data, resp.data.shift());// первый список - позиции тмц(необработанные и обработанные)
          $ctrl['заявки снаб'] = resp.data.shift() || []; // второй список - обработанные заявки
        }
        
      });
    
  };
  
  /**** постановка/снятие позиции в обработку ****/
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    if(!$ctrl.param.edit) {
      $ctrl.param.edit = TMCAskSnabData.InitAskForm();//{"позиции": []};
      $ctrl.param.edit["позиции"].length=0;
    }
    $ctrl.param.edit._success_save  = false;
    //~ if(it['обработка']) 
    var idx = $ctrl.param.edit['позиции'].indexOf(it);
    //~ console.log("Checked", idx, it);
    if(idx >= 0) $ctrl.param.edit['позиции'].splice(idx, 1);
    else $ctrl.param.edit['позиции'].push(it);
    //~ if(!$ctrl.param.edit["дата отгрузки"]) $ctrl.param.edit["дата отгрузки"]=Util.dateISO(1);
    
  };
  /*$ctrl.DataOK = function(){//// подготовка обработанных данных для отдельного шаблона
    $ctrl.data.forEach(function(item){
      var id1 = item['тмц/снаб/id'];
      if(id1) {
        //~ item._sort1 = new Date(item['дата отгрузки']);
        if (!$ctrl.dataOK[id1]) $ctrl.dataOK[id1] = {};
        var id2 = [id1, item.id].join(':');
        if(!$ctrl.dataOK[id1][id2]) $ctrl.dataOK[id1][id2] = item;
      }
    });
  };*/
  
  /*$ctrl.SumMoney = function(ID1){
    var s = 0;
    var data = $ctrl.dataOK[ID1];
    Object.keys(data).forEach(function(id2){
      //~ console.log("SumMoney", data1[id2]);
      var k = parseFloat(Util.numeric(data[id2]['количество']));
      var c = parseFloat(Util.numeric(data[id2]['цена']));
      s += Math.round(k*c*100)/100;
    });
    return Math.round(s*100)/100;
    
  };*/
  /*
  $ctrl.FilterData = function(item){
    var tab;
    if (this !== undefined) tab = this;// это подсчет
    else tab = $ctrl.tab;
    return tab.filter(item, tab);
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    return it["дата1"]+'-'+it.id;//["объект/id"];
  };
  //ключи обработанных позиций (в шаблоне не может Object.keys)//
  $ctrl.Keys1DataOK = function(){
    return Object.keys($ctrl.dataOK);
  };
  $ctrl.Keys2DataOK = function(ID1) {
    return Object.keys($ctrl.dataOK[ID1]);
  };
  //сортировка обработанных позиций на уровне ИДов "тмц/снаб"//
  $ctrl.OrderBy1DataOK = function(id){
    return $ctrl.Data1OK(id)['дата отгрузки'];
  };
  $ctrl.OrderBy2DataOK = function(id2){// id2 - joined 
    var data = $ctrl.Data2OK(id2);
    //~ return new Date(data['дата1']);
    return data["связь/тмц/снаб"];
  };
  //получить поле из шапки обработанной  позиции//
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
  };*/
  
  $ctrl.InitSnabAsk = function(ask){
    if(ask['позиции']) ask['позиции'] = JSON.parse(ask['позиции']);
    if(ask['$дата1']) ask['$дата1'] = JSON.parse(ask['$дата1']);
    ask['грузоотправители'] = it['грузоотправители/json'].map(function(it){ return JSON.parse(it); });
    ask.addr1= JSON.parse(ask['откуда'] || '[[]]');
    ask.addr2= JSON.parse(ask['куда'] || '[[]]');
    
  };
  
  $ctrl.ObjectOrAddress = function(adr){
    var id = (/^#(\d+)$/.exec(adr) || [])[1];
    if (!id) return {name: adr};
    var ob = $ctrl.dataObjects.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $ctrl.EditSnabAsk = function(ask){
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
  
  /*$ctrl.Delete = function(){
    var it = $ctrl.param.delete;
    delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };*/
  

  
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