(function () {'use strict';
/*
  Модуль заявок на транспорт
*/

var moduleName = "TransportAsk";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'Util', 'TransportAskForm', 'TransportAskTable']);//

var Controll = function  ($scope, $timeout, $http, loadTemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    loadTemplateCache.split( appRoutes.url_for('assets', 'transport/ask.html'), 1 )
      .then(function(proms) { ctrl.ready= true; } );// массив
  };
  
  /*
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
      //~ $scope.param.table['объект'] = obj;
      //~ $ctrl.LoadData();
    });
    
  };*/
};
/******************************************************/
var Data  = function($http, appRoutes, Util){
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  //~ var driverData = $http.get(appRoutes.url_for('водители'));
  return {
    InitAskForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      //~ console.log("InitAskForm", data);
      if(!data) data = {};
      data.contragent2 = {id: data['заказчик/id']};//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
      data.contragent2Param = {};
      data.contragent1 = {id: data['перевозчик/id'] || undefined};
      data.contragent1Param = {};
      //~ data.project = {id: data['проект/id']};
      //~ data.project={id: 20962};
      //~ data.address2 = {id: data['объект/id'], title: data['объект'] || data['куда']};
      if(!data['куда']) data['куда'] = [];
      if(!data['откуда']) data['откуда'] = [];
      data.address2 =  data['куда'].map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, _idx: idx}; });
      data.address1 =  data['откуда'].map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, _idx: idx}; });
      data.addressParam = {"заказчик": data.contragent2};//"проект": data.project, 
      data.category = {topParent: {id: 36668}, selectedItem: {id: data['категория/id']}};//34708
      data.transport = {id: data['транспорт/id'], title: data['транспорт']};
      data.transportParam = {"заказчик": data.contragent2, "перевозчик": data.contragent1, "категория": data.category};
      data.driver = {id: data['водитель-профиль/id'], title: data['водитель'] &&  data['водитель'].join(' ')};
      data.driverParam = {"перевозчик": data.contragent1};
      //~ data.driverData = driverData;
      //~ data.driver = {"транспорт":data.transport}
      data['без груза'] = !!data.id && !data['груз'];
      //~ if(!data["позиции"]) data["позиции"] = [{}];
      if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      return data;
    },
    category: function(){
      return $http.get(appRoutes.url_for('категории/список', 36668));//34708
      
    },
    payType: function(){
      return [
        {title:'вся сумма', val:0},
        {title:'час', val:1},
        {title:'км', val:2},
      ];
      
    },
    "свободный транспорт": function(){
      return $http.get(appRoutes.url_for('свободный транспорт'));
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