(function () {'use strict'; try {
/*

*/
  
var moduleName = "States";

var Controll = function ($scope, $http, $q, $timeout, States, appRoutes, User) {//States factory from this module!
  var $ctrl = this; 
  $scope.States = States;
  
  $ctrl.Init = function() {
    //~ console.log("Отчет о звонке");
    $timeout(function() {
      $scope.data = States.data.filter( function(item, idx){ return !!item["ид кнопки"]; } );
      //~ console.log("statesTelResults", $scope.data);
      $ctrl.ready = true;
    });
  };
  
  $ctrl.BtnSort = function(item) {
    return item["ид кнопки"];
  };//ng-repeat
  
  
  $ctrl.TelResult = function(result) {
    //~ 
    if($ctrl.onTelResult) return $ctrl.onTelResult(result);
    //~ console.log("Результат показа тел", result);
  };
  
};


angular.module(moduleName)

.component('statesTelResults', {
  templateUrl: "states/tel-results",
  bindings: {
      //~ data: '<',// массив списка состояний
    onTelResult: '<',

  },
  controller: Controll
})
;

} catch(err) {console.log("Ошибка компиляции в результатах показа телефона "+err.stack);}
}());