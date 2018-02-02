(function () {'use strict';
/*
*/

var moduleName = "TransportAskTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',  'ContragentItem', 'TransportAskWork', 'Объект или адрес', 'TransportItem']);//'ngSanitize',, 'dndLists''AppTplCache',

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, $templateCache, appRoutes, Util, TransportAskData, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.JSON = JSON;
  $scope.appRoutes = appRoutes;
  $scope.payType = TransportAskData.payType();
  $scope.$templateCache = $templateCache;
  $ctrl.tabs = [
    {title:"Все", filter: function(tab, item){ return true; }, classLi:'teal lighten-3',},
    {title:"новые", filter: function(tab, item){ return !item['транспорт/id']; }, classLi:'teal lighten-3',},
    {title:"в работе", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, classLi:'teal lighten-3',},
    //~ {title:"В работе*", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"завершенные", filter: function(tab, item){ return !!item['транспорт/id'] && !!item['дата2']; }, classLi:'teal lighten-3',},
    
    {title:"Снабжение", filter: function(tab, item){ return !!item['позиции тмц'] || !!item['позиции']; }, classLi:'light-green lighten-2', },
    {title:"новые", filter: function(tab, item){ return (!!item['позиции тмц'] || !!item['позиции']) &&  !item['транспорт/id']; }, classLi:'light-green lighten-2', },
    {title:"в работе", filter: function(tab, item){ return (!!item['позиции тмц'] || !!item['позиции']) &&  !!item['транспорт/id'] && !item['дата2']; }, classLi:'light-green lighten-2', },
    {title:"заверш.", filter: function(tab, item){ return (!!item['позиции тмц'] || !!item['позиции']) &&  !!item['транспорт/id'] && !!item['дата2']; }, classLi:'light-green lighten-2', },
    
    {title:"Мои", filter: function(tab, item){ return $ctrl.uid == item.uid; }, style000:{'border-left': "2px solid yellow"}, classLi:'yellow darken-1 ',},
    {title:"в работе", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !item['дата2']; }, classLi:'yellow darken-1 ', },
    {title:"заверш.", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !!item['дата2']; }, style000:{'border-right': "2px solid yellow"}, classLi:'yellow darken-1',},
    
    // отдельной кнопкой, не таб
    {title: 'Свободный транспорт', cnt: function(){ return $ctrl.dataTransport.length; }, classLi:'hide',},
  
  ];
    
  /*$scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.append) {
      $ctrl.Append(newVal.append);
      delete newVal.append;
      return;
    }
    if (newVal.remove) {
      $ctrl.Delete(newVal.remove);
      delete newVal.remove;
      return;
    }
  }, true);*/
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table = {"дата1":{"values":[]}, "дата2":{"values":[]}, "дата3":{"values":[]}, "перевозчик":{}, "заказчик":{}, "транспорт":{}, "откуда":{}, "куда":{}, "груз":{}, "коммент":{}, "номер":{}, "ts":{"values":[]}, "сумма":{"values":[]},};// фильтры
      $scope.param = $ctrl.param;
      
      var async = [];
      
      async.push(TransportAskData['свободный транспорт']().then(function(resp){
        $ctrl.dataTransport  = resp.data;
      }));
      
      async.push(ObjectAddrData.Objects().then(function(resp){
        $ctrl.dataObjects  = resp.data;
        
      }));

      async.push($ctrl.LoadData());//.then()
      
      $q.all(async).then(function(){
        
        $ctrl.ready = true;
        
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
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    $ctrl.param.tab = $ctrl.tab ? $ctrl.tabs.indexOf($ctrl.tab) : undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('транспорт/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($ctrl.data, resp.data);
          $ctrl.lastDataChunkLen =  resp.data.length;
        }
      });
    
  };
  /*$ctrl.OrderByData = function(it){// для необработанной таблицы
    if ($ctrl.tab === $ctrl.tabs[3]) return it["дата1"]+'-'+it.id;//для обратного порядка завершенных заявок
    var s = dateFns.differenceInDays(dateFns.addDays(new Date(), 365),  it["дата1"])+'-'+1/it.id;
    console.log("OrderByData", it, s );
    return s;
  };*/
  
  /*$ctrl.TabClassA = function(t) {
    var cls = '';
    if ( t === $ctrl.tab) cls += 'active fw500 '+(t.classActive || ' ');
    if (t.classA) cls += t.classA;
    return cls;
    
  };*/
  $ctrl.TabClassSup = function(t) {
    var cls = '';
    if (t.classSup) cls += t.classSup;
    return cls;
    
  };
  $ctrl.SelectTab = function(t, init){
    $ctrl.tab = t;
    if (init) $timeout(function(){ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',}); });
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
    //~ if(r["тмц/снаб/id"]) r["коммент"] = "\n"
    r['заказчики'] = r['заказчики/json'].map(function(z){ return JSON.parse(z); });
    //~ console.log("InitRow", r['заказчики']);
    r.addr1= JSON.parse(r['откуда'] || '[[]]');
    r.addr2= JSON.parse(r['куда'] || '[[]]');
    r['@дата1'] = JSON.parse(r['@дата1']);
    r['@дата2'] = JSON.parse(r['@дата2']);
    r['@дата3'] = JSON.parse(r['@дата3']);
    if((r['позиции'] && angular.isString(r['позиции'][0])) || (r['позиции тмц'] && angular.isString(r['позиции тмц'][0])))
        r['позиции тмц'] = r['позиции'] = ((!!r['позиции'] && angular.isString(r['позиции'][0]) && r['позиции']) || (!!r['позиции тмц'] && angular.isString(r['позиции тмц'][0]) && r['позиции тмц'])).map(function(row){ return JSON.parse(row); });
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
    var ob = $ctrl.dataObjects.filter(function(it){ return it.id == id; }).pop();
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