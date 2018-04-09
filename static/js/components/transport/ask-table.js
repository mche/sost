(function () {'use strict';
/*
*/

var moduleName = "TransportAskTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',  'ContragentItem', 'TransportAskWork', 'Объект или адрес', 'TransportItem', 'TransportAskForm',]);//'ngSanitize',, 'dndLists''AppTplCache',

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, $templateCache, appRoutes, Util, TransportAskData, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.JSON = JSON;
  $scope.appRoutes = appRoutes;
  $scope.payType = TransportAskData.payType();
  $scope.$templateCache = $templateCache;
  $ctrl.tabs = [
    {title:"Все", filter: function(tab, item){ return true; }, classLi:'teal lighten-3', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3' },
    {title:"новые", filter: function(tab, item){ return !item['транспорт/id']; }, classLi:'teal lighten-3', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    {title:"в работе", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, classLi:'teal lighten-3', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    //~ {title:"В работе*", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"завершенные", filter: function(tab, item){ return !!item['транспорт/id'] && !!item['дата2']; }, classLi:'teal lighten-3', styleLi:{'margin-right':"1rem"}, classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    
    {title:"Снабжение", filter: function(tab, item){ return !!item['снабженец']; }, classLi:'lime lighten-2', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"новые", filter: function(tab, item){ return !!item['снабженец'] &&  !item['транспорт/id']; }, classLi:'lime lighten-2', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"в работе", filter: function(tab, item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !item['дата2']; }, classLi:'lime lighten-2', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"завершенные", filter: function(tab, item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !!item['дата2']; }, classLi:'lime lighten-2', styleLi:{"margin-right":"1rem"}, classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    
    {title:"Мои", filter: function(tab, item){ return $ctrl.uid == item.uid; }, style000:{'border-left': "2px solid yellow"}, classLi:'yellow darken-1 ', classA: 'yellow-text text-darken-4 ', aClassActive: ' before-yellow-darken-4'},
    {title:"в работе", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !item['дата2']; }, classLi:'yellow darken-1 ', classA: 'yellow-text text-darken-4 ', aClassActive: ' before-yellow-darken-4'},
    {title:"завершенные", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !!item['дата2']; }, style000:{'border-right': "2px solid yellow"}, classLi:'yellow darken-1', classA: 'yellow-text text-darken-4 ', aClassActive: ' before-yellow-darken-4'},
    
    // отдельной кнопкой, не таб
    {title: 'Свободный транспорт', cnt: function(){ return $ctrl.dataTransport && $ctrl.dataTransport.length; }, classLi:'hide',},
  
  ];
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table = {"дата1":{"values":[]}, "дата2":{"values":[]}, "дата3":{"values":[]}, "перевозчик":{}, "заказчик":{}, "транспорт":{}, "откуда":{}, "куда":{}, "груз":{}, "коммент":{}, "номер":{}, "ts":{"values":[]}, "сумма":{"values":[]},};// фильтры
      $scope.param = $ctrl.param;
      
      var async = [];
      
      //~ async.push(TransportAskData['свободный транспорт']().then(function(resp){
        //~ $ctrl.dataTransport  = resp.data;
      //~ }));
      
      async.push(ObjectAddrData.Objects().then(function(resp){
        $ctrl['объекты'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        
      }));

      async.push($ctrl.LoadData());//.then()
      
      $q.all(async).then(function(){
        
        $ctrl.ready = true;
        
        TransportAskData['свободный транспорт']().then(function(resp){
          $ctrl.dataTransport  = resp.data;
        });
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          //~ $('ul.tabs', $($element[0])).tabs();
          
          //~ $ctrl['ссылка контроля заявок'] = $('header ul.menu-nav li a[data-url-for="контроль заявок"]');
          $ctrl.uid = $('head meta[name="app:uid"]').attr('content');
          
          if ($ctrl.param.id) var f = $ctrl.data.filter(function(item) { return item.id == $ctrl.param.id; });
          if (f && f.length){
            var t = [5, 9, 8, 1,  0]; //хитрый перебор табов
            for (var i = 0; i < t.length; i++) {
              var tab = $ctrl.tabs[t[i]];
              if(f.filter($ctrl.FilterData, tab).length)
                return $timeout(function(){$ctrl.SelectTab(tab, true);}).then(function(){ $timeout(function(){
                  //~ console.log("нашел строку в табе: ", tab);
                  var tr = $('#'+$ctrl.param.id); 
                  if(!Util.isElementInViewport(tr)) $('html,body').animate({scrollTop: tr.offset().top}, 1500);
                }, 10);  });//
            }
          }
          $timeout(function(){
            var t = [5, 1, 9,  0]; // новые или в работе или мои
            for (var i = 0; i < t.length; i++) {
              var tab = $ctrl.tabs[t[i]];
              if($ctrl.data.filter($ctrl.FilterData, tab).length)
                return $ctrl.SelectTab(tab, true);
            }
            $ctrl.SelectTab($ctrl.tabs[$ctrl.tabs.length-1], true);
          });
        });
        
      });
      
    });
    
  };
  
  $scope.$on('Сохранена заявка на транспорт', function(event, ask){
    var old = $ctrl.dataMap[ask.id];
    if(old) {///прежняя заявка
      var idx = $ctrl.data.indexOf(old);
      if (idx >= 0) $ctrl.data.splice(idx, 1);
    }
    $ctrl.InitRow(ask);
    $ctrl.LoadDataTMC([ask]);
    $ctrl.param.id = ask.id;
    $ctrl.data.unshift(ask);
    $ctrl.SelectTab($ctrl.tabs[0]);
    
    $timeout(function(){
      var tr = $('#'+ask.id); 
      if(!Util.isElementInViewport(tr)) $('html,body').animate({scrollTop: tr.offset().top}, 1500);
      
    }, 100);
    
    
  });
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    $ctrl.param.tab = $ctrl.tab ? $ctrl.tabs.indexOf($ctrl.tab) : undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('транспорт/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) 
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ if (key == 'с объекта/id' && r[key]) {
          //~ r['$с объекта'] = $ctrl['объекты'][r[key]];
          //~ map[r['транспорт/заявка/id']]['$с объекта'] = r['$с объекта'];
        //~ }
        //~ if (key == 'на объект/id' && r[key]) {
          //~ r['$на объект'] = $ctrl['объекты'][r[key]];
          //~ map[r['транспорт/заявка/id']]['$на объект'] = r['$на объект'];
        //~ }
          Array.prototype.push.apply($ctrl.data, resp.data);
          $ctrl.lastDataChunkLen =  resp.data.length;
          $ctrl.LoadDataTMC(resp.data);
        }
      });
    
  };
  $ctrl.LoadDataTMC = function(data){//дозагрузка данных позиций ТМЦ для списка заявок
    var tmc=[];//*сбор заявок с тмц
    if (!$ctrl.dataMap) $ctrl.dataMap = {};
    data.reduce(function(result, item, index, array) {
      result[item.id] = item;
      if (item['снабженец'] || !item['$позиции тмц']) tmc.push(item.id);
      return result;
      
    }, $ctrl.dataMap);
  
    if(tmc.length === 0) return;//нет заявок снабжения
    var param = angular.copy($ctrl.param);
    param['позиции тмц'] = true;//переключатель запроса на снаб/тмц позиции
    param['транспорт/заявки/id'] = tmc;
    $http.post(appRoutes.url_for('транспорт/список заявок'), param).then(function(resp){
      resp.data.map(function(r){
        Object.keys(r).map(function(key){
          $ctrl.dataMap[r['транспорт/заявка/id']][key] = r[key];
        });
      });
    });
  };
  /*$ctrl.OrderByData = function(it){// для необработанной таблицы
    if ($ctrl.tab === $ctrl.tabs[3]) return it["дата1"]+'-'+it.id;//для обратного порядка завершенных заявок
    var s = dateFns.differenceInDays(dateFns.addDays(new Date(), 365),  it["дата1"])+'-'+1/it.id;
    console.log("OrderByData", it, s );
    return s;
  };*/
  $ctrl.TabLiClass = function(tab) {
    var c = tab.classLi || '';
    if ( tab === $ctrl.tab) c += ' active ';
    return c;
  };
  $ctrl.TabAClass = function(tab) {
    var c = tab.classA || '';
    if ( tab === $ctrl.tab) c += ' active '+(tab.aClassActive || '');
    return c;
  };
  $ctrl.TabClassSup = function(t) {
    var cls = '';
    if (t.classSup) cls += t.classSup;
    return cls;
    
  };
  $ctrl.SelectTab = function(t, init){
    $ctrl.tab = t;
    //~ if (init) $timeout(function(){ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',}); });
  };
  
  $ctrl.FilterData = function(item){
    //~ console.log("FilterData");
    var tab = this || $ctrl.tab;
    if(!tab) return false;
    if (tab.filter) return tab.filter(tab, item);
    return false;
  };
  
  $ctrl.InitRow = function(r){
    if(r._initRow) return;
    if (r['с объекта/id'])  r['$с объекта'] = $ctrl['объекты'][r['с объекта/id']];
    if (r['на объект/id'])  r['$на объект'] = $ctrl['объекты'][r['на объект/id']];
    //~ if(r["тмц/снаб/id"]) r["коммент"] = "\n"
    r['заказчики'] = r['$заказчики'];//.map(function(z){ return JSON.parse(z); });
    //~ console.log("InitRow", r['заказчики']);
    r.addr1= r['$откуда'] || JSON.parse('[[]]');
    r.addr2= r['$куда'] || JSON.parse('[[]]');
    r._initRow = true;
  };
  
  $ctrl.Edit = function(it){// клик на строке
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    //~ $ctrl.param.id = it.id;
    //~ delete $ctrl.param.newX;
    //~ $ctrl.param.edit = it;
    $rootScope.$broadcast('Редактировать заявку на транспорт', it);
    //~ $ctrl.param.edit._init=true;
    //~ $timeout(function(){$ctrl.param.form= true;});
    
  };
  
  $ctrl.Delete = function(it){
    //~ var it = $ctrl.param.delete;
    //~ delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    //~ delete n._append;
    //~ n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(it);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    
  };

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    $ctrl.ready = false;
    $ctrl.LoadData().then(function(){ $ctrl.ready = true; });//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    console.log("Send", $ctrl.param.table, name);
    if(!$ctrl.param.table[name]) return;
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.table['сумма'].sign = abs;
    //~ }
    $ctrl.param.table[name].ready = 1;
    $ctrl.ready = false;
    $ctrl.LoadData().then(function(){ $ctrl.ready = true; });//$ctrl.param.table
    $ctrl.SelectTab($ctrl.tabs[0]);// на все
  };
  
  $ctrl.ObjectOrAddress = function(item){ //преобразовать объект или оставить адрес
    var id = (/^#(\d+)$/.exec(item) || [])[1];
    if (!id) return {name: item};
    var ob = $ctrl['объекты'][id];//.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $ctrl.FreeTransportOrderBy = function(tr) {
    //~ console.log(" FreeTransportOrderBy ", tr);
    return tr.title;
    
  };
};


/*=============================================================*/

module

.component('transportAskTable', {
  templateUrl: "transport/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());