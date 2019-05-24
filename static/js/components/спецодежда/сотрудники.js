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

const Controll = function($scope, $http, $timeout, $element, $rootScope, /*$templateCache,*/ appRoutes, $Список){
  var $c = this;
  
  //~ console.log("Ctrl", angular.copy($element));///document.getElementById('спецодежда/сотрудники/список')
  
  $c.$onInit = function(){
    //~ if(!$c.searchComplete) $c.searchComplete = [];
    $c.data = [];
    $c.filter = {"ФИО": '', "индексы": []};
    $c.LoadData().then(function(){
      //~ $c.dataFiltered = $c.data;
      $c.ready = true;
      $c.selected_radio = undefined;///input type=radio

       //~ console.log($templateCache.get('спецодежда/сотрудники/список'));

      $c.vue = new Vue({
        "el":  $element[0],
        //~ "template": document.getElementById('спецодежда/сотрудники/список'),
        //~ "delimiters": ['{%', '%}'],
        "data": function () {
            return $c;
          },
          "methods": function () {
            return $c;
          },
        //~ "components": {
        //~ },
        });
        //~ console.log("Vue", $c.vue);
      });
  };
  
  $c.LoadData = function(){
    $c.data.splice(0, $c.data.length);
    $c._loader = $c._loader || new $Список(appRoutes.url_for('спецодежда/сотрудники'));
    return $c._loader.Clear().Load().then(function(resp){
      $c._loader.Data($c.data);      
    });
    
  };
  

  $c.ToggleSelect = function(profile, select){// bool
    var vm = this;
    if (select === undefined) select = !profile._selected;
    //~ profile._selected = select;
    vm.$set(profile, '_selected', select);
    
    if (profile._selected) {
      //~ $c.data.map(function(it){it._checked = false; if(it.id !== profile.id) it._selected=false;});// сбросить крыжики
      //~ profile._checked = true;
      vm.$set(profile, '_checked', true);
      //~ $c.selected_radio = undefined;
    }
  };
  
  $c.FilterFIO  = function(profile, index){///для .map()
    //~ console.log("MapFIO", this);
    let vm = this.vm;
    let re = this.re;
    let visib = re ? re.test(profile.names.join(' ')) /*|| profile.tel.some(FilterTel, re)*/ : true;
    vm.$set(profile, '_hide', !visib);
    if (visib) this['индексы'].push(index);
  };
  
  var timeoutFIO;
  const TimeoutFIO = () => {
    let re = $c.filter['ФИО'] ? new RegExp($c.filter['ФИО'],"i") : undefined;
    $c.filter['индексы'].splice(0, $c.filter['индексы'].length);
    $c.data.map($c.FilterFIO, {"vm": $c.vue, "re": re, "индексы": $c.filter['индексы'],});/// отметить _hide
    timeoutFIO = undefined;
  };
  $c.ChangeFilterFIO = function(event){
    //~ let vm = this;
    if (!event.target) {/// или сброс в строку
      $c.filter['ФИО'] = event;
      return TimeoutFIO();
    }
    //~ console.log("ChangeFilterFIO", $c.filter['ФИО'] == $c.vue.filter['ФИО']);
    if (timeoutFIO) $timeout.cancel(timeoutFIO);
    timeoutFIO = $timeout(TimeoutFIO, 500);
  };
  $c.ChangeRadio = function(event){
    if ($c.prev_selected_radio) $c.vue.$set($c.prev_selected_radio, '_selected', false);
    $c.vue.$set($c.selected_radio, '_selected', true);
    $c.prev_selected_radio = $c.selected_radio;
    //~ console.log("ChangeRadio", event, angular.copy($c.selected_radio));
    $rootScope.$broadcast("Выбран сотрудник", $c.selected_radio);
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