(function () {'use strict';

var moduleName = "TransportItemDetail";

var Component = function  ($scope,$window, $timeout, User, appRoutes) {//, $http, $q, $timeout
  var $ctrl = this;
  $scope.User = User;
  
  $ctrl.Init = function() {
    $timeout(function() {
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
      //~ console.log("Показ транспорта ", $ctrl.data);
    });
  };
  
  $ctrl.ShowTel = function(idx) {// индекс тел в массиве
    if ($ctrl.data['ид заявки']) return;
    if($ctrl.onShowTelCallback) $ctrl.onShowTelCallback(idx);
  };
  
  $ctrl.Login = function() {
    if ($ctrl.toLoginCallback) return $ctrl.toLoginCallback();
    $window.location.href = appRoutes.url_for('profile');
  };
  
  $ctrl.ImgUrl = function(img) {
    return appRoutes.url_for('картинка транспорта', [$ctrl.data.uid, img]);
    
  };
  
  $ctrl.HrefTel = function (tel) {
    if (!$ctrl.data['ид заявки']) return "javascript:";
    if ($ctrl.param.mobile) return "tel: +7"+tel;
    return "javascript:";
  };
  
};

/*
Разделяемая библиотека для сайта и приложения
*/
var Lib = function($http, $q, appRoutes) {
return function($ctrl, $scope) {//constructor
  var lib = this;
  
  
};
};

angular.module(moduleName, ['AppTplCache', 'phone.input', 'User', 'appRoutes'], function ($compileProvider) {

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|tel):/);// это только для сайта

})//'load.templateCache', 

.factory(moduleName+'Lib', Lib)

.component('transportItemDetail', {
  templateUrl: "transport/item-detail",
  bindings: {
    data: '<',
    param: '<',
    onShowTelCallback: '<',
    toLoginCallback: '<'
  },
  controller: Component
})

;

}());