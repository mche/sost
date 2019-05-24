(function () {'use strict';
/*
*/
var moduleName = "Спецодежда::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Спецодежда::Форма']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, /*$templateCache,*/ appRoutes, $СпецодеждаФорма){
  var $c = this;
  
  $c.$onInit = function(){
    $c.data = [];
    $c.filter = {"наименование": '',};
    
    $c.LoadData().then(function(){
      //~ $c.ready = true;
      $c.vue = new Vue({
        "el":  $element[0],
        //~ "delimiters": ['{%', '%}'],
        "data": function () {
            return $c;
          },
          "methods": function () {
            return $c;
          },
          "components": {
            'guard-ware-form': new $СпецодеждаФорма($c, $scope, $element),
          },
        });
        //~ console.log("Vue", $c.vue);
      });
  };
  
  $c.LoadData = function(){
    $c.data.splice(0, $c.data.length);
    return $http.get(appRoutes.url_for('спецодежда/список')).then(function(resp){
      Array.prototype.push.apply($c.data, resp.data);      
    });
    
  };
  
  $c.ChangeFilterText = function(event){
    //~ let vm = this;
    if (!event.target) {/// или сброс в строку
      $c.filter['наименование'] = event;
      //~ return TimeoutFIO();
    }
    
  };
  
};

/*=====================================================================*/

module

.component('guardWare', {
  "controllerAs": '$c',
  "templateUrl": "спецодежда/таблица",
  "bindings": {
    param: '<',

  },
  controller: Controll
})

;

}());