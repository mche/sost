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
    loadTemplateCache.split(appRoutes.url_for('assets', 'transport/ask.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
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
  return {
    InitAskForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      if(!data) data = {};
      data.contragent2={id:data['контрагент/id']};
      data.contragent1={id:data['перевозчик/id']};
      data.project={id:data['проект/id']};
      //~ data.project={id: 20962};
      data.address2= {id:data['куда/объект/id'], title:data['куда/объект'] || data['куда']};
      //~ data.address2= {id:3406};
      data.address2Param = {project:data.project, contragent: data.contragent2};
      data.category = {topParent:{id:36668}, selectedItem: {id:data['категория/id']}};//34708
      data.gruzOff = !!data.id && !data['груз'];
      //~ if(!data["позиции"]) data["позиции"] = [{}];
      if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      return data;
    },
    category: function(){
      return $http.get(appRoutes.url_for('категории/список', 36668));//34708
      
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