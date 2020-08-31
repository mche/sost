!(function () {'use strict';
/*
*/

var moduleName = "ProjectList";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $window, appRoutes, ProjectData) {
  var $c = this;
  
  $c.$onInit = function(){
    
    if(!$c.param) $c.param={};
    
    //~ $http.get(appRoutes.url_for('список проектов'))
    ProjectData.Load().then(function(resp){
      if(resp.data.error) $scope.error = resp.data.error;
      else $c.data= resp.data;
      //~ $c.data.push({id:1, title:'Проект-тест'});
      //~ console.log($c.data);
      $c.InitTabs(($c.param["проект"] && $c.param["проект"].id) || 0);
      
    });
    
  };
  
  $c.FilterTabs = function(p){return p.id == this;};
  $c.InitTabs = function(active) {// инициализация табов
    $c.tab = $c.data.filter($c.FilterTabs, active).shift();// || $c.data[0];
    if($c.tab) $c.param["проект"] = $c.tab;
    $c.ready = true;
    //~ $timeout(function(){
      //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red'});
      
      
    //~ });//('select_tab', 'new-project'
  };
  
  $c.FilterData = function(item){
    //~ if (item.hasOwnProperty('контрагент/id')) return !!item['контрагент/id'];
    return true;
  };
  
  $c.SelectProject = function(p){
    $c.param.id = undefined;
    //~ delete $c.new;
     
    if (!p || $c.tab === p) delete $c.tab;
    else $c.tab = p;
    //~ console.log("SelectProject", p);
   if($c.onSelectProject) $c.onSelectProject({"p": $c.tab});
    
    
  };
  
  $c.NewProject = function(){
    delete $c.tab;
    if($c.onSelectProject) $c.onSelectProject({"p":null});
    $c.new = {};
  };
  
  $c.Save = function(flag){
    if(flag) return !($c.new.name && $c.new.name.length);
    
    $http.post(appRoutes.url_for('сохранить проект'), $c.new).then(function(resp){
      if(resp.data.error) {
        $scope.error = resp.data.error;
        return;
      }
      
      
      return $window.location.reload();
      /*
      delete $c.new;
      $c.data.push(resp.data);
      //~ $c.ready = false;
      $timeout(function(){
        //~ $c.ready = true;
        //~ $c.SelectProject(resp.data);
        angular.element($('#project'+resp.data.id+' a', $($element[0])).get(0)).triggerHandler('click');
        //~ $('#project'+resp.data.id+' a', $($element[0])).click();
        
      });*/
      
    });
    
  };
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var data = $http.get(appRoutes.url_for('список проектов'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("ProjectData", Data)

.component('projectList', {
  controllerAs: '$c',
  templateUrl: "project/list",
  //~ scope: {},
  bindings: {
    param: '<',
    onSelectProject: '&',

  },
  controller: Component
})

;

}());