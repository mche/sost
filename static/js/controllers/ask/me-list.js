(function () {'use strict'; try {

var moduleName = "AskMeList";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }

var module = angular.module(moduleName, ['appRoutes', 'AppTplCache', 'load.templateCache', 'AskShowTel', 'States', 'AskItem']);//, 'RatingStars'

var Controll = function  ($scope, $attrs, appRoutes, loadTemplateCache) {
  var ctrl = this;
  
  $scope.param = {"header": true, "status": $attrs.tabStatus || 60};
  
  loadTemplateCache.split(appRoutes.url_for('assets', 'ask/me-list.html'), 1)
  .then(function(proms){
    ctrl.ready = true;
  });
  
};

var Component = function  ($scope, $http, $q, $timeout, $window, appRoutes, States) {//, AskMeListLib
  var $ctrl = this;
  //~ $ctrl.param.status = $attrs.tabStatus;
  $scope.States = States;
  //~ var lib = new AskMeListLib($ctrl, $scope);
  $scope.data = [];
  
  $ctrl.Init = function(){
    $http.get(appRoutes.url_for('список заявок на мой транспорт')).then(function (resp) {//$attrs.listUrl
      Array.prototype.push.apply($scope.data, resp.data);
      $ctrl.InitTabs($ctrl.param.status);
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
      
      $timeout(function() {
        //~ $('#search-results-show').sideNav({menuWidth: $('body').innerWidth()*5/6, edge: 'left', closeOnClick: false,  draggable: true});
        $('.modal').modal();
      });
    });
    
  };

  $ctrl.InitTabs = function(show_status) {// инициализация табов
    delete $ctrl.tabsReady;
    delete $ctrl.tab;
    delete $ctrl.param.resetTab;
    States.clearCount($ctrl.data);
    States.count($scope.data);
    $ctrl.tabs =  States.data.filter(function(tab){ return tab.id <= 100 && !!tab._cnt; });
    if ( !$ctrl.tabs.length ) return;
    
    var tab = $ctrl.tabs.filter(function (t) { return t.id == show_status; }).shift() ||  $ctrl.tabs[0];
    if ( tab && tab._cnt ) $ctrl.tab = tab;
    else $ctrl.tab = $ctrl.tabs.filter(function (t) {return t._cnt && t._cnt > 0;}).shift();
    if ( !$ctrl.tab ) return;
    
    $timeout(function() {
      $('main ul.tabs').tabs();
      $ctrl.tabsReady = true;
    });
    
  };
  
  $ctrl.FilterAsk = function (item) {//ng-repeat
    var tab = $ctrl.tab;//tabs[$$ctrl.tab - 1];
    if (!tab || !item._states) return false;
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
  
  $ctrl.ShowItem = function (item) {
    if ($ctrl.onShowAskCallback) return $ctrl.onShowAskCallback(item);
    delete $ctrl.currentItem;
    
    //~ if (!item._ready) {
      //~ item._ready = true;
    //~ }
    $('#item-detail-modal').modal('open');
    $timeout(function() {
      $('#item-detail-modal a').first().focus().blur();
      $ctrl.currentItem = item;
    });
  };
  $ctrl.HideItem = function () {
    $('#item-detail-modal').modal('close');
  };
  
  $ctrl.ShowTel = function(ask) {
    //~ var ask = $ctrl.currentItem;
    if (ask.transport) return;// не надо больше показов телефонов при стыкованных с транспортом заявок
    //~ lib.GetShowTel(ask);
    
    delete ask.showTel;
    $timeout(function() {ask.showTel = {};});
    $('#show-tel-modal').modal({dismissible: false}).modal('open'); // Modal can be dismissed by clicking outside of the modal
    
  };
  //~ $ctrl.showTelResults = States.data.filter(function(item, idx){ return !!item["ид кнопки"]; });
  //~ $ctrl.telResultsSort = function(item) {//ng-repeat
    //~ return item["ид кнопки"];
  //~ };
  $ctrl.ShowTelClose = function() {
    $('#show-tel-modal').modal('close');
  };
  
  $ctrl.ShowTelResult = function(resp_data, ask) {
    //~ console.log("ShowTelResult", resp_data);
    //~ var ask = $ctrl.currentItem;
    //~ lib.ShowTelResult(result, ask, $ctrl.ShowTelResultClose);
    if(resp_data.location) {
      $window.location.href = resp_data.location;
      return;
    } //else {ask.showTel.ready = true;}
    
    // по последнему состоянию
    var status = ask['состояния'] && ask['состояния'][ask['состояния'].length-1]['код состояния'];

    $('#show-tel-modal').modal('close');
    //~ var status = $ctrl.ResetStates(ask['состояния']);
    
    // отказ, отклон, принят - закрываем заявку
    if ([30,40, 60].filter(function(val) { return val == status; }).length)
      $timeout(function() {$ctrl.InitTabs(status); $ctrl.HideItem();});
    
  };
  
  $ctrl.ResetStates = function(arr_states) {// из глубин изменения состояния одной из заявок
    var ask  = $ctrl.currentItem;
    //~ console.log("ResetStates", arr_states);
    if (!arr_states) return;
    //~ ask['состояния'].length = 0;
    //~ Array.prototype.push.apply(ask['состояния'], arr_states);
    var status = arr_states[arr_states.length-1]['код состояния'];
    // отказ, отклон, принят - закрываем заявку
    if ([30,40, 60].filter(function(val) { return val == status; }).length) {
      ask.transport =  ask._transport || ask['транспорт?'];
      delete ask._transport;
      delete ask['транспорт?'];
      //~ console.log("ResetStates заявка", ask);
      $ctrl.InitTabs(status);
      $ctrl.HideItem();
    }
    
    
    return status;
    
  };
  
 
};

/*
Разделяемая библиотека для сайта и приложения
*/
/*
var Lib = function($http, $q, $timeout, appRoutes ) {

var methods = {
  _SetAskData: function(data, ask) {
    if (data['состояния'] && data['состояния'].length) {
      if (ask['состояния']) ask['состояния'].length = 0;
      else ask['состояния'] = [];
      Array.prototype.push.apply(ask['состояния'], data['состояния']);
      delete data['состояния'];
    }
    if (data['показы телефонов'] && data['показы телефонов'].length) {
      if (ask['показы телефонов']) ask['показы телефонов'].length = 0;
      else ask['показы телефонов'] = [];
      Array.prototype.push.apply(ask['показы телефонов'], data['показы телефонов']);
      delete resp.data['показы телефонов'];
    }
    if (data.transport) ask.transport = data.transport;
    
  },
  GetShowTel: function($ctrl, $scope, ask, http_then_cb) {
    //~ var ask = $ctrl.currentItem;
    //~ console.log("Показать телефон заявки "+angular.toJson(ask));
    //~ if (ask.transport) return;// не надо больше показов телефонов при стыкованных с транспортом заявок
    
    if (!ask.showTel) ask.showTel = {};

    if (ask.showTel._cancelerHttp) ask.showTel._cancelerHttp.resolve();
    ask.showTel._cancelerHttp = $q.defer();
    
    var data = {"object": ask.id};
    if (ask._transport || ask['транспорт?']) data.transport = ask._transport || ask['транспорт?']; // новая заявка
    return $http.post(appRoutes.url_for('телефон заявки'), data, {timeout: ask.showTel._cancelerHttp.promise}) //headers: {"X-AngularJS": angular.version.full}, 
      .then(function(resp) {
        delete ask.showTel._cancelerHttp;
        methods._SetAskData(resp.data, ask);
        ask.showTel = resp.data;
        //~ console.log("Поучен телефон заявки "+angular.toJson(resp.data));
        ask.showTel.ready = true;
        if (http_then_cb) http_then_cb(resp.data, ask);
        $timeout(function(){$('#show-tel-modal a').focus();});
        
      });
    
    //~ $('#show-tel-modal').modal({dismissible: false}).modal('open'); // Modal can be dismissed by clicking outside of the modal
    
  },
  
  ShowTelResult: function($ctrl, $scope, result, ask, ShowTelResultClose) {
    //~ var ask = $ctrl.currentItem;
    var send = ask.showTel;
    send.result = result.id;
    if (ask.transport || ask['транспорт']) send.transport = ask.transport || ask['транспорт'];
    else if (ask._transport || ask['транспорт?']) send.transport = ask._transport || ask['транспорт?']; // новая заявка
    send.id = ask.id;
    delete send.ready;
    
    if (send._cancelerHttp) send._cancelerHttp.resolve();
    send._cancelerHttp = $q.defer();
    
    //~ if ( send.result == 60 || send.result == 30 || send.result == 40 ) // принятая заявка 
    //, {headers: {"X-AngularJS": angular.version.full}
    return $http.post(appRoutes.url_for('телефон заявки'), send, {timeout: send._cancelerHttp.promise})//$attrs.showTelUrl
      .then(function(resp) {
        delete send._cancelerHttp;
        methods._SetAskData(resp.data, ask);
        if (ShowTelResultClose) return ShowTelResultClose(resp.data, ask);
      });
  }
};
return function($ctrl, $scope) {//constructor
  //~ console.log("SearchTransportLib new instance...");
  var lib = this;
  //~ var scopeDESTROY = function () {
  //~ };
  //~ $scope.$on('$destroy', scopeDESTROY);
  angular.forEach(methods, function(val, key) {
    //~ if(hidden_re.test(key)) return;
    lib[key] = function () {return val($ctrl, $scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);};
    //~ lib[key] = val;
  });
};
};
*/

module

.controller('Controll', Controll)

//~ .factory(moduleName+'Lib', Lib)

.component('askMeList', {
  templateUrl: "ask/me-list",
  bindings: {
    param: '<',
    onShowAskCallback: '<',
    //~ onResetStatesCallback: '',

  },
  controller: Component
})

;

} catch(err){console.log("Ошибка компиляции списка заявок на мой транспорт "+err.stack);}
}());