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
  var factory = {
    "наши ТК": [1393, 10883],// транпортные конторы: останина и капитал
    InitAskForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      //~ console.log("InitAskForm", data);
      if(!data) data = {};
      data.contragent2 = {id: data['заказчик/id']};//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
      data.contragent2Param = {};
      data.contragent1 = {id: data['перевозчик/id'] || undefined};// || factory['наши ТК']
      data.contragent3 = {id: data['посредник/id'] || factory['наши ТК'], 'без сохранения': true,}; // транспортный отдел - заказчик, а contragent2 - грузоперевозчик
      //~ data.contragent1 = contragent1.id ? contragent1 : angular.copy(data.contragent3);
      if (data['перевозчик/id'] && data['перевозчик/проект/id']) data['наш транспорт'] = true;///factory['наши ТК'].some(function(id){ return data['перевозчик/id'] == id; })
      else if (data['посредник/id'] || data['перевозчик/id'])  data['наш транспорт'] = false;
      //~ else data['наш транспорт'] = false;
      data.contragent1Param = {};
      
      if (data['сумма/посредник-ГП']) data['сумма/посредник-ГП'] = parseFloat(Util.numeric(data['сумма/посредник-ГП'])).toLocaleString('ru-RU');
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
      data.transportParam = {"заказчик": data.contragent2, "перевозчик": angular.copy(data.contragent1), "категория": data.category,};// "наш транспорт": data['наш транспорт']
      data.driver = {"id": data['водитель-профиль/id'], "title": (data['водитель-профиль'] && data['водитель-профиль'].join(' ')) || data['водитель'] && data['водитель'][0], "phone": data['водитель-профиль/телефон'] || data['водитель'] && data['водитель'][1],  "doc": data['водитель-профиль/док'] || data['водитель'] && data['водитель'][2]};
      data.driverParam = {"контрагент": data.contragent1, "контакт":"водитель"};
      data.contact1 = {"title":  data['контакт1'] && data['контакт1'][0], "phone": data['контакт1'] && data['контакт1'][1]},
      data.contact1Param = {"контрагент": data.contragent1, "контакт":"контакт1"};
      data.contact2 = {"title":  data['контакт2'] && data['контакт2'][0], "phone": data['контакт2'] && data['контакт2'][1]},
      data.contact2Param = {"контрагент": data.contragent2, "контакт":"контакт2"};
      data.contact3 = {"title":  data['контакт3'] && data['контакт3'][0], "phone": data['контакт3'] && data['контакт3'][1]},
      data.contact3Param = {"контрагент": data.contragent3, "контакт":"контакт3"};
      //~ data.driverData = driverData;
      //~ data.driver = {"транспорт":data.transport}
      data['без груза'] = !!data.id && !data['груз'];
      //~ if(!data["позиции"]) data["позиции"] = [{}];
      if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      if(data['стоимость']) {// смотри ask-form.js FormatNumeric
        var st = parseFloat(Util.numeric(data['стоимость']));
        data['стоимость'] = st.toLocaleString('ru');
        var fakt = parseFloat(Util.numeric(data['факт']));
        if (data['тип стоимости'] === 0) data['сумма'] = data['стоимость'];
        else if (fakt && data['тип стоимости']) data['сумма'] = (Math.round(st * fakt*100)/100).toLocaleString('ru');
      }
      //~ console.log("InitAskForm", angular.copy(data));
      return data;
    },
    category: function(){
      return $http.get(appRoutes.url_for('категории/список', 36668));//34708
      
    },
    payType: function(){
      return [
        {title:'вся сумма', val:0},
        {title:'за час', val:1},
        {title:'за км', val:2},
      ];
      
    },
    "свободный транспорт": function(){
      return $http.get(appRoutes.url_for('свободный транспорт'));
    },
  };
  return factory;
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory(moduleName+'Data', Data)

.controller('Controll', Controll)

;

}());