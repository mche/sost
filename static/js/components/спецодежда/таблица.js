(function () {'use strict';
/*
*/
var moduleName = "Спецодежда::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Спецодежда::Форма']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, /*$templateCache,*/ appRoutes, $СпецодеждаФорма){
  var $c = this;
  var meth = {/*методы Vue*/};
  
  $scope.$on('Выбран сотрудник', function(event, profile){
    //~ console.log("Получен сотрудник", JSON.stringify(profile));
    $c.profile = undefined;
    if (profile) {
      $c.ready = false;
      $c.LoadProfile(profile).then(function(){
        $c.ready = true;
        $c.profile = profile;
      });
    }
    
  });
  
  $c.$onInit = function(){
    $c.data = [];
    $c.profile = undefined;
    $c.filter = {"наименование": '',};
    
    $c.LoadData().then(function(){
      $c.ready = true;
      $c.vue = new Vue({
        "el":  $element[0],
        //~ "delimiters": ['{%', '%}'],
        "data": function () {
            return $c;
          },
          "methods": meth,
          "components": {
            'guard-ware-form': new $СпецодеждаФорма({"param": $c.param}, $c, $scope),
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
  
  meth.ChangeFilterText = function(event){
    //~ let vm = this;
    if (!event.target) {/// или сброс в строку
      $c.filter['наименование'] = event;
      //~ return TimeoutFIO();
    }
    
  };
  
  $c.LoadProfile = function(profile){
    return $http.post(appRoutes.url_for('спецодежда сотрудника'), {"id": profile.id}).then(function(resp){
      $c.vue.$set(profile, 'спецодежда', resp.data);
    });
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