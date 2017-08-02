(function () {'use strict';
/*
  Мои(доступные) объекты/подразделения
*/

var moduleName = "ObjectMy";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = [];
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
    });
  };
  $ctrl.LoadData = function(){
    return $http.get(appRoutes.url_for('табель рабочего времени/доступные объекты'))
      .then(function(resp){
        Array.prototype.push.apply($ctrl.data, resp.data);
        if ($ctrl.data.length == 1) $ctrl.SelectObj($ctrl.data[0]);
      });
    
  };
  var selectObj = undefined;
  $ctrl.ToggleSelectObj = function(event, hide){
    if (!selectObj) selectObj =  $('.select-dropdown', $($element[0]));
    if (!hide) {
      selectObj.show();
      return;
    }
    $timeout(function(){
      selectObj.hide();
    }, 200);
  };
  $ctrl.SelectObj = function(obj){
    if (obj === $ctrl.object) return;
    $ctrl.object = undefined;
    //~ $ctrl.ToggleSelectObj(undefined, true);
    $timeout(function(){
      $ctrl.object = obj;
      if($ctrl.onSelectObj) $ctrl.onSelectObj({"obj": obj});
    });
    
  };
  
};

/*==========================================================*/
module

.component('objectMy', {
  templateUrl: "object/my",
  bindings: {
    data: '<',
    onSelectObj:'&',
  },
  controller: Component
})

;

}());