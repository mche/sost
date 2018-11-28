(function () {'use strict';
/*
  Мои(доступные) объекты/подразделения
*/

var moduleName = "Объекты";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'SVGCache']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, $Объекты){
  var $c = this;
  
  $c.$onInit = function(){
    if(!$c.data) $c.data = [];
    if(!$c.param) $c.param = {};
    if(!$c.param.itemClass) $c.param.itemClass = 'blue-text';

    if($c.data.then) $c.data.then(function(){
      $c.data= resp.data;
       $c.Ready();
    });
    else if (!$c.data.length) $c.LoadData().then($c.Ready);
    else $timeout($c.Ready);
    
  };
  
  $c.Ready = function(){
    $c.ready = true;
    $timeout(function(){
      $c.dropDown = $('.select-dropdown', $($element[0]));///.addClass('dropdown-content');
      if ($c.param.selectId === undefined) $c.DropDownShow();
    });
  };
  
  $c.FilterObj = function(item){//
    if (!$c.param['фильтр объектов']) return true;
    return $c.param['фильтр объектов'](item);
  };
  
  $c.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('доступные объекты'))
    return $Объекты.Load($c.param)
      .then(function(resp){
        Array.prototype.push.apply($c.data, resp.data/*.filter($c.FilterObj)*/.filter($c.FilterUniqById, {}));
        if ($c.param.selectId !== undefined) $c.SelectObj($c.data.filter(function(it){return it.id == $c.param.selectId;}).pop());
        else if (!$c.param['все объекты'] && $c.data.length == 1) $c.SelectObj($c.data[0]);
        
        //~ if ($c.param['все объекты'] && $c.data.length == 2) $c.SelectObj($c.data[1]);
        //~ if($c.param['все объекты']) $c.data.unshift({id:0, name:'Все объекты'});
      });
    
  };
  
  $c.FilterUniqById = function(obj){
    if (!$c.param['без проекта']) return true;
    return (++this[obj.id] || (this[obj.id]=0)) === 0;
    
  };
  
  $c.OrderBy = function(item) {
    //~ if(!item['проект']) item['проект'] = JSON.parse(item['проект/json'] || '{}');
    if($c.param['без проекта'] || !item['$проект'] || !item['$проект'].name) return item.name;
    return item['$проект'].name+item.name;
    
  };
  
  $c.ToggleSelectObj = function(event, hide){
    //~ if (!selectObj) selectObj =  $('.dropdown-content', $($element[0]));
    $timeout(function(){
      if (!hide) $c.DropDownShow();
      else $c.DropDownHide();
    });
  };
  
  $c.SelectObj = function(obj){
    //~ console.log("SelectObj", obj);
    if (obj === $c.object) return $c.DropDownHide();
    $c.object = undefined;
    //~ $c.ToggleSelectObj(undefined, true);
    $timeout(function(){
      $c.object = obj;
      if($c.onSelectObj) $c.onSelectObj({"obj": obj, "data": $c.data});
      $c.DropDownHide();
    }, 100);
    
  };
  
  var event_hide = function(event){
    if($(event.target).closest($c.dropDown).eq(0).length) return;
    $c.DropDownHide();
    $(document).off('click', event_hide);
    return false;
  };
  $c.DropDownShow = function(){
    $c.dropDown.show();
    //~ $c.showList = !0;
    $('input', $c.dropDown).focus();
    $timeout(function(){ $(document).on('click', event_hide); }, 100);
  };
  $c.DropDownHide = function(){
    $c.dropDown.hide();
    //~ $timeout(function(){ delete $c.showList; });
  };
  
  $c.FilterObj = function(obj){
    if (!$c['фильтровать объекты']) return true;
    var re = new RegExp($c['фильтровать объекты'], 'i');
    return re.test(((!$c.param['без проекта'] && obj['$проект'] && obj['$проект'].name) || '')+obj.name);
    
  };
  
  $c.ItemClass = function(obj){
    var cls = ' ';
    if(obj === undefined) return 'grey-text';
    if(obj.id === 0) cls += ' bold ';
    if(obj !== $c.object) cls += ' hover-shadow3d ';
    return cls+$c.param.itemClass;
    
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
         if(param && param['все объекты']) resp.data.unshift({id:0, name:'Все объекты, склады и базы'});
         return resp;
      });
    },
    "все объекты без доступа": function(param) {
      var url = appRoutes.url_for('объекты');
      if (!cache[url]) cache[url] = $http.get(url);
      return cache[url].then(function(resp){
         if(param && param['все объекты']) resp.data.unshift({id:0, name:'Все объекты, склады и базы'});
         return resp;
      });
    },
  };
  
};

/*==========================================================*/
module

.factory('$Объекты', Data)

.component('objectSelect', {
  controllerAs: '$c',
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