(function () {
'use strict';
/*
Набор для формы транспорта
*/

var moduleName = "formTransport";

var templateCache = ["/assets/transport/form.html"];


var Controll = function  ($scope, $attrs, $http, $window, $timeout, loadTemplateCache, $q, appRoutes) {
  //~ console.log("formTransportControll starting", $attrs);
  var ctrl = this;
  ctrl.$attrs = $attrs;
  ctrl.appRoutes = appRoutes;
  //~ ctrl.allow = {};// разные разрешительные флажки
  ctrl.category = {"selectedIdx": [], "finalCategory": null};//, "current": null
  //~ console.log($window.location.href);
  ctrl.transportCnt = ctrl.$attrs.transportCnt || 0;
  
  var async = loadTemplateCache.split(templateCache);// массив
  
  async.push($http.get(appRoutes.url_for('данные формы транспорта', $attrs.transportId || 0)).then(function (resp) {//$attrs.formDataUrl

      if (resp.data._selected_category && resp.data._selected_category.length > 0)
        ctrl.category.selectedIdx = resp.data._selected_category;
      if (resp.data.category)
        ctrl.category.finalCategory = resp.data.category;
    
      $scope.data = resp.data;

  }));
  
  ctrl.categoryTreeData = null;
  async.push($http.get(appRoutes.url_for('категории транспорта')).then(function (resp) { ctrl.categoryTreeData = resp.data; }));// && resp.data[0].childs

  $q.all(async).then(function (proms) {ctrl.ready = true;});
  
  //~ $http.get(appRoutes.url_for('типы адресов')).then(function (resp) {ctrl.addr_type = resp.data; });//$attrs.addressTypeUrl
  // копи-пастуй SELECT array_to_json(array_agg(t)) FROM (select * from "типы адреса"() order by idx) t;
  //~ ctrl.addr_type = [{"text":"Местные перевозки/услуги (для городов и районов)","idx":1},{"text":"Междугородные перевозки","idx":2},{"text":"Заграничные перевозки","idx":3}];
  
  var http_then_cb = function (resp) {//$attrs.formDataUrl
    delete ctrl.cancelerHttp;
    if (resp.data.error) ctrl.error = resp.data.error;
    if (resp.data.success) ctrl.success = resp.data.success;
    //~ var param = '';
    //~ if (resp.data.id) param = "#transport"+resp.data.id;
    //~ if($attrs.backUrl) $window.location.href = $attrs.backUrl+param;
    if (resp.data.id) $scope.data.id=resp.data.id;
    if (resp.data.cnt) ctrl.transportCnt=resp.data.cnt;
    if (resp.data.redirect) $window.location.href = resp.data.redirect;
  };
  
  ctrl.Save = function () {
    delete ctrl.error;
    delete ctrl.success;
    $scope.data.category = ctrl.category.finalCategory.id;
    //~ $scope.data.upd_ts = new Date().getTime() / 1000;
    if (ctrl.cancelerHttp) ctrl.cancelerHttp.resolve();
    ctrl.cancelerHttp = $q.defer();
    $http.post(appRoutes.url_for('данные формы транспорта', $attrs.transportId), $scope.data, {timeout: ctrl.cancelerHttp.promise}).then(http_then_cb);
  };
  
  ctrl.Disable = function () {
    $scope.data.disabled = !!!$scope.data.disabled;
    ctrl.Save();
    
  };
  
  ctrl.addImg = function () {
    //~ if (!count) return !$scope.data.img[$scope.data.img.length -1].name;// Это косяк, убрал проверку
    var newImg = {"name": null, "_img_url": null};
    $scope.data.img.push(newImg);
    $scope.$broadcast('click-select-image', newImg);
  };
  
  ctrl.addAddr = function() {// проверка и добавление
    //~ if (!count) return $scope.data.address[$scope.data.address.length - 1].uuid == null;
    $scope.data.address.push({});
    $timeout(function () {angular.element($('address-select .ui-select-toggle:last')).triggerHandler('click');}); //;
    
  };
  

  //~ ctrl.addrTypeLabel = function(index) {// для крыжиков 
    //~ return addr_type[index] || 'Метка крыжика неопределена';
    
  //~ };
  
  ctrl.addTel = function () {
    $scope.data.tel.push('');
  };
  
};

/*=============================================================*/

angular.module(moduleName, ['AppTplCache', 'appRoutes', 'transport.category.list', 'address.select', 'AddressType', 'tel.list', 'load.templateCache', 'img.upload.list', 'TransportStatus'])//'ngSanitize',

.controller('Controll', Controll)

;

}());
