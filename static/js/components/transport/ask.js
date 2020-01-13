(function () {'use strict';
/*
  Модуль заявок на транспорт
*/

var moduleName = "TransportAsk";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Util',  'TransportAskTable']);//, 'ContragentItem'

var Controll = function  ($scope, $timeout, $http, TemplateCache, appRoutes, Util) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  var tCache = TemplateCache.split( appRoutes.url_for('assets', 'transport/ask.html'), 1 );
  
  ctrl.$onInit = function(){
    var param = Util.paramFromLocation();
    //~ console.log("paramFromLocation", param);
    $scope.param = {};//"table":{}
    if(param && param.id) $scope.param.id = param.id[0];
    
    tCache.then(function(proms) { ctrl.ready= true; } );// массив
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
var Data  = function($http, appRoutes, Util){///$Контрагенты
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  //~ var driverData = $http.get(appRoutes.url_for('водители'));
  var cache = {};
  var factory = {
    data: {}, ///разные кэши и прочее
    "наши ТК": [1393, 10883, 971, 207975, 16307, 16404, 334742, 258399],// транпортные конторы: останина  капитал гарантия шутемов техдоргрупп западуралинвест
    "категории для прицепов": [68115], // тягачи
    "категории прицепов для тягачей": [60592, 60594, 60602], // 20n
    InitAskForm: function(data) {// новая заявка - нет данных, изменить заявку - строка
      //~ console.log("InitAskForm", data);
      if(!data) data = {};
      if(!data['@заказчики/id']) data['@заказчики/id']=[undefined];
      data.contragent2Param = [];
      data.contragent2 = data['@заказчики/id'].map(function(id){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
        data.contragent2Param.push({});
        return {"id": id};
      });
      data.contragent1 = {id: data['перевозчик/id'] || undefined};// || factory['наши ТК']
      data.contragent3 = {id: data['посредник/id'] || factory['наши ТК'], 'без сохранения': true,}; // транспортный отдел - заказчик, а contragent2 - грузоперевозчик
      if(!data['@грузоотправители/id']) data['@грузоотправители/id']=[undefined];
      data.contragent4Param = [];
      data.contragent4 = data['@грузоотправители/id'].map(function(id){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
        data.contragent4Param.push({});
        return {"id": id};
      });
      //~ data.contragent4 = {id: data['грузоотправитель/id']};
      //~ data.contragent1 = contragent1.id ? contragent1 : angular.copy(data.contragent3);
      if (data['$перевозчик'] && data['$перевозчик']['проект/id']) data['наш транспорт'] = true;///factory['наши ТК'].some(function(id){ return data['перевозчик/id'] == id; })
      else if (data['посредник/id'] || data['перевозчик/id'])  data['наш транспорт'] = false;
      //~ else data['наш транспорт'] = false;
      data.contragent1Param = {};
      if(!data['сумма/посреднику']) data['сумма/посреднику'] = [undefined];
      data['сумма/посреднику'].map(function(val, idx){ data['сумма/посреднику'][idx] = parseFloat(Util.numeric(val)); if(data['сумма/посреднику'][idx]) data['сумма/посреднику'][idx].toLocaleString(); });
      //~ data.project = {id: data['проект/id']};
      //~ data.project={id: 20962};
      //~ data.address2 = {id: data['объект/id'], title: data['объект'] || data['куда']};
      //~ if(!data['куда']) data['куда'] = [];
      //~ if(!data['откуда']) data['откуда'] = [];
      data.address2 =  (data['$куда'] || JSON.parse('[[""]]')).map(function(arr){ return arr.map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, }; }); });//_idx: idx
      data.address1 =  (data['$откуда'] || JSON.parse('[[""]]')).map(function(arr){ return arr.map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, }; }); });//_idx: idx
      //~ data.address1 =  data['откуда'].map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, _idx: idx}; });
      data.addressParam = {"контрагенты": data.contragent2, placeholder:'город/область или объект', 'inputClass4Object':'orange-text text-darken-4',};//"проект": data.project, 
      data.category = {topParent: {id: 36668}, selectedItem: {id: data['категория/id']}};//34708
      data.transport = {id: data['транспорт/id'], title: data['транспорт']};
      data.transportParam = {"перевозчик": angular.copy(data.contragent1), "категория": data.category,};// "наш транспорт": data['наш транспорт']
      if (data['транспорт1/id']) {// может тягач
        data.transport1 = {id: data['транспорт1/id'], title: data['транспорт1']};
        data.transport1Param = {"перевозчик": {id: factory["наши ТК"]}, "категория": factory["категории для прицепов"], "placeholder": 'тягач'};
      }
      data.driver = {"id": data['водитель-профиль/id'], "title": (data['водитель-профиль'] && data['водитель-профиль'].join(' ')) || data['водитель'] && data['водитель'][0], "phone": data['водитель-профиль/телефон'] || data['водитель'] && data['водитель'][1],  "doc": data['водитель-профиль/док'] || data['водитель'] && data['водитель'][2]};
      if (!data['контакты']) data['контакты'] = [];///перевозчика и посредника
      data.driverParam = {"контрагент": data.contragent1, "контакт":"водитель"};
      data.contact1 = {"title":  data['контакты'][0] && data['контакты'][0][0], "phone": data['контакты'][0] && data['контакты'][0][1]};
      data.contact1Param = {"контрагент": data.contragent1, "контакт":"перевозчик"};//контакт1
      data.contact2Param = [];
      if(!data['контакты заказчиков']) data['контакты заказчиков'] = [[]];
      if (!data['контакты заказчиков'].length) data['контакты заказчиков'].push([]);
      data.contact2 = data['контакты заказчиков'].map(function(item, idx){
        data.contact2Param.push({"контрагент": data.contragent2[idx], "контакт":"заказчик"});//контакт2
        return {"title":  item[0], "phone": item[1]};
      });
      data.contact3 = {"title":  data['контакты'][2] && data['контакты'][2][0], "phone": data['контакты'][2] && data['контакты'][2][1]};
      data.contact3Param = {"контрагент": data.contragent3, "контакт":"посредник"};//контакт3
      //~ data.contact4 = {"title":  data['контакты'][3] && data['контакты'][3][0], "phone": data['контакты'][3] && data['контакты'][3][1]},
      //~ data.contact4Param = {"контрагент": data.contragent4, "контакт":"грузоотправитель"};//контакт4
      data.contact4Param = [];
      if(!data['контакты грузоотправителей']) data['контакты грузоотправителей'] = [[]];
      if (!data['контакты грузоотправителей'].length) data['контакты грузоотправителей'].push([]);
      data.contact4 = data['контакты грузоотправителей'].map(function(item, idx){
        data.contact4Param.push({"контрагент": data.contragent4[idx], "контакт":"грузоотправитель"});//контакт4
        return {"title":  item[0], "phone": item[1]};
      });
      data.director1 = {"title":  data['директор1'] && data['директор1'][0], "phone": data['директор1'] && data['директор1'][1]};// перевозчик в лице руководителя
      data.director1Param = {"контрагент": data.contragent1, "контакт":"директор1"};
      //~ data.driverData = driverData;
      //~ data.driver = {"транспорт":data.transport}
      data['без груза'] = !!data.id && !data['груз'];
      data['маршрут на круг'] = !!data['маршрут на круг'] || null;
      if(!data["дата1"]) data["дата1"]=Util.dateISO(0);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
      if(data['стоимость']) {// смотри ask-form.js FormatNumeric
        var st = parseFloat(Util.numeric(data['стоимость']));
        data['стоимость'] = st.toLocaleString('ru');
        var fakt = parseFloat(Util.numeric(data['факт']));
        if (data['тип стоимости'] === 0) data['сумма'] = data['стоимость'];
        else if (fakt && data['тип стоимости']) data['сумма'] = (Math.round(st * fakt*100)/100).toLocaleString('ru');
        if (data['стоимость/с НДС'] !== undefined) data['стоимость/с НДС'] = !!data['стоимость/с НДС'];
      }
      if(!data.id) data['черновик'] = true;
      //~ if(!data["позиции"]) data["позиции"] = [{}];
      //~ if((data['позиции'] && angular.isString(data['позиции'][0])) || (data['позиции тмц'] && angular.isString(data['позиции тмц'][0])))
        //~ data['позиции тмц'] = data['позиции'] = ((angular.isString(data['позиции'][0]) && data['позиции']) || (angular.isString(data['позиции тмц'][0]) && data['позиции тмц'])).map(function(row){ return JSON.parse(row); });
      //~ console.log("InitAskForm", data);
      return data;
    },
    Category: function(){
      var url = appRoutes.url_for('категории/список', 36668);
      if (!cache[url]) cache[url] = $http.get(appRoutes.url_for('категории/список', 36668));//34708
      return cache[url];
    },
    PayType: function(){
      return [
        {title:'вся сумма', val:0},
        {title:'за час', title2:'час', val:1},
        {title:'за км', title2:'км', val:2},
        {title:'за рейс', title2:'рейс', val:3},
      ];
      
    },
    "наш транспорт": function(refresh){
      if (refresh) factory.data['наш транспорт'] = undefined;
      if (!factory.data['наш транспорт']) factory.data['наш транспорт'] = $http.get(appRoutes.url_for('наш транспорт'));
      return factory.data['наш транспорт'];
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