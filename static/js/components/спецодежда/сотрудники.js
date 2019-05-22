(function () {'use strict';
/*
  Пользователи/сотрудники
  Список
  Выбор позиции
  Добавление
  Изменение
  Удаление
*/
var moduleName = "Спецодежда::Сотрудники";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, appRoutes, $Список){
  var $c = this;
  
  $c.$onInit = function(){
    if(!$c.searchComplete) $c.searchComplete = [];
    $c.LoadData().then(function(){
      $c.ready = true;
      
    });
    
  };
  
  $c.LoadData = function(){
    if (!$c.data) $c.data = [];
    $c.data.splice(0, $c.data.length);
    var loader = new $Список(appRoutes.url_for('спецодежда/сотрудники'));
    return loader.Load().then(function(resp){
      loader.Data($c.data);      
      return loader;
    });
    
  };
  
  $c.FilterData = function(profile){
    //~ return true;
    var re = new RegExp($c.filterProfile,"i");
    return $c.filterProfile ? (re.test(profile.names.join(' ')) /*|| profile.tel.some(FilterTel, re)*/) : !0;
    
  };
  
  $c.ToggleSelect = function(profile, select){// bool
    if (select === undefined) select = !profile._selected;
    profile._selected = select;
    
    if (profile._selected) {
      $c.data.map(function(it){it._checked = false; if(it.id !== profile.id) it._selected=false;});// сбросить крыжики
      profile._checked = true;
      
    }
  };
  
};

/*=====================================================================*/

module

.component('profilesList', {
  controllerAs: '$c',
  templateUrl: "спецодежда/сотрудники/список",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Controll
})

;

}());