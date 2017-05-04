(function () {'use strict'; try {

var moduleName = "AskList";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }

var module = angular.module(moduleName, ['appRoutes', 'AppTplCache', 'load.templateCache', 'phone.input', 'States', 'User', 'TransportItemDetail']);

var Controll = function  ($scope, $attrs, appRoutes, loadTemplateCache) {
  var ctrl = this;
  ctrl.$attrs = $attrs;
  
  $scope.listParam = {"header": true, "transportModal": true, "status": $attrs.status || 60};
  
  loadTemplateCache.split(appRoutes.url_for('assets', 'ask/list.html'), 1)
    .then(function(proms){
      ctrl.ready = true;
    });
};
  
var Component = function  ($scope, $attrs, $http, $q, $timeout, $window, appRoutes, States, User, AskListLib) {
  var $ctrl = this;
  //~ $ctrl.param.status = $attrs.tabStatus || $attrs.status;
  $scope.States = States;
  var lib = new AskListLib($ctrl, $scope);
  $scope.data=[];
  
  $ctrl.Init = function(){
    
    delete $ctrl.ready;// думал вдруг переинит делать
    
    $ctrl.param = $ctrl.param || {"status": 60};
  
    $http.get(appRoutes.url_for('список моих заявок')).then(function (resp) {//$attrs.listUrl
      Array.prototype.push.apply($scope.data, resp.data);
      $ctrl.param = $ctrl.param || {};
      try {$ctrl.InitTabs($ctrl.param.status || 60);}
      catch (err) { console.log(err.trace); }
     
      $ctrl.ready = true;
      
      if ($ctrl.param.transportModal) $timeout(function() {
        $('.modal').modal();
      });
    });
    
  };
  
  $ctrl.InitTabs = function(status) {// инициализация табов
    delete $ctrl.param.resetTab;
    delete $ctrl.tabsReady;
    delete $ctrl.tab;
    States.clearCount($scope.data);
    States.count($scope.data);
    $ctrl.tabs =  States.data.filter(function(tab){ return tab.id <= 100 && !!tab._cnt; });
    var tab = $ctrl.tabs.filter(function (t) { return t.id == status || (status >=100 && t.id == 100); }).shift() ||  $ctrl.tabs[0];
    if ( tab && tab._cnt ) $ctrl.tab = tab;
    else $ctrl.tab = $ctrl.tabs.filter(function (t) { return t._cnt && t._cnt > 0; }).shift();
    if ( !$ctrl.tab ) return;
   
    $timeout(function() {
      $('main ul.tabs').tabs();
      $ctrl.tabsReady = true;
    });
    
  };
  
  $ctrl.FilterAsk = function (item) {//ng-repeat
    //~ return ask['статус'] == $ctrl.param.status;
    var tab = $ctrl.tab;//tabs[$$ctrl.tab - 1];
    if (!tab) return false;
    if (!tab._re) tab._re = new RegExp(tab["состояние"],"i");
    return tab._re.test(item._states);//, tab.title
  };
  
  //~ $ctrl.FilterTab = function(tab, idx) {//ng-repeat
    //~ return !!tab._cnt;
  //~ };
  
  $ctrl.ShowTab = function (tab, check) {// установка и проверка
    if (check) return tab === $ctrl.tab;
    $ctrl.tab = tab;
  };
  
  $ctrl.ImgSrc = function(it) {
    return appRoutes.url_for('картинка категории', it.img_url);
  };

  $ctrl.ShowTransport = function (ask) {// показать транспорт, но на входе заявка
    //~ $timeout(function() {
    if ($ctrl.onShowTransport) return $ctrl.onShowTransport(ask);
      
      $scope.transportItem = lib.ShowTransport(ask);
      //~ console.log("Показать транспорт ", $scope.transportItem);
      $('#item-detail-modal').modal('open');
      $timeout(function() {$('#item-detail-modal a[ng-click]').first().focus().blur();});
    //~ });

  };
  $ctrl.HideItem = function () {
    $('#item-detail-modal').modal('close');
  };
  $ctrl.OpenAsk = function (it) {
    if ($ctrl.onOpenAsk) return $ctrl.onOpenAsk(it);
    $window.location.href = appRoutes.url_for('форма заявки', it.id);
    
  };
  
};

/*
Разделяемая библиотека для сайта и приложения
*/
var Lib = function($http, $q, $timeout, appRoutes ) {

var methods = {
  _http_then_cb: function($ctrl, $scope, transport) {return function(resp){// self lib method return function!
    delete $ctrl.cancelerHttp;
    if (resp.data.err) {$ctrl.err= resp.data.err; return;}
    for (var name in resp.data) {
      transport[name] = resp.data[name];
    }
    transport._ready = true;
    
  };},
  ShowTransport: function ($ctrl, $scope, ask) {// показать транспорт, но на входе заявка
    ask['транспорт'] = ask['транспорт'] || {id: ask.transport, ask: ask.id}; 
    
    if (!ask['транспорт']._ready) {
      if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
      $ctrl.cancelerHttp = $q.defer();
      $http.get(appRoutes.url_for('показ транспорта для заявки', [ask['транспорт'].id, ask.id]), {timeout: $ctrl.cancelerHttp.promise}) //$attrs.transportUrl+
        .then(methods._http_then_cb($ctrl, $scope, ask['транспорт']));
    }
    return ask['транспорт'];
    
  },
};


  return function($ctrl, $scope) {//constructor
    var lib = this;
    angular.forEach(methods, function(val, key) {
      //~ if(hidden_re.test(key)) return;
      lib[key] = function () {return val($ctrl, $scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);};
      //~ lib[key] = val;
    });
  };
};

module

.controller('Controll', Controll)

.factory(moduleName+'Lib', Lib)

.component('askList', {
  templateUrl: "ask/list",
  bindings: {
      //~ data: '<',
    param: '<',
    onOpenAsk: '<', // 
    onShowTransport: '<',
      //~ tabs: '<',
      //~ status: '<'// фильтрация табов

  },
  controller: Component
})

;

} catch(err){console.log("Ошибка компиляции списка моих заявок "+err.stack);}
}());