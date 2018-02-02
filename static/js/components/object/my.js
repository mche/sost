(function () {'use strict';
/*
  Мои(доступные) объекты/подразделения
*/

var moduleName = "ObjectMy";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'SVGCache']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, ObjectMyData){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = [];
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param.itemClass) $ctrl.param.itemClass = 'blue-text';

    if($ctrl.data.then) $ctrl.data.then(function(){
      $ctrl.data= resp.data;
       $ctrl.ready = true;
    });
    else if (!$ctrl.data.length) $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
    });
    else $timeout(function(){
      $ctrl.ready = true;
    });
    
  };
  
  $ctrl.FilterObj = function(item){//
    if (!$ctrl.param['фильтр объектов']) return true;
    return $ctrl.param['фильтр объектов'](item);
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('доступные объекты'))
    return ObjectMyData.Load($ctrl.param)
      .then(function(resp){
        Array.prototype.push.apply($ctrl.data, resp.data.filter($ctrl.FilterObj));
        if ($ctrl.param.selectId !== undefined) $ctrl.SelectObj($ctrl.data.filter(function(it){return it.id == $ctrl.param.selectId;}).pop());
        else if (!$ctrl.param['все объекты'] && $ctrl.data.length == 1) $ctrl.SelectObj($ctrl.data[0]);
        //~ if ($ctrl.param['все объекты'] && $ctrl.data.length == 2) $ctrl.SelectObj($ctrl.data[1]);
        //~ if($ctrl.param['все объекты']) $ctrl.data.unshift({id:0, name:'Все объекты'});
      });
    
  };
  
  $ctrl.OrderBy = function(item) {
    if(!item['проект']) item['проект'] = JSON.parse(item['проект/json'] || '{}');
    if(!item['проект'].name) return 0;
    return item['проект'].name+item.name;
    
  }
  
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
    var cls = ' ';
    if(obj === undefined) return 'grey-text';
    if(obj.id === 0) cls += ' bold ';
    if(obj !== $ctrl.object) cls += ' hover-shadow3d ';
    return cls+$ctrl.param.itemClass;
    
  };
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  //~ var fresh  = function(){return };
  //~
  return {
    Load: function(param) {
       var data = $http.get(appRoutes.url_for('доступные объекты'));
      return data.then(function(resp){
       if(param['все объекты']) resp.data.unshift({id:0, name:'Все объекты'});
       return resp;
    });},
    "все объекты без доступа": function(param) {
       var data = $http.get(appRoutes.url_for('объекты'));
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