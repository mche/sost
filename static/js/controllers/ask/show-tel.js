/*jshint scripturl:true*/
(function () {
'use strict';
/*

*/
  
var moduleName = "AskShowTel";

var Controll = function ($scope, $http, $q, $timeout, appRoutes) {
  var $ctrl = this; 
  
  $ctrl.Init = function() {
    $timeout(function() {
      $ctrl.param = $ctrl.param || {};
      $ctrl.ShowTel();
    });
    
  };
  
  $ctrl.ShowTel = function() {
    var ask = $ctrl.ask;
    if (!ask.showTel) ask.showTel = {};
    ask.showTel.ready = false;

    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    var data = {"object": ask.id};
    if (ask._transport || ask['транспорт?']) data.transport = ask._transport || ask['транспорт?']; // новая заявка
    return $http.post(appRoutes.url_for('телефон заявки'), data, {timeout: $ctrl.cancelerHttp.promise}) //headers: {"X-AngularJS": angular.version.full}, 
      .then(function(resp) {
        delete $ctrl.cancelerHttp;
        $ctrl.SetTelData(resp.data);
        angular.forEach(resp.data, function(val, key){ask.showTel[key] = val;});
        //~ console.log("Поучен телефон заявки "+angular.toJson(resp.data));
        //~ ask.showTel.ready = true;
        $ctrl.ready = true;
        //~ if (http_then_cb) http_then_cb(resp.data, ask);
        $timeout(function(){$('#show-tel-modal a').focus();});
        
      });
    
  };
  
  $ctrl.SetTelData = function(data, ask) {
    ask = ask || $ctrl.ask;
    if (data['состояния'] && data['состояния'].length) {
      if (ask['состояния']) ask['состояния'].length = 0;
      else ask['состояния'] = [];
      Array.prototype.push.apply(ask['состояния'], data['состояния']);
      //~ delete data['состояния'];
    }
    if (data['показы телефонов'] && data['показы телефонов'].length) {
      if (ask['показы телефонов']) ask['показы телефонов'].length = 0;
      else ask['показы телефонов'] = [];
      Array.prototype.push.apply(ask['показы телефонов'], data['показы телефонов']);
      //~ delete data['показы телефонов'];
    }
    if (data.transport) ask.transport = data.transport;
    
  };
  
  $ctrl.ShowTelResult = function(result) {
    //~ console.log("Результат показа тел", result);
    var ask = $ctrl.ask;
    var send = ask.showTel;
    send.result = result.id;
    if (ask.transport || ask['транспорт']) send.transport = ask.transport || ask['транспорт'];
    else if (ask._transport || ask['транспорт?']) send.transport = ask._transport || ask['транспорт?']; // новая заявка
    send.object = ask.id;
    if (send['показы телефонов']) send['показы телефонов'].length = 0;
    //~ delete send.ready;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    //~ if ( send.result == 60 || send.result == 30 || send.result == 40 ) // принятая заявка 
    //, {headers: {"X-AngularJS": angular.version.full}
    return $http.post(appRoutes.url_for('телефон заявки'), send, {timeout: $ctrl.cancelerHttp.promise})//$attrs.showTelUrl
      .then(function(resp) {
        delete $ctrl.cancelerHttp;
        $ctrl.SetTelData(resp.data);
        if ($ctrl.onShowTelResult) return $ctrl.onShowTelResult(resp.data, ask);
      });
  };
  
  
  $ctrl.HrefTel = function () {
    if ($ctrl.param.mobile) return 'tel: +7' + $ctrl.ask.showTel.tel;
    return 'javascript:';
  };
  
  //~ $ctrl.ShowTelResult = function (result) {
    //~ if($ctrl.onShowTelResult) return $ctrl.onShowTelResult(result, $ctrl.ask);
  //~ };
  
};


angular.module(moduleName, ['appRoutes', 'tel-show-list', 'phone.input', 'States'], function ($compileProvider) {

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|tel):/);

})

.component('askShowTel', {
  templateUrl: "ask/show-tel",
  bindings: {
    ask:'<',
    param: '<',
    onShowTelClose: '<',
    onShowTelResult: '<',

  },
  controller: Controll
})
;

}());