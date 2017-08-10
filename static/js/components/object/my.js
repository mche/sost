(function () {'use strict';
/*
  Мои(доступные) объекты/подразделения
*/

var moduleName = "ObjectMy";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, ObjectMyData){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = [];
    if(!$ctrl.param) $ctrl.param = {};

    $ctrl.LoadData().then(function(){
      if(!$ctrl.param.itemClass) $ctrl.param.itemClass = 'blue-text';
      $ctrl.ready = true;
    });
  };
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('доступные объекты'))
    return ObjectMyData.Load($ctrl.param)
      .then(function(resp){
        Array.prototype.push.apply($ctrl.data, resp.data);
        if (!$ctrl.param['все объекты'] && $ctrl.data.length == 1) $ctrl.SelectObj($ctrl.data[0]);
        //~ if ($ctrl.param['все объекты'] && $ctrl.data.length == 2) $ctrl.SelectObj($ctrl.data[1]);
        //~ if($ctrl.param['все объекты']) $ctrl.data.unshift({id:0, name:'Все объекты'});
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
      if($ctrl.onSelectObj) $ctrl.onSelectObj({"obj": obj, "data": $ctrl.data});
    });
    
  };
  
  $ctrl.ItemClass = function(obj){
    if(obj === undefined) return 'grey-text';
    if(obj.id === 0) return [$ctrl.param.itemClass, 'bold'];
    return [$ctrl.param.itemClass];
    
  };
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  //~ var fresh  = function(){return };
  var data = $http.get(appRoutes.url_for('доступные объекты'))
    ;
  return {
    Load: function(param) {
      return data.then(function(resp){
       if(param['все объекты']) resp.data.unshift({id:0, name:'Все объекты'});
       return resp;
    });},
    //~ Fresh: fresh,
  };
  //~ f.get = function (){
  //~ };
  
};

/*==========================================================*/
module

.factory('ObjectMyData', Data)

.component('objectMy', {
  templateUrl: "object/my",
  bindings: {
    param:'<',
    data: '<',
    onSelectObj:'&',
  },
  controller: Component
})

;

}());