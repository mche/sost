(function () {'use strict';
/*
  Контроль заявок и техники
  тут только заявки с транспортом
*/

var moduleName = "TransportAskWork";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'Util']);//

var Controll = function  ($scope, $timeout, $http, loadTemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    loadTemplateCache.split( appRoutes.url_for('assets', 'transport/ask-work.html'), 1 )
      .then(function(proms) { ctrl.ready= true; } );// массив
  };
  

};
/******************************************************/

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes, TransportAskWorkData, Util) {
  var $ctrl = this;
  $scope.dateFns = dateFns;
    
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.data) $ctrl.data = {};
    
    TransportAskWorkData.Load().then(function(resp){
      $ctrl.InitData(resp.data);
      $ctrl.InitDays();
      $ctrl.ready = true;
      //~ console.log("транспорт", $ctrl.data['транспорт']);
    });
    
  };
  $ctrl.InitData = function (data){// разобрать из списка
    var tr = {};
    data.map(function(item){
      if (!tr[item['транспорт/id']]) tr[item['транспорт/id']] = {"id": item['транспорт/id'], "title": item['транспорт'], "категории": item['категории'], "категория/id": item['категория/id'], "перевозчик": item['перевозчик'], "перевозчик/id": item['перевозчик/id']};
      
      if(!$ctrl.data[item['транспорт/id']]) $ctrl.data[item['транспорт/id']] = {};
      if(!$ctrl.data[item['транспорт/id']][item['дата1']])  $ctrl.data[item['транспорт/id']][item['дата1']] = [];
      $ctrl.data[item['транспорт/id']][item['дата1']].push(item);
    });
    
    $ctrl.data['транспорт'] = Object.keys(tr).map(function(key){
      return tr[key];
    }).sort(function (a, b) {
      if(!a['перевозчик/id'] && !!b['перевозчик/id']) return -1; 
      if(!!a['перевозчик/id'] && !b['перевозчик/id']) return 1;
      if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      return 0;
    });
    
    
  };
  
  $ctrl.InitDays = function(){
    $ctrl.days = dateFns.eachDay(dateFns.addMonths(new Date, -1), new Date);//.map(function(d){ return dateFns.getDate(d);});//
  };
  $ctrl.FormatThDay = function(d){
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $ctrl.IsSunSat = function(d){
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  
  $ctrl.InitCell = function(tr, d){
    var df = dateFns.format(d, 'YYYY-MM-DD');
    return $ctrl.data[tr['транспорт/id']][df];
    
  };
  
  
  
};

/******************************************************/
var Data  = function($http, appRoutes, Util){
  var data = $http.get(appRoutes.url_for('транспорт/заявки/список/интервал'));
  return {
    Load: function(){
      return data;
    },
  };
  
};

/*=============================================================*/

module

.factory(moduleName+'Data', Data)

.controller('Controll', Controll)

.component('transportAskWork', {
  templateUrl: "transport/ask/work",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());