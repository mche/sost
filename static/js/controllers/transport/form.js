(function () {
'use strict';
/*
Набор для формы транспорта
*/

var moduleName = "TransportForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'transport.category.list', 'address.select', 'AddressType', 'tel.list', 'load.templateCache', 'img.upload.list', 'TransportStatus', 'User'])//'ngSanitize',

var templateCache = ["/assets/transport/form.html"];

var Controll = function ($scope, $attrs, loadTemplateCache, appRoutes){
  var ctrl = this;
  $scope.appRoutes = appRoutes;
  $scope.param = {"id": $attrs.transportId || 0, "selectedCategory": $attrs.selectedCategory || 0,};// "cnt": $attrs.transportCnt || 0
  loadTemplateCache.split(templateCache, 1).then(function() {ctrl.ready = true;});
  
};

var Component = function  ($scope, $http, $window, $timeout, $q, appRoutes, User) {
  var $ctrl = this;
  $scope.category = {"selectedIdx": [], "finalCategory": null};//, "current": null
  
  $ctrl.Init = function () {
    var async = [];// массив
  
    async.push($http.get(appRoutes.url_for('данные формы транспорта', parseInt($ctrl.param.id) || 0, {"c": parseInt($ctrl.param.selectedCategory) || 0})).then(function (resp) {

      if (resp.data._selected_category && resp.data._selected_category.length > 0)
        $scope.category.selectedIdx = resp.data._selected_category;
      if (resp.data.category)
        $scope.category.finalCategory = resp.data.category;
    
      $scope.data = resp.data;

    }));
    
    $scope.categoryTreeData = null;
    async.push($http.get(appRoutes.url_for('категории транспорта')).then(function (resp) { $scope.categoryTreeData = resp.data; }));// && resp.data[0].childs

    $q.all(async).then(function (proms) {$ctrl.ready = true;});
    
  };
  
  var http_then_cb = function (resp) {
    delete $ctrl.cancelerHttp;
    if (resp.data.error) $ctrl.error = resp.data.error;
    if (resp.data.success) $ctrl.success = resp.data.success;

    if (resp.data.id) $scope.data.id=resp.data.id;
    //~ if (resp.data.cnt) $ctrl.param.cnt=resp.data.cnt;
    if (resp.data.redirect) {
      if ($ctrl.onSaveCallback) return $ctrl.onSaveCallback(resp.data);
      $window.location.href = resp.data.redirect;
    }
  };
  
  $ctrl.Save = function () {
    delete $ctrl.error;
    delete $ctrl.success;
    $scope.data.category = $scope.category.finalCategory.id;
    //~ $scope.data.upd_ts = new Date().getTime() / 1000;
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    $http.post(appRoutes.url_for('сохранить транспорт'), $scope.data, {timeout: $ctrl.cancelerHttp.promise}).then(http_then_cb);
  };
  
  //~ $ctrl.Disable = function () {
    //~ $scope.data.disabled = !!!$scope.data.disabled;
    //~ $ctrl.Save();
    
  //~ };
  
  $ctrl.addImg = function () {
    //~ if (!count) return !$scope.data.img[$scope.data.img.length -1].name;// Это косяк, убрал проверку
    var newImg = {"name": null, "_img_url": null};
    $scope.data.img.push(newImg);
    $scope.$broadcast('click-select-image', newImg);
  };
  
  $ctrl.ImgUploadUrl = function () {
    return appRoutes.url_for('сохранить картинку транспорта');
  };
  
  $ctrl.ImgUrl = function (name) {
    return appRoutes.url_for('картинка транспорта', [User.id() || 0, name]);
  };
  
  
  $ctrl.addAddr = function() {// проверка и добавление
    //~ if (!count) return $scope.data.address[$scope.data.address.length - 1].uuid == null;
    $scope.data.address.push({});
    $timeout(function () {angular.element($('address-select .ui-select-toggle:last')).triggerHandler('click');}); //;
    
  };
  

  //~ $ctrl.addrTypeLabel = function(index) {// для крыжиков 
    //~ return addr_type[index] || 'Метка крыжика неопределена';
    
  //~ };
  
  $ctrl.addTel = function () {
    $scope.data.tel.push('');
  };
  
};

/*=============================================================*/

module

.controller('Controll', Controll)

.component('transportForm', {
  templateUrl: "transport/form",
  bindings: {
    //~ data: '<',
    param: '<', //параматеры {id: трансп}
    onSaveCallback: '<'


  },
  controller: Component
})

;

}());
