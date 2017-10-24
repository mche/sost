(function () {'use strict';
/*
*/

var moduleName = "TransportAskTable";

var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',  'ContragentItem', 'TransportAskWork', 'Объект или адрес']);//'ngSanitize',, 'dndLists''AppTplCache',

var Component = function  ($scope, $q, $timeout, $http, $element, $templateCache, appRoutes, Util, TransportAskData, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.JSON = JSON;
  $scope.appRoutes = appRoutes;
  $scope.payType = TransportAskData.payType();
  $scope.$templateCache = $templateCache;
  $ctrl.tabs = [
    {title:"Все", filter: function(tab, item){ return true; }, },
    
    {title:"Новые", filter: function(tab, item){ return !item['транспорт/id']; }, },
    {title:"В работе", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"В работе*", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"Завершенные", filter: function(tab, item){ return !!item['транспорт/id'] && !!item['дата2']; }, },
    
    {title:"Мои", filter: function(tab, item){ return $ctrl.uid == item.uid; }, },
    {title:"Мои в работе", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !item['дата2']; }, },
    {title:"Мои заверш.", filter: function(tab, item){ return $ctrl.uid == item.uid && !!item['транспорт/id'] && !!item['дата2']; }, },
    
    {title: 'Свободный транспорт', cnt: function(){ return $ctrl.dataTransport.length; }},
  
  ];
  $scope.$watch('param', function(newVal, oldVal){
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
  }, true);
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "дата2":{"values":[]}, "перевозчик":{}, "заказчик":{}};// фильтры
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
          
          //~ $ctrl['ссылка контроля заявок'] = $('header ul.menu-nav li a[data-url-for="контроль заявок"]');
          $ctrl.uid = $('head meta[name="app:uid"]').attr('content');
          
          $timeout(function(){
            var t = [1, 6,  0]; // новые или в работе или мои
            for (var i = 0; i < t.length; i++) {
              var tab = $ctrl.tabs[t[i]];
              if($ctrl.data.filter($ctrl.FilterData, tab).length)  return $ctrl.SelectTab(tab);
            }
            $ctrl.SelectTab($ctrl.tabs[$ctrl.tabs.length-1]);
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
  
  $ctrl.SelectTab = function(t){
    $ctrl.tab = t;
  };
  
  $ctrl.FilterData = function(item){
    //~ console.log("FilterData", this);
    var tab = this || $ctrl.tab;
    if (tab.filter) return tab.filter(tab, item);
    //~ if (tab === $ctrl.tabs[0]) return true;
    //~ if (tab === $ctrl.tabs[1]) return $ctrl.uid == item.uid;
    //~ if (tab === $ctrl.tabs[2] && !item['транспорт/id']) return true;
    //~ if (tab === $ctrl.tabs[3] && !!item['транспорт/id'] && !item['дата2']) return true;
    //~ if (tab === $ctrl.tabs[4] && !!item['транспорт/id'] && !!item['дата2']) return true;
    return false;
  };
  
  $ctrl.InitRow = function(it){
    //~ if(it["тмц/снаб/id"]) it["коммент"] = "\n"
    it.addr1= JSON.parse(it['откуда'] || '[[]]');
    it.addr2= JSON.parse(it['куда'] || '[[]]');
    
  };

  //~ $ctrl.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $ctrl.Edit = function(it){// клик на строке
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    //~ $ctrl.param.id = it.id;
    //~ delete $ctrl.param.newX;
    $ctrl.param.edit = it;
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
    $ctrl.LoadData();//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.table['сумма'].sign = abs;
    //~ }
    $ctrl.param.table[name].ready = 1;
    $ctrl.LoadData();//$ctrl.param.table
    
  };
  
  $ctrl.ObjectOrAddress = function(item){ //преобразовать объект или оставить адрес
    var id = (/^#(\d+)$/.exec(item) || [])[1];
    if (!id) return {name: item};
    var ob = $ctrl.dataObjects.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^★/.test(ob.name)) ob.name = '★'+ob.name;
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