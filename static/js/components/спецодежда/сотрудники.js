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

Vue.component('v-profiles-list', );

const Controll = function($scope, $http, $q, $timeout, $element, appRoutes, $Список){
  var $c = this;
  
  console.log("Ctrl", angular.copy($element));///document.getElementById('спецодежда/сотрудники/список')
  
  //~ Vue.component('v-profiles-list', {
            //~ "template": document.getElementById('спецодежда/сотрудники/список'),//'#спецодежда/сотрудники/список',//
            //~ "delimiters": ['{%', '%}'],
            //~ "data": function () {
                ///return $c;
                //~ return {
                  //~ count: 1
                //~ };
              //~ },
            
          //~ });
  
  $c.$onInit = function(){
    //~ if(!$c.searchComplete) $c.searchComplete = [];
    $c.data = [];
    $c.LoadData().then(function(){
      $c.ready = true;
      $c.count = 0;
      //~ $timeout(function(){
        //~ new Vue({
          //~ "el": $element[0],
          //~ "delimiters": ['{%', '%}'],
          //~ "data": function () {
            //~ return $c;
          //~ },
        //~ });
        
      
      
      //~ console.log(document.getElementById('спецодежда/сотрудники/список'));

       //~ console.log();

      console.log("Vue", new Vue({
          "el":  $element[0],//'#app',//document.getElementById('app'),///'#app-profiles-list',//
        "template": document.getElementById('спецодежда/сотрудники/список'),
        "delimiters": ['{%', '%}'],
        "data": function () {
            return $c;
          },
          "methods": function () {
            return $c;
          },
        //~ "components": {
          
        //~ },
        }));
      });
      
    //~ });
    
  };
  
  $c.LoadData = function(){
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
    console.log("ToggleSelect", profile);
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