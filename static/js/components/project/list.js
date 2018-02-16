(function () {'use strict';
/*
*/

var moduleName = "ProjectList";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $window, appRoutes, ProjectData) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param={};
    
    //~ $http.get(appRoutes.url_for('список проектов'))
    ProjectData.Load()
    .then(function(resp){
      if(resp.data.error) $scope.error = resp.data.error;
      else $ctrl.data= resp.data;
      //~ $ctrl.data.push({id:1, title:'Проект-тест'});
      //~ console.log($ctrl.data);
      $ctrl.InitTabs(($ctrl.param["проект"] && $ctrl.param["проект"].id) || 0);
      
    });
    
  };
  
  $ctrl.FilterTabs = function(p){return p.id == this;};
  $ctrl.InitTabs = function(active) {// инициализация табов
    $ctrl.tab = $ctrl.data.filter($ctrl.FilterTabs, active).shift();// || $ctrl.data[0];
    if($ctrl.tab) $ctrl.param["проект"] = $ctrl.tab;
    $ctrl.ready = true;
    //~ $timeout(function(){
      //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red'});
      
      
    //~ });//('select_tab', 'new-project'
  };
  
  $ctrl.SelectProject = function(p){
    $ctrl.param.id = undefined;
    delete $ctrl.new;
    if(p) $ctrl.tab = p;
    else delete $ctrl.tab;
    //~ console.log("SelectProject", p);
    if($ctrl.onSelectProject) $ctrl.onSelectProject({"p":p});
    
    
  };
  
  $ctrl.NewProject = function(){
    delete $ctrl.tab;
    if($ctrl.onSelectProject) $ctrl.onSelectProject({"p":null});
    $ctrl.new = {};
  };
  
  $ctrl.Save = function(flag){
    if(flag) return !($ctrl.new.name && $ctrl.new.name.length);
    
    $http.post(appRoutes.url_for('сохранить проект'), $ctrl.new).then(function(resp){
      if(resp.data.error) {
        $scope.error = resp.data.error;
        return;
      }
      
      
      return $window.location.reload();
      /*
      delete $ctrl.new;
      $ctrl.data.push(resp.data);
      //~ $ctrl.ready = false;
      $timeout(function(){
        //~ $ctrl.ready = true;
        //~ $ctrl.SelectProject(resp.data);
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