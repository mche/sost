(function () {
'use strict';

var moduleName = "TransportStatus";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'load.templateCache']);


var Component = function ($scope, $attrs, $http, $q, $timeout, appRoutes) {
  var $ctrl = this;
  $ctrl.$attrs = $attrs;
  $ctrl.appRoutes = appRoutes;
  
  var http_then_cb = function(resp) {
    delete $ctrl.cancelerHttp;
    //~ console.log(resp.data.status+resp.data.disabled);
    if (resp.data.hasOwnProperty('disabled')) $ctrl.data.disabled = resp.data.disabled;
    //~ it.status = resp.data.status;
  };
  
  $ctrl.Save = function () {// сохранение
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    $http.get(appRoutes.url_for('статус транспорта', $ctrl.data.id), {timeout: $ctrl.cancelerHttp.promise})//$attrs.statusUrl
      .then(http_then_cb);
  };
  
  $ctrl.SaveDisabled = function () {
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    $http.get(appRoutes.url_for('отключение транспорта', $ctrl.data.id), {timeout: $ctrl.cancelerHttp.promise})//$attrs.statusUrl
      .then(http_then_cb);
  };
   
};

module

//~ .controller('Controll'+moduleName, Controll)

.component('transportStatus', {
  templateUrl: "transport/status",
  bindings: {
    data: '<',
    changeDisabled: '<'

  },
  controller: Component
})

;

}());
