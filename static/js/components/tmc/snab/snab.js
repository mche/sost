(function () {'use strict';
/*
  Модуль снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ снабжение";
try {angular.module(moduleName); return;} catch(e) { }
try {angular.module('ТМЦ снабжение форма');} catch(e) {  angular.module('ТМЦ снабжение форма', []);}// тупая заглушка
try {angular.module('ТМЦ снабжение списки');} catch(e) {  angular.module('ТМЦ снабжение списки', []);}// тупая заглушка
var module = angular.module(moduleName, ['Util', 'appRoutes', 'ObjectMy', 'ТМЦ снабжение форма', 'ТМЦ снабжение списки']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, TemplateCache, appRoutes) {///$http, 
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
var Data  = function(){///$http, appRoutes, Util
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  return {
    InitForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      if(!data) data = {};
      //~ data.contragent={id:data['контрагент/id']};
      if(!data['@грузоотправители/id']) data['@грузоотправители/id']=[undefined];
      data.contragent4Param = [];
      data.contragent4 = data['@грузоотправители/id'].map(function(id, idx){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
        data.contragent4Param.push({});
        return {"id": id};
      });
      data.contact4Param = [];
      if(!data['контакты грузоотправителей']) data['контакты грузоотправителей'] = [[]];
      data.contact4 = data['контакты грузоотправителей'].map(function(item, idx){
        data.contact4Param.push({"контрагент": data.contragent4[idx], "контакт":"грузоотправитель"});//контакт4
        return {"title":  item[0], "phone": item[1]};
      });
      
      //~ console.log("InitAskForm", data['откуда']);
      if (!data['откуда']) data['откуда'] = '[[""]]';
      data['откуда'] = angular.isString(data['откуда']) ? JSON.parse(data['откуда']) : data['откуда'];
      if (data['откуда'].length === 0) data['откуда'].push([]);
      data.address1 =  data['откуда'].map(function(arr){ return arr.map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, }; }); });
      
      
      if(!data['$на объект']) data['$на объект'] = {};
      /*if(data['$с объекта'] && data['$с объекта'].id)*/ 
      data['перемещение'] = !!(data['$с объекта'] && data['$с объекта'].id);
      if (data['$с объекта']) data.address1 = [[data['$с объекта']]];
      
      //~ data.addressParam = {"контрагенты": data.contragent4, "sql":{"only": 'откуда'}, "без объектов":true, placeholder:'адрес'};
      data.addressParam = [];
      data.address1.map(function(item, idx){
        data.addressParam.push({"контрагенты": [data.contragent4[idx]], "sql":{"column": 'откуда'},/* "без объектов":true, */ placeholder: data['$с объекта'] ? 'объект' : 'адрес'});
        
      });
      
      
      //~ if((data['позиции'] && angular.isString(data['позиции'][0])) || (data['позиции тмц'] && angular.isString(data['позиции тмц'][0])))
        //~ data['позиции тмц'] = data['позиции'] = ((!!data['позиции'] && angular.isString(data['позиции'][0]) && data['позиции']) || (!!data['позиции тмц'] && angular.isString(data['позиции тмц'][0]) && data['позиции тмц'])).map(function(row){ return JSON.parse(row); });
      if(!data["@позиции тмц"]) data["@позиции тмц"] = [];
      //~ if(!data["$позиции заявок"]) data["$позиции заявок"] = [];
      //~ if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      data["без транспорта"] = !!data['без транспорта'] || data['без транспорта'] === null || data['без транспорта'] === undefined ? true : false;
      //~ console.log("InitAskForm", data);
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