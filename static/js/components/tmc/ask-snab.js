(function () {'use strict';
/*
  Модуль снабжения ТМЦ для снабженца
*/

var moduleName = "TMCAskSnab";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'Util', 'appRoutes', 'ObjectMy', 'TMCAskSnabForm', 'TMCAskSnabTable']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, loadTemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    loadTemplateCache.split(appRoutes.url_for('assets', 'tmc/ask-snab.html'), 1)
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
      data.contragent4 = data['грузоотправители/id'].map(function(id){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
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
      data.addressParam = {"контрагенты": data.contragent4, "sql":{"only": 'откуда'}, "без объектов":true, placeholder:'адрес'};
      
      if(!data["позиции"]) data["позиции"] = [{}];
      //~ if(!data["дата отгрузки"]) data["дата отгрузки"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      return data;
    },
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory(moduleName+'Data', Data)

.controller('Controll', Controll)

;

}());