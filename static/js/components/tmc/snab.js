(function () {'use strict';
/*
  Модуль снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ снабжение";
try {angular.module(moduleName); return;} catch(e) { }
try {angular.module('ТМЦ снабжение форма');} catch(e) {  angular.module('ТМЦ снабжение форма', []);}// тупая заглушка
try {angular.module('ТМЦ снабжение список');} catch(e) {  angular.module('ТМЦ снабжение список', []);}// тупая заглушка
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'Util', 'appRoutes', 'ObjectMy', 'ТМЦ снабжение форма', 'ТМЦ снабжение список']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, TemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    TemplateCache.split(appRoutes.url_for('assets', 'tmc/snab.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
      //~ $scope.param.table['объект'] = obj;
      //~ $ctrl.LoadData();
    });
    
  };
};
/******************************************************/
var Data  = function($http, appRoutes, Util){
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  return {
    InitAskForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      if(!data) data = {};
      //~ data.contragent={id:data['контрагент/id']};
      if(!data['грузоотправители/id']) data['грузоотправители/id']=[undefined];
      data.contragent4Param = [];
      data.contragent4 = data['грузоотправители/id'].map(function(id, idx){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
        data.contragent4Param.push({});
        return {"id": id};
      });
      data.contact4Param = [];
      if(!data['контакты грузоотправителей']) data['контакты грузоотправителей'] = [[]];
      data.contact4 = data['контакты грузоотправителей'].map(function(item, idx){
        data.contact4Param.push({"контрагент": data.contragent4[idx], "контакт":"грузоотправитель"});//контакт4
        return {"title":  item[0], "phone": item[1]};
      });
      
      data.address1 =  JSON.parse(data['откуда'] || '[[""]]').map(function(arr){ return arr.map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, }; }); });
      //~ data.addressParam = {"контрагенты": data.contragent4, "sql":{"only": 'откуда'}, "без объектов":true, placeholder:'адрес'};
      data.addressParam = [];
      data.address1.map(function(item, idx){
        data.addressParam.push({"контрагенты": [data.contragent4[idx]], "sql":{"column": 'откуда'},/* "без объектов":true, */ placeholder:'адрес'});
        
      });
      
      //
      //~ if(data['с объекта/json']) {
      /*if(!data['с объекта'])*/  data['с объекта'] = JSON.parse(data['с объекта/json'] || '{}');//.map(function(js){ return JSON.parse(js || '[]'); });
       /*if(!data['на объект'])*/ data['на объект'] =  JSON.parse(data['на объект/json'] || '{}');
      //~ } else {
        //~ data['база1'] =  {};
      //~ }
      
      
      //~ if((data['позиции'] && angular.isString(data['позиции'][0])) || (data['позиции тмц'] && angular.isString(data['позиции тмц'][0])))
        //~ data['позиции тмц'] = data['позиции'] = ((!!data['позиции'] && angular.isString(data['позиции'][0]) && data['позиции']) || (!!data['позиции тмц'] && angular.isString(data['позиции тмц'][0]) && data['позиции тмц'])).map(function(row){ return JSON.parse(row); });
      if(!data["$позиции тмц"]) data["$позиции тмц"] = [];
      //~ if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      return data;
    },
   
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory('TMCSnabData', Data)
.factory('TMCSnab', Data)

.controller('Controll', Controll)

;

}());