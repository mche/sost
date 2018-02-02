(function () {'use strict';
/*
*/

var moduleName = "TMCAskSnabTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', 'Объект или адрес']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, TMCAskSnabData, ObjectAddrData, $filter, $sce) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Требуется', "length":function(){
        //~ return !item["транспорт/заявки/id"];
        return $ctrl.data.length;
      },
      "li_class": 'teal lighten-2',
    },
    {"title":'В работе', "length":function(){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl['заявки снаб'].length;
      },
      "li_class": 'teal lighten-2',
    },
    
    {"title":'Через базу', "length":function(tab){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl['заявки снаб'].filter(tab.filter).length;
      },
      "filter": function(ask){
        return !!ask['базы'] && !!ask['базы'][0];
      },
      "li_class": 'blue lighten-2',
    },
  
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
        
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
          $ctrl.tabsReady = true;
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
          //~ console.log("данные два списка: ", resp.data);
          Array.prototype.push.apply($ctrl.data, resp.data.shift());// первый список - позиции тмц(необработанные и обработанные)
          $ctrl['заявки снаб'] = resp.data.shift().map(function(ask){ return $ctrl.InitSnabAsk(ask); }) || []; // второй список - обработанные заявки
        }
        
      });
    
  };
  
  $ctrl.FilterSnab = function(ask){
    var filter = $ctrl.tab.filter;
    if(!filter) return true;
    return filter(ask);
    
  };
  
  $ctrl.InitRow = function(it){//необработанные позиции тмц
    if(it['$дата1'] && angular.isString(it['$дата1'])) it['$дата1'] = JSON.parse(it['$дата1']);
    
  };
  
  /**** постановка/снятие позиции в обработку ****/
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    $rootScope.$broadcast('Добавить/убрать позицию ТМЦ в заявку снабжения', it);
    /*
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
    */
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
  
  $ctrl.InitSnabAsk = function(ask){// обработанные снабжением
    if(ask._init) return;
    if(ask['позиции'] || ask['позиции тмц']) ask['позиции тмц'] = ask['позиции'] = (ask['позиции'] || ask['позиции тмц']).map(function(row){ return JSON.parse(row); });
    if(ask['@дата1']) ask['@дата1'] = JSON.parse(ask['@дата1']);
    ask['грузоотправители'] = ask['грузоотправители/json'].map(function(it){ return JSON.parse(it); });
    ask.driver = {"id": ask['водитель-профиль/id'], "title": (ask['водитель-профиль'] && ask['водитель-профиль'].join(' ')) || ask['водитель'] && ask['водитель'][0], "phone": ask['водитель-профиль/телефон'] || ask['водитель'] && ask['водитель'][1],  "doc": ask['водитель-профиль/док'] || ask['водитель'] && ask['водитель'][2]};
    ask.addr1= JSON.parse(ask['откуда'] || '[[]]');
    ask.addr2= JSON.parse(ask['куда'] || '[[]]');
    if(ask['базы/json']) ask['базы'] = ask['базы/json'].map(function(js){ return JSON.parse(js || '[]'); });
    //~ console.log("InitSnabAsk", ask);
    ask._init = true;
    return ask;
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
    var edit = angular.copy(ask);
    //~ if(!edit['позиции тмц'].length) edit['позиции тмц'].push({});
    
    /*$ctrl.param.edit = undefined;
    $timeout(function(){
      $ctrl.param.edit = edit;
      
    });*/
    $rootScope.$broadcast('Редактировать заявку ТМЦ снабжения', edit);
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