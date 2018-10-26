(function () {'use strict';
/*
*/

var moduleName = "TransportAskTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',  'Контрагенты', 'TransportAskWork', 'Объект или адрес', 'TransportItem', 'TransportAskForm',]);//'ngSanitize',, 'dndLists'
var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, $templateCache, appRoutes, Util, TransportAskData, ObjectAddrData, $Контрагенты) {
  var $c = this;
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.JSON = JSON;
  $scope.appRoutes = appRoutes;
  $scope.payType = TransportAskData.payType();
  $scope.$templateCache = $templateCache;

  $c.tabs = [
    {// строка
      "title": 'Заявки',
      "childs":[
        {
          "title":'все',
          "filter":function(item){ return true; },
          "liClass": 'teal lighten-4',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          //~ "svgClass":'orange-fill fill-darken-3',
        },
        
        {//таб
          "title": 'новые',
          "filter": function(item){ /*tab = tab || this;*/ return !item['транспорт/id']; },
          "liClass": 'teal lighten-4',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
        },
        
        {//таб
          "title": 'в работе',
          "filter": function(item){ return !!item['транспорт/id'] && !item['дата2']; },
          "liClass": 'teal lighten-4',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
        },
        
        {//таб
          "title": 'завершенные',
          "filter": function(item){ return !!item['транспорт/id'] && !!item['дата2']; },
          "liClass": 'teal lighten-4',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
        },
      
      ],
      "liClass": 'teal-text-darken-3',
      "tbodyClass": 'teal lighten-5',
    },
    
    {// строка
      "title":'Заявки снабжения',
      "childs": [
        {
          "title":'все',
          "filter": function(item){ return !!item['снабженец']; },
          "liClass": 'lime lighten-3',
          "aClass": 'lime-text text-darken-3 ',
          "aClassActive": ' before-lime-darken-1',
          //~ "svgClass":'orange-fill fill-darken-3',
        },
        
        {//таб
          "title": 'новые',
          "filter": function(item){ return !!item['снабженец'] &&  !item['транспорт/id']; },
          "liClass": 'lime lighten-3',
          "aClass": 'lime-text text-darken-3 ',
          "aClassActive": ' before-lime-darken-1',
        },
        
        {//таб
          "title": 'в работе',
          "filter": function(item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !item['дата2']; },
          "liClass": 'lime lighten-3',
          "aClass": 'lime-text text-darken-3 ',
          "aClassActive": ' before-lime-darken-1',
        },
        
        {//таб
          "title": 'завершенные',
          "filter": function(item){ return !!item['снабженец'] &&  !!item['транспорт/id'] && !!item['дата2']; },
          "liClass": 'lime lighten-3',
          "aClass": 'lime-text text-darken-3 ',
          "aClassActive": ' before-lime-darken-1',
        },
      
      ],
      
      "liClass": 'lime-text-darken-4',
      "tbodyClass": 'lime lighten-5',
      //~ "svgClass":'teal-fill fill-darken-3',
    },
    
    {// строка
      "title":'Мои заявки',
      "childs": [
        {
          "title":'все',
          "filter": function(item){ return $c.uid == item.uid; },
          "liClass": 'purple lighten-4',
          "aClass": 'purple-text text-darken-4 ',
          "aClassActive": ' before-purple-darken-3',
          //~ "svgClass":'orange-fill fill-darken-3',
        },
        
        {//таб
          "title": 'в работе',
          "filter": function(item){ return $c.uid == item.uid && !!item['транспорт/id'] && !item['дата2']; },
          "liClass": 'purple lighten-4',
          "aClass": 'purple-text text-darken-4 ',
          "aClassActive": ' before-purple-darken-3',
        },
        
        {//таб
          "title": 'завершенные',
          "filter": function(item){ return $c.uid == item.uid && !!item['транспорт/id'] && !!item['дата2']; },
          "liClass": 'purple lighten-4',
          "aClass": 'purple-text text-darken-4 ',
          "aClassActive": ' before-purple-darken-3',
        },
      
      ],
      
      "liClass": 'purple-text-darken-1',
      "tbodyClass": 'purple lighten-5',
      //~ "svgClass":'teal-fill fill-darken-3',
    },
  
    {// строка
      "title":'Транспорт',
      "childs": [
        {
          "title":'Наш транспорт',
          "filter": function(tr){ return true; },
          //~ "liClass": 'purple lighten-4',
          "aClass": 'blue white-text ',
          "svgClass": ' white-fill ',
          //~ "aClassActive": ' before-purple-darken-4',
        },
        
        {//таб
          "title": 'В работе',
          "filter": function(tr){ return !!tr['занят']; },
          //~ "liClass": 'purple lighten-4',
          "aClass": '  blue lighten-4 red-text text-darken-4 ',
          //~ "aClassActive": ' before-purple-darken-4',
          "svgClass": ' red-fill-darken-4 ',
        },
        
        {//таб
          "title": 'Свободный',
          "filter": function(tr){ return !tr['занят']; },
          //~ "liClass": 'purple lighten-4',
          "aClass": ' blue lighten-4 green-text text-darken-4 ',
          //~ "aClassActive": ' before-purple-darken-4',
          "svgClass": ' green-fill-darken-4 ',
        },
        {
          "title": 'В моих заявках',
          "filter": function(tr){ return !!tr['занят'] && tr['заявка'] && tr['заявка']['$логистик'] && $c.uid == tr['заявка']['$логистик'].id; },
          "aClass": ' blue lighten-4 purple-text text-darken-3 ',
          "svgClass": ' purple-fill-darken-3 ',
        },
      
      ],
      
      "liClass": 'purple lighten-4 purple-text text-darken-4',
      //~ "svgClass":'teal-fill fill-darken-3',
    },
  ];
  
  $c.$onInit = function(){

      if(!$c.param.table) $c.param.table = {"дата1":{"values":[]}, "дата2":{"values":[]}, "дата3":{"values":[]}, "перевозчик":{}, "@заказчики":{}, "транспорт":{}, "откуда":{}, "куда":{}, "груз":{}, "коммент":{}, "номер":{}, "ts":{"values":[]}, "сумма":{"values":[]},"категория":{},};// фильтры на сервер
      if(!$c.param['переключатели']) $c.param['переключатели'] = {};///местные переключатели
      $scope.param = $c.param;
      
      var async = [];
      
      async.push($Контрагенты.Load());
      //~ .then(function(resp){
        //~ $c['контрагенты'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
      //~ }));
      
      async.push(ObjectAddrData.Objects().then(function(resp){
        $c['объекты'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        
      }));
      
      async.push(TransportAskData.category().then(function(resp){
        $c['@категории транспорта'] = resp.data;
        $c['$категории транспорта'] = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        
      }));

      //~ async.push($c.LoadData());//.then()
      
      $q.all(async).then(function(){
        
        $c.LoadData().then(function(){
        
          $c.ready = true;
          
          $c.LoadTransport();
          
          $timeout(function(){
            $('.modal', $($element[0])).modal({
              endingTop: '0%',
              ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                $c.modal_trigger = trigger;
              },
            });
            
            //~ $('ul.tabs', $($element[0])).tabs();
            
            //~ $c['ссылка контроля заявок'] = $('header ul.menu-nav li a[data-url-for="контроль заявок"]');
            $scope.uid = $c.uid = $('head meta[name="app:uid"]').attr('content');
            
            /*if ($c.param.id) var f = $c.data.filter(function(item) { return item.id == $c.param.id; });
            if (f && f.length){
              var t = [5, 9, 8, 1,  0]; //хитрый перебор табов
              for (var i = 0; i < t.length; i++) {
                var tab = $c.tabs[t[i]];
                if(f.filter($c.FilterData, tab).length)
                  return $timeout(function(){$c.SelectTab(tab, true);}).then(function(){ $timeout(function(){
                    //~ console.log("нашел строку в табе: ", tab);
                    var tr = $('#'+$c.param.id); 
                    if(!Util.isElementInViewport(tr)) $('html,body').animate({scrollTop: tr.offset().top}, 1500);
                  }, 10);  });//
              }
            }*/
            /*
            $timeout(function(){
              var t = [5, 1, 9,  0]; // новые или в работе или мои
              for (var i = 0; i < t.length; i++) {
                var tab = $c.tabs[t[i]];
                if($c.data.filter($c.FilterData, tab).length)
                  return $c.SelectTab(tab, true);
              }
              $c.SelectTab($c.tabs[$c.tabs.length-1], true);
            });*/
            $c.SelectTab(undefined, 'Заявки', 'все');
          });///timeout
        });///LoadData
      });///async
    
  };
  
  $scope.$on('Сохранена заявка на транспорт', function(event, ask){
    //~ console.log("Сохранена заявка на транспорт", ask);
    var old = $c.data_[ask.id];
    if(old) {///прежняя заявка
      
      var idx = $c.data.indexOf(old);
      //~ console.log("прежняя заявка", old, idx, );
      //~ if (idx >= 0) $c.data.splice(idx, 1);
      old._hide = true;
      Object.keys(ask).map(function(key){ old[key] = ask[key]; });
      $timeout(function(){ old._hide = false; });
      //~ $c.InitRow(ask);
      
    } else {
      $c.data.unshift(ask);
      //~ $c.LoadDataTMC([ask]);
    }
    $c.LoadDataTMC([ask]);
    $c.param.id = ask.id;
    $c.SelectTab(undefined, 'Заявки', 'все');///$c.tabs[0]
    
    var tr;
    if(ask['транспорт/id'] && (tr = $c['$наш транспорт'][ask['транспорт/id']]) ) {
      tr['занят'] = 1;
      tr['заявка'] = ask;
    }
    
    $timeout(function(){
      var tr = $('#'+ask.id); 
      if(!Util.isElementInViewport(tr)) $('html,body').animate({scrollTop: tr.offset().top}, 1500);
      
    }, 100);
    
    
  });
  
  $c.LoadData = function(append){//param

    if (!$c.data) $c.data=[];
    if (append === undefined) $c.data.length = 0;
    $c.param.offset=$c.data.length;
    //~ $c.param.tab = $c.tab ? $c.tabs.indexOf($c.tab) : undefined;
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = true;
    
    return $http.post(appRoutes.url_for('транспорт/список заявок'), $c.param /***, {"timeout": $c.cancelerHttp.promise}***/) 
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        $c.cancelerHttp = undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else if (angular.isArray(resp.data)) {
          //~ if (key == 'с объекта/id' && r[key]) {
          //~ r['$с объекта'] = $c['объекты'][r[key]];
          //~ map[r['транспорт/заявка/id']]['$с объекта'] = r['$с объекта'];
        //~ }
        //~ if (key == 'на объект/id' && r[key]) {
          //~ r['$на объект'] = $c['объекты'][r[key]];
          //~ map[r['транспорт/заявка/id']]['$на объект'] = r['$на объект'];
        //~ }
          Array.prototype.push.apply($c.data, resp.data);
          $c.lastDataChunkLen =  resp.data.length;
          $c.LoadDataTMC(resp.data);
        }
      });
    
  };
  $c.LoadDataTMC = function(data, param){//дозагрузка данных позиций ТМЦ для списка заявок
    var tmc=[];//*сбор заявок с тмц
    $c.data_ = data.reduce(function(result, item, index, array) {
      if(!result[item.id]) result[item.id] = item;
      $c.JoinKA(item);
      if (item['снабженец'] || !item['@позиции тмц']) tmc.push(item.id);
      return result;
    }, $c.data_ || {});
  
    if(tmc.length === 0) return;//нет заявок снабжения
    param = param || angular.copy($c.param);
    if (!param.hasOwnProperty('позиции тмц')) param['позиции тмц'] = true;//переключатель запроса на снаб/тмц позиции
    param['транспорт/заявки/id'] = tmc;
    return $http.post(appRoutes.url_for('транспорт/список заявок'), param).then(function(resp){
      resp.data.map(function(r){
        var row = $c.data_[r.id || r["транспорт/заявка/id"]];
        Object.keys(r).map(function(key){
          row[key] = r[key];
        });
        //~ $c.InitRow(row);///
      });
    });
  };
  
  $c.JoinKA = function(item){/// по идам подтянуть контрагентов
    var ka = $Контрагенты.$Data();
    if (!item['@контрагенты'] && item['@контрагенты/id']) item['@контрагенты'] = item['@контрагенты/id'].map(function(kid){ return kid ? ka[kid] : undefined; });
    if (!item['@заказчики'] && item['@заказчики/id']) item['@заказчики'] = item['@заказчики/id'].map(function(kid){ return kid ? ka[kid] : undefined; });
    if (!item['@грузоотправители'] && item['@грузоотправители/id']) item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return kid ? ka[kid] : undefined; });
    if (!item['$перевозчик'] && item['перевозчик/id']) item['$перевозчик'] = ka[item['перевозчик/id']];
    if (!item['$посредник'] && item['посредник/id']) item['$посредник'] = ka[item['посредник/id']];
    
  };
  
  $c.LoadTransport = function(refresh){///наш транспорт
    return TransportAskData['наш транспорт'](refresh).then(function(resp){
      $c['@наш транспорт']  = resp.data;
      var load_ask =[];
      $c['$наш транспорт'] = resp.data.reduce(function(result, item, index, array) { 
        item['заявка'] = $c.data_[item['транспорт/заявка/id']] = $c.data_[item['транспорт/заявка/id']] || item['транспорт/заявка/id'] && load_ask.push({id: item['транспорт/заявка/id']}) && load_ask[load_ask.length-1];
        item.$категория = $c['$категории транспорта'][item['категория/id']];
        item['категории'] = item.$категория.parents_title.slice();
        item['категории'].push(item.$категория.title);
        item['категории/id'] = item.$категория.parents_id.slice();
        item['категории/id'].push(item.$категория.id);
        result[item.id] = item;
        return result;
      }, {});
      
      if (load_ask.length) $c.LoadDataTMC(load_ask, {'позиции тмц': 0}).then(function(){
        load_ask.map(function(r){
          //~ $c.InitRow($c.data_[r.id]);///
        })
        
      });
  
    });
    
  };
  
  $c.IsTransportTab = function(){///( $c.tab.title == 'Свободный транспорт' || $c.tab.title == 'Транспорт' ||  $c.tab.title == 'Транспорт в работе' || $c.tab.title == 'Транспорт в моих заявках')
    return $c.tabs.slice(-1)[0].childs.some(function(tab){
      return tab === $c.tab;
      
    });
    
  };
  
  $c.InitTransport = function(tr){
    if (tr['заявка'])  $c.InitRow(tr['заявка']);
    
  };
  /*
  
  $c.TabClassSup = function(t) {
    var cls = '';
    if (t.classSup) cls += t.classSup;
    return cls;
    
  };
  $c.SelectTab = function(t, init){
    $c.tab = undefined;
    $timeout(function(){
      $c.tab = t;
    });
    //~ if (init) $timeout(function(){ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',}); });
  };*/
  
  $c.OrderByTab1 = function(tab, idx){
    if (!$c.tab) return idx;
    if (tab.childs.some(function(t2){ return t2 === $c.tab; })) return idx;
    else return 1000;
  };
  
  $c.SelectTab = function(tab, n1, n2){
    if (!tab) tab = $c.tabs.map(function(t1){ return t1.title == n1 && t1.childs.filter(function(t2){ t2._parent=t1; return t2.title == n2;}).pop(); }).filter(function(t){ return !!t; }).pop();
    
    //~ var show = $('.show-on-ready', $element[0]);
    //~ show.slideUp();
    $c.tab = undefined;
    $timeout(function(){
      $c.tab = tab;
      //~ $timeout(function(){ show.slideDown(); });
    });
    
  };
  $c.TabLiClass = function(tab) {
    var c = tab.liClass || '';
    if(tab === $c.tab) c += ' active';
    return c;
  }
  $c.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $c.tab) c += ' active bold '+(tab.aClassActive || '');
    return c;
  }
  
  $c.InitAskTable  = function(){
    $timeout(function(){
      //~ Util.ScrollTable($('table.ask', $element[0]));
      //~ $('table.ask', $element[0]).scrollTableBody();
    });
    
    
  };
  
  $c.FilterData = function(item){
    //~ console.log("FilterData");
    if(item._hide) return false;
    var tab = this || $c.tab;
    if(!tab) return false;
    if (tab.filter) return tab.filter(item, tab)
      && ($c.param['переключатели']['заказчик'] === undefined || !item['@заказчики'] || item['@заказчики'].some(function(z){ return !z['проект/id'] === !$c.param['переключатели']['заказчик']; }))
      && ($c.param['переключатели']['перевозчик'] === undefined || item['$перевозчик'] && !item['$перевозчик']['проект/id'] === !$c.param['переключатели']['перевозчик'])
      ;
    return false;
  };
  
  $c.InitRow = function(r){
    //~ if(r._initRow) return;
    if (r['с объекта/id'] && !['$с объекта'])  r['$с объекта'] = $c['объекты'][r['с объекта/id']];
    if (r['на объект/id'] && !r['$на объект'])  r['$на объект'] = $c['объекты'][r['на объект/id']];
    //~ if(r["тмц/снаб/id"]) r["коммент"] = "\n"
    //~ if () r['заказчики'] = r['$заказчики'];//.map(function(z){ return JSON.parse(z); });
    //~ console.log("InitRow", r['заказчики']);
    //~ if (!r.addr1) 
    r.addr1= r['$откуда'] || JSON.parse('[[]]');
    //~ if (!r.addr2) 
    r.addr2= r['$куда'] || JSON.parse('[[]]');
    if(r['категория/id']) r['категория'] = $c['$категории транспорта'][r['категория/id']];
    $c.JoinKA(r);
    //~ r._initRow = true;
  };
  
  $c.Edit = function(it){// клик на строке
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    //~ $c.param.id = it.id;
    //~ delete $c.param.newX;
    //~ $c.param.edit = it;
    $rootScope.$broadcast('Редактировать заявку на транспорт', it);
    //~ $c.param.edit._init=true;
    //~ $timeout(function(){$c.param.form= true;});
    
  };
  
  $c.Delete = function(it){
    //~ var it = $c.param.delete;
    //~ delete $c.param.delete;
    var idx = $c.data.indexOf(it);
    $c.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $c.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $c.param.newX;
    //~ delete $c.param.newX;
    //~ delete n._append;
    //~ n._new = true;
    //~ if (!$c.data.length) return $window.location.reload();
    $c.data.unshift(it);
    //~ $timeout(function(){
    //~ $c['обновить'] = true;
    //~ $c.ready = false;
    
  };

  
  $c.Cancel = function(name){
    if(!$c.param.table[name].ready) return;
    $c.param.table[name].ready = 0;
    $c.ready = false;
    $c.LoadData().then(function(){ $c.ready = true; });//$c.param.table
  };
  
  $c.Send = function(name){
    console.log("Send", $c.param.table, name);
    if(!$c.param.table[name]) return;
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($c.modal_trigger.attr('data-abs'));
      //~ $c.param.table['сумма'].sign = abs;
    //~ }
    $c.param.table[name].ready = 1;
    $c.ready = false;
    $c.LoadData().then(function(){ $c.ready = true; });//$c.param.table
    $c.SelectTab(undefined, 'Заявки', 'все');// на все$c.tabs[0]
  };
  
  $c.ObjectOrAddress = function(item){ //преобразовать объект или оставить адрес
    var id = (/^#(\d+)$/.exec(item) || [])[1];
    if (!id) return {name: item};
    var ob = $c['объекты'][id];//.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $c.FreeTransportOrderBy = function(tr) {
    //~ console.log(" FreeTransportOrderBy ", tr);
    return tr.title;
    
  };
  
  /**$c.OrderByCat  = function(cat){
    console.log(arguments);
    return 
    //~ return 1;
    
  };*/
};


/*=============================================================*/

module

.component('transportAskTable', {
  controllerAs: '$c',
  templateUrl: "transport/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());