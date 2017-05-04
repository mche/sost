(function () {
'use strict';
/*
  Режим выезда по адресам
  для формы транспорта и для формы поиска/заявки на транспорт
  */
var moduleName = "AddressType";

  //~ --- копи-пастуй SELECT array_to_json(array_agg(t)) FROM (select * from "типы адреса"() order by idx) t;
var data = [{"text":"Местные перевозки/услуги (для городов и районов)","idx":1},{"text":"Междугородные перевозки","idx":2},{"text":"Заграничные перевозки","idx":3}];

//~ var http_then_cb = function(resp) {
    //~ delete $ctrl._cancelerHttp;
    //~ console.log(resp.data.status);
  //~ };

var Component = function ($scope, $attrs, $http, $q, $timeout, appRoutes) {
  var $ctrl = this;
  $ctrl.$attrs = $attrs;
  $ctrl.appRoutes = appRoutes;
  
  //~ $scope.category = $ctrl.category;
  //~ console.log('AddressType', $ctrl.addrType );
  
  var http_then_cb = function(resp) {
    delete $ctrl.cancelerHttp;
    $scope.data = resp.data || resp;
    $ctrl.ready = true;
    $timeout(function() {$ctrl.setCount($scope.data[$ctrl.data.addr_type - 1]);});
    //~ Array.prototype.push.apply($ctrl.addrType, resp.data);
  };
  
  
  $ctrl.Init = function () {
    if ($ctrl.category && $ctrl.category.id) {
  
    var query = {c: $ctrl.category.id};
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    var config = {params: $ctrl.data.transport ? null : query, timeout: $ctrl.cancelerHttp.promise};
    $http.get(appRoutes.url_for('количество адресных типов'), config) //$attrs.addressTypeUrl,
      .then(http_then_cb);
    //~ $scope.data = [];
    //~ $ctrl.addrType.length = 0;
      
    } else {
      http_then_cb(data);
      //~ $scope.data = data;
      //~ $ctrl.ready;
      //~ Array.prototype.push.apply($ctrl.addrType, data);
    }
    
  };
  

  
  $ctrl.setCount = function (item) {
    if (!item) return;
    //~ console.log(item);
    //~ $ctrl.data._addr_type_count = item.cnt;
    if ($ctrl.countCallback) $ctrl.countCallback(item.cnt);
  };
  
   
};

angular.module(moduleName, ['AppTplCache', 'appRoutes', 'load.templateCache'])

//~ .controller('Controll'+moduleName, Controll)

.component('addressType', {
  templateUrl: "address/type",
  bindings: {
      //~ addrType: '<', // данные для крыжиков
      //~ count: '<',
      input: '<',// radio | checkbox
      data: '<', // для ng-model! строка транспорта или заявки
      category: '<', // ид категории для изменения количеств
    countCallback: '<'

  },
  controller: Component
})

;

}());