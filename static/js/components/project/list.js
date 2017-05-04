(function () {'use strict';
/*
*/

var moduleName = "ProjectList";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $window, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param={};
    
    $http.get(appRoutes.url_for('список проектов')).then(function(resp){
      if(resp.data.error) $scope.error = resp.data.error;
      else $ctrl.data= resp.data;
      //~ $ctrl.data.push({id:1, title:'Проект-тест'});
      //~ console.log($ctrl.data);
      $ctrl.InitTabs(($ctrl.param["проект"] && $ctrl.param["проект"].id) || 0);
      
    });
    
  };
  
  $ctrl.InitTabs = function(active) {// инициализация табов
    $ctrl.tab = $ctrl.data.filter(function(p){return p.id == active;}).shift() || $ctrl.data[0];
    if($ctrl.tab) $ctrl.param["проект"] = $ctrl.tab;
    $ctrl.ready = true;
    $timeout(function(){
      $('ul.tabs', $($element[0])).tabs();
      
      
    });//('select_tab', 'new-project'
  };
  
  $ctrl.SelectProject = function(p){
    $ctrl.tab = p;
    $ctrl.param.id = undefined;
    delete $ctrl.new;
    //~ console.log("SelectProject", p);
    if($ctrl.onSelectProject) $ctrl.onSelectProject({"p":p});
    
    
  };
  
  $ctrl.NewProject = function(){
    delete $ctrl.tab;
    if($ctrl.onSelectProject) $ctrl.onSelectProject({"p":null});
    $ctrl.new = {};
  };
  
  $ctrl.SaveBtn = function(flag){
    if(flag) return !($ctrl.new.title && $ctrl.new.title.length);
    
    $http.post(appRoutes.url_for('сохранить проект'), $ctrl.new).then(function(resp){
      if(resp.data.error) {
        $scope.error = resp.data.error;
        return;
      }
      
      
      return $window.location.reload();
      
      delete $ctrl.new;
      $ctrl.data.push(resp.data);
      //~ $ctrl.ready = false;
      $timeout(function(){
        //~ $ctrl.ready = true;
        //~ $ctrl.SelectProject(resp.data);
        angular.element($('#project'+resp.data.id+' a', $($element[0])).get(0)).triggerHandler('click');
        //~ $('#project'+resp.data.id+' a', $($element[0])).click();
        
      });
      
    });
    
  };
  
};

/*=============================================================*/

module

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