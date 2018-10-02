(function () {'use strict';
/*
  Мои(доступные) объекты/подразделения
*/

var moduleName = "Объекты";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'SVGCache']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, $Объекты){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = [];
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param.itemClass) $ctrl.param.itemClass = 'blue-text';

    if($ctrl.data.then) $ctrl.data.then(function(){
      $ctrl.data= resp.data;
       $ctrl.Ready();
    });
    else if (!$ctrl.data.length) $ctrl.LoadData().then($ctrl.Ready);
    else $timeout($ctrl.Ready);
    
  };
  
  $ctrl.Ready = function(){
    $ctrl.ready = true;
    $timeout(function(){
      $ctrl.dropDown = $('.select-dropdown', $($element[0]));///.addClass('dropdown-content');
      
    });
  };
  
  $ctrl.FilterObj = function(item){//
    if (!$ctrl.param['фильтр объектов']) return true;
    return $ctrl.param['фильтр объектов'](item);
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('доступные объекты'))
    return $Объекты.Load($ctrl.param)
      .then(function(resp){
        Array.prototype.push.apply($ctrl.data, resp.data.filter($ctrl.FilterObj));
        if ($ctrl.param.selectId !== undefined) $ctrl.SelectObj($ctrl.data.filter(function(it){return it.id == $ctrl.param.selectId;}).pop());
        else if (!$ctrl.param['все объекты'] && $ctrl.data.length == 1) $ctrl.SelectObj($ctrl.data[0]);
        //~ if ($ctrl.param['все объекты'] && $ctrl.data.length == 2) $ctrl.SelectObj($ctrl.data[1]);
        //~ if($ctrl.param['все объекты']) $ctrl.data.unshift({id:0, name:'Все объекты'});
      });
    
  };
  
  $ctrl.OrderBy = function(item) {
    //~ if(!item['проект']) item['проект'] = JSON.parse(item['проект/json'] || '{}');
    if(!item['$проект'] || !item['$проект'].name) return 0;
    return item['$проект'].name+item.name;
    
  }
  
  $ctrl.ToggleSelectObj = function(event, hide){
    //~ if (!selectObj) selectObj =  $('.dropdown-content', $($element[0]));
    $timeout(function(){
    if (!hide) {
      $ctrl.DropDownShow();
      //~ $ctrl.dropDown.off();
      //~ $('li', $ctrl.dropDown).off();
      //~ $(document).off();
      //~ $('input', $ctrl.dropDown).focus();
    } else $ctrl.DropDownHide();
    });
  };
  
  $ctrl.SelectObj = function(obj){
    //~ console.log("SelectObj", obj);
    if (obj === $ctrl.object) return $ctrl.DropDownHide();
    $ctrl.object = undefined;
    //~ $ctrl.ToggleSelectObj(undefined, true);
    $timeout(function(){
      $ctrl.object = obj;
      if($ctrl.onSelectObj) $ctrl.onSelectObj({"obj": obj, "data": $ctrl.data});
      $ctrl.dropDown.hide();
    }, 100);
    
  };
  
  var event_hide = function(event){
    if($(event.target).closest($ctrl.dropDown).eq(0).length) return;
    $ctrl.dropDown.hide();
    $(document).off('click', event_hide);
    return false;
  };
  $ctrl.DropDownShow = function(){
    $ctrl.dropDown.show();
    $('input', $ctrl.dropDown).focus();
    $timeout(function(){ $(document).on('click', event_hide); }, 100);
  };
  $ctrl.DropDownHide = function(){
    $ctrl.dropDown.hide();
  };
  
  $ctrl.FilterObj = function(obj){
    if (!$ctrl['фильтровать объекты']) return true;
    var re = new RegExp($ctrl['фильтровать объекты'], 'i');
    return re.test(((!$ctrl.param['без проекта'] && obj['$проект'] && obj['$проект'].name) || '')+obj.name);
    
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
  var cache = {};
  return {
    Load: function(param) {
      var url = appRoutes.url_for('доступные объекты');
      if (!cache[url]) cache[url] = $http.get(url);
      return cache[url].then(function(resp){
         if(param && param['все объекты']) resp.data.unshift({id:0, name:'Все объекты и базы'});
         return resp;
      });
    },
    "все объекты без доступа": function(param) {
      var url = appRoutes.url_for('объекты');
      if (!cache[url]) cache[url] = $http.get(url);
      return cache[url].then(function(resp){
         if(param && param['все объекты']) resp.data.unshift({id:0, name:'Все объекты и базы'});
         return resp;
      });
    },
  };
  
};

/*==========================================================*/
module

.factory('$Объекты', Data)

.component('objectSelect', {
  templateUrl: "object/select",
  bindings: {
    param:'<',
    data: '<',
    onSelectObj:'&',
  },
  controller: Component
})

;

}());