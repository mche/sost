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
    {title:"Все", filter: function(tab, item){ return true; }, classLi:'teal lighten-4', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3' },
    {title:"новые", filter: function(tab, item){ return !item['транспорт/id']; }, classLi:'teal lighten-4', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    {title:"в работе", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, classLi:'teal lighten-4', classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    //~ {title:"В работе*", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"завершенные", filter: function(tab, item){ return !!item['транспорт/id'] && !!item['дата2']; }, classLi:'teal lighten-4', styleLi:{'margin-right':"1rem"}, classA: 'teal-text text-darken-3 ', aClassActive: ' before-teal-darken-3'},
    
    {title:"Снабжение", filter: function(tab, item){ return !!item['снабженец']; }, classLi:'lime lighten-4', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"новые", filter: function(tab, item){ return !!item['снабженец'] &&  !item['транспорт/id']; }, classLi:'lime lighten-4', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"в работе", filter: function(tab, item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !item['дата2']; }, classLi:'lime lighten-4', classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    {title:"завершенные", filter: function(tab, item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !!item['дата2']; }, classLi:'lime lighten-4', styleLi:{"margin-right":"1rem"}, classA: 'lime-text text-darken-3 ', aClassActive: ' before-lime-darken-1'},
    
    {title:"Мои", filter: function(tab, item){ return $ctrl.uid == item.uid; }, style000:{'border-left': "2px solid purple"}, classLi:' purple lighten-4 ', classA: ' purple-text text-darken-4 ', aClassActive: ' before-purple-darken-4 '},
    {title:"в работе", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !item['дата2']; }, classLi:' purple lighten-4 ', classA: ' purple-text text-darken-4 ', aClassActive: ' before-purple-darken-4 '},
    {title:"завершенные", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !!item['дата2']; }, classLi:' purple lighten-4 ', classA: ' purple-text text-darken-4 ', aClassActive: ' before-purple-darken-4 '},
    
    // отдельной кнопкой, не таб
    {title: 'Транспорт', filter: function(tr){ return true; }, cnt: function(tab){ return $ctrl['@наш транспорт'] && $ctrl['@наш транспорт'].length; }, classLi:'hide',},
    {title: 'Свободный транспорт', filter: function(tr){ return !tr['занят']; }, cnt: function(tab){ return $ctrl['@наш транспорт'] && $ctrl['@наш транспорт'].filter(tab.filter, tab).length; }, classLi:'hide',},
    {title: 'Транспорт в работе', filter: function(tr){ return !!tr['занят']; }, cnt: function(tab){ return $ctrl['@наш транспорт'] && $ctrl['@наш транспорт'].filter(tab.filter, tab).length; }, classLi:'hide',},
    {title: 'Транспорт в моих заявках', filter: function(tr){ return !!tr['занят'] && tr['заявка'] && tr['заявка']['$логистик'] && $ctrl.uid == tr['заявка']['$логистик'].id; }, cnt: function(tab){ return $ctrl['@наш транспорт'] && $ctrl['@наш транспорт'].filter(tab.filter, tab).length; }, classLi:'hide',},
  
  ];
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table = {"дата1":{"values":[]}, "дата2":{"values":[]}, "дата3":{"values":[]}, "перевозчик":{}, "@заказчики":{}, "транспорт":{}, "откуда":{}, "куда":{}, "груз":{}, "коммент":{}, "номер":{}, "ts":{"values":[]}, "сумма":{"values":[]},};// фильтры
      $scope.param = $ctrl.param;
      
      var async = [];
      
      async.push(ObjectAddrData.Objects().then(function(resp){
        $ctrl['объекты'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        
      }));
      
      async.push(TransportAskData.category().then(function(resp){
        $ctrl['категории транспорта'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        
      }));

      async.push($ctrl.LoadData());//.then()
      
      $q.all(async).then(function(){
        
        $ctrl.ready = true;
        
        $ctrl.LoadTransport();
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          //~ $('ul.tabs', $($element[0])).tabs();
          
          //~ $ctrl['ссылка контроля заявок'] = $('header ul.menu-nav li a[data-url-for="контроль заявок"]');
          $scope.uid = $ctrl.uid = $('head meta[name="app:uid"]').attr('content');
          
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
    //~ });
    
  };
  
  $scope.$on('Сохранена заявка на транспорт', function(event, ask){
    //~ console.log("Сохранена заявка на транспорт", ask);
    var old = $ctrl.data_[ask.id];
    if(old) {///прежняя заявка
      
      var idx = $ctrl.data.indexOf(old);
      //~ console.log("прежняя заявка", old, idx, );
      //~ if (idx >= 0) $ctrl.data.splice(idx, 1);
      old._hide = true;
      Object.keys(ask).map(function(key){ old[key] = ask[key]; });
      $timeout(function(){ old._hide = false; });
      //~ $ctrl.InitRow(ask);
      
    } else {
      $ctrl.data.unshift(ask);
      //~ $ctrl.LoadDataTMC([ask]);
    }
    $ctrl.LoadDataTMC([ask]);
    $ctrl.param.id = ask.id;
    $ctrl.SelectTab($ctrl.tabs[0]);
    
    var tr;
    if(ask['транспорт/id'] && (tr = $ctrl['$наш транспорт'][ask['транспорт/id']]) ) {
      tr['занят'] = 1;
      tr['заявка'] = ask;
    }
    
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
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerHttp = true;
    
    return $http.post(appRoutes.url_for('транспорт/список заявок'), $ctrl.param /***, {"timeout": $ctrl.cancelerHttp.promise}***/) 
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else if (angular.isArray(resp.data)) {
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
  $ctrl.LoadDataTMC = function(data, param){//дозагрузка данных позиций ТМЦ для списка заявок
    var tmc=[];//*сбор заявок с тмц
    //~ if (!$ctrl.data_) {};
    $ctrl.data_ = data.reduce(function(result, item, index, array) {
      if(!result[item.id]) result[item.id] = item;
      if (item['снабженец'] || !item['$позиции тмц']) tmc.push(item.id);
      return result;
    }, $ctrl.data_ || {});
  
    if(tmc.length === 0) return;//нет заявок снабжения
    param = param || angular.copy($ctrl.param);
    if (!param.hasOwnProperty('позиции тмц')) param['позиции тмц'] = true;//переключатель запроса на снаб/тмц позиции
    param['транспорт/заявки/id'] = tmc;
    return $http.post(appRoutes.url_for('транспорт/список заявок'), param).then(function(resp){
      resp.data.map(function(r){
        var row = $ctrl.data_[r.id || r["транспорт/заявка/id"]];
        Object.keys(r).map(function(key){
          row[key] = r[key];
        });
        //~ $ctrl.InitRow(row);///
      });
    });
  };
  
  $ctrl.LoadTransport = function(refresh){///наш транспорт
    return TransportAskData['наш транспорт'](refresh).then(function(resp){
      $ctrl['@наш транспорт']  = resp.data;
      var load_ask =[];
      $ctrl['$наш транспорт'] = resp.data.reduce(function(result, item, index, array) {  item['заявка'] = $ctrl.data_[item['транспорт/заявка/id']] = $ctrl.data_[item['транспорт/заявка/id']] || item['транспорт/заявка/id'] && load_ask.push({id: item['транспорт/заявка/id']}) && load_ask[load_ask.length-1]; result[item.id] = item; return result; }, {});
      
      if (load_ask.length) $ctrl.LoadDataTMC(load_ask, {'позиции тмц': 0}).then(function(){
        load_ask.map(function(r){
          //~ $ctrl.InitRow($ctrl.data_[r.id]);///
        })
        
      });
  
    });
    
  };
  
  $ctrl.IsTransportTab = function(){///( $ctrl.tab.title == 'Свободный транспорт' || $ctrl.tab.title == 'Транспорт' ||  $ctrl.tab.title == 'Транспорт в работе' || $ctrl.tab.title == 'Транспорт в моих заявках')
    return $ctrl.tabs.slice(-4).some(function(tab){
      return tab === $ctrl.tab;
      
    });
    
  };
  
  $ctrl.InitTransport = function(tr){
    if (tr['заявка'])  $ctrl.InitRow(tr['заявка']);
    
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
    $ctrl.tab = undefined;
    $timeout(function(){
      $ctrl.tab = t;
    });
    //~ if (init) $timeout(function(){ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',}); });
  };
  
  $ctrl.InitAskTable  = function(){
    $timeout(function(){
      //~ Util.ScrollTable($('table.ask', $element[0]));
      //~ $('table.ask', $element[0]).scrollTableBody();
    });
    
    
  };
  
  $ctrl.FilterData = function(item){
    //~ console.log("FilterData");
    if(item._hide) return false;
    var tab = this || $ctrl.tab;
    if(!tab) return false;
    if (tab.filter) return tab.filter(tab, item);
    return false;
  };
  
  $ctrl.InitRow = function(r){
    //~ if(r._initRow) return;
    if (r['с объекта/id'] && !['$с объекта'])  r['$с объекта'] = $ctrl['объекты'][r['с объекта/id']];
    if (r['на объект/id'] && !r['$на объект'])  r['$на объект'] = $ctrl['объекты'][r['на объект/id']];
    //~ if(r["тмц/снаб/id"]) r["коммент"] = "\n"
    //~ if () r['заказчики'] = r['$заказчики'];//.map(function(z){ return JSON.parse(z); });
    //~ console.log("InitRow", r['заказчики']);
    //~ if (!r.addr1) 
    r.addr1= r['$откуда'] || JSON.parse('[[]]');
    //~ if (!r.addr2) 
    r.addr2= r['$куда'] || JSON.parse('[[]]');
    if(r['категория/id']) r['категория'] = $ctrl['категории транспорта'][r['категория/id']];
    //~ r._initRow = true;
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