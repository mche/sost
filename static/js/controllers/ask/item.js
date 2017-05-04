/*jshint scripturl:true*/
(function () {'use strict';
/*
  
  */
var moduleName = "AskItem";

var Component = function  ($scope, $timeout) {
  var $ctrl = this;
  
  $ctrl.Init = function() {
    $timeout(function(){
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
    });
  };
  
  $ctrl.ShowTel = function () {
    if($ctrl.data.transport) return;
    if ($ctrl.onShowTel) return $ctrl.onShowTel($ctrl.data);
    console.log("[AskItem] Не указан биндинг компонента onShowTel");
  };
  
  
  $ctrl.HrefTel = function () {
    if ($ctrl.param.mobile && $ctrl.data.transport) return 'tel: +7' + $ctrl.data.tel;
    return 'javascript:';
  };
  
  $ctrl.SetStates = function (list_states) {// из списка состояний
    if($ctrl.setStatesCallback) return $ctrl.setStatesCallback(list_states);
    
  };
  
};

angular.module(moduleName, ['AppTplCache', 'States', 'tel-show-list', 'phone.input'], function ($compileProvider) {

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript|tel):/);

})//

.component('askItem', {
  templateUrl: "ask/item",
  bindings: {
    data: '<',//заявка
    param: '<',
    onShowTel: '<',
    setStatesCallback: '<',

  },
  controller: Component
})

;

}());