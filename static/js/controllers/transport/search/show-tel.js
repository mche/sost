(function () {
'use strict';
/*
*/
  
var moduleName = 'TransportShowTel';


try {
  if (angular.module(moduleName)) return;
} catch(err) { /* failed to require */ }


var Controll = function ($scope, $window, $http, loadTemplateCache, $q, $sce, $timeout, States, appRoutes) {//
  var $ctrl = this;
  //~ $ctrl.$attrs = $attrs;
  $scope.States = States;
  
  $ctrl.Init = function() {
    
    $timeout(function(){
      
      
      if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
      $ctrl.cancelerHttp = $q.defer();
      
      //~ var data = {"object":$ctrl.data.id, "tel_idx": $ctrl.data.tel_idx+1};
      //~ $attrs.showTelUrl
      $http.post(appRoutes.url_for('телефон транспорта'), $ctrl.transport.showTel, {timeout: $ctrl.cancelerHttp.promise})//headers: {"X-AngularJS": angular.version.full}, 
        .then(function(resp) {
          delete $ctrl.cancelerHttp;
          //~ if (resp.data.error) {$ctrl.data.error = $sce.trustAsHtml(resp.data.error); delete resp.data.error;}
          angular.forEach(resp.data, function(val, key) {$ctrl.transport.showTel[key] = val;});
          //~ $scope.showTel = resp.data;
          $ctrl.transport.showTel._ready = true;
          $timeout(function(){$('#show-tel-modal a:visible:first').focus();});
        
        //~ if ($ctrl.mobile && $ctrl.showTel.tel) $window.location.href = "tel:+7"+$ctrl.showTel.tel;
        
        //~ $timeout(function(){
          //~ var link = $('#show-tel-modal a.tel');
          //~ link.trigger("click");
          //~ console.log(link);
          //~ angular.element(link).triggerHandler('click');
        //~ });
          $ctrl.param = $ctrl.param || {};
          $scope.transport = $ctrl.transport;
          $ctrl.ready = true;
        });
      
    });
  };
  
  /*
  $ctrl.showTelResults = States.data.filter(function(item, idx){ return !!item["ид кнопки"]; });
  $ctrl.telResultsSort = function(item) {
    return item["ид кнопки"];
  };//ng-repeat
  */
  
  $ctrl.ShowTelResult = function(result) {
    if (!result ) return $ctrl.onCloseCallback && $ctrl.onCloseCallback();
    
    var curr = $ctrl.transport.showTel;
    if ( result.id == 60 ) {// тут был коллапс рекурсивного TypeError: cyclic object value
      //~ curr = {"ask": $ctrl.ask};// принятая заявка должна сохраниться
      //~ angular.forEach($ctrl.ask.showTel, function(val, key){ curr[key] = val; });
      curr.ask = $ctrl.ask;
    }
    curr.result = result.id;
    delete curr._ready;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
     //~ console.log("Сохранить результат телефона", curr);
    
    //, {headers: {"X-AngularJS": angular.version.full}
   
    $http.post(appRoutes.url_for('телефон транспорта'), curr, {timeout: $ctrl.cancelerHttp.promise})//$attrs.showTelUrl
      .then(function(resp) {
        delete $ctrl.cancelerHttp;
        //~ if(resp.data.location) {
        curr._ready = true;
        
        if (resp.data['показы этого телефона']) curr['показы этого телефона'] = resp.data['показы этого телефона'];
        if ($ctrl.onCloseCallback) return $ctrl.onCloseCallback(resp.data);
          //~ $window.location.href = resp.data.location;
        //~ } else {}
        //~ $('#show-tel-modal').modal('close');
      });
    
    
  };
  
  $ctrl.Login = function () {
    if ($ctrl.onLoginCallback) return $ctrl.onLoginCallback();
    $window.location.href = appRoutes.url_for('profile');
  };
  
  $ctrl.HrefTel = function () {
    if ($ctrl.param.mobile) return 'tel: +7' + $ctrl.tranport.showTel.tel;
    return '';
  };
  
};

angular.module(moduleName, ['ngSanitize', 'States', 'appRoutes', 'tel-show-list']
//~ function ($compileProvider) {
  //~ $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
//~ }
)//

.component("transportShowTel", {
  templateUrl: "transport/search/show-tel",
  bindings: {
    transport: '<',
    ask: '<',
    param: '<', //mobileлогич true для мобил прилож
    //~ getAskDataCallback: '<',//получить заявку для привязки к положительному звонку
    onCloseCallback: '<',
    onLoginCallback: '<'
  },
  controller: Controll
})
;

}());