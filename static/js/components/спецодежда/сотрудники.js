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

const Controll = function($scope, $http, $timeout, $element, $rootScope, /*$templateCache, appRoutes,*/ $СпецодеждаСотрудники){
  var $c = this;
  var meth = {/*методы Vue*/};
  //~ var comp = {/* computed*/};
  
  $c.$onInit = function(){
    $c.LoadData().then(function(){
      $c.vue = new Vue({
        "name": moduleName,
        "el":  $element[0],
        //~ "template": document.getElementById('спецодежда/сотрудники/список'),
        //~ "delimiters": ['{%', '%}'],
        "data": function () {
            return {
              "ready": true,
              "filter": {"ФИО": '', "индексы": []},
              "data": $c.data,
              "dataFiltered": $c.data,
              "selected_radio": undefined,///input type=radio
            };
          },
          //~ "computed": comp,
          "methods": meth,
        //~ "components": {
        //~ },
        });
        //~ console.log("Vue", $c.vue);
      });
  };
  
  $c.LoadData = function(){
    $c.data = $c.data || [];
    $c.data.splice(0, $c.data.length);
    $c._loader = $c._loader || $СпецодеждаСотрудники;//new $Список(appRoutes.url_for('спецодежда/сотрудники'));
    return $c._loader.Clear().Load().then(function(resp){
      $c._loader.Data($c.data);      
    });
    
  };
  

  meth.ToggleSelect = function(profile, select){// bool
    var vm = this;
    if (select === undefined) select = !profile._selected;
    //~ profile._selected = select;
    vm.$set(profile, '_selected', select);
    
    if (profile._selected) {
      //~ $c.data.map(function(it){it._checked = false; if(it.id !== profile.id) it._selected=false;});// сбросить крыжики
      //~ profile._checked = true;
      vm.$set(profile, '_checked', true);
    }
  };
  
  var timeoutSearch;
  const FilterSearch  = function(profile, index){///
    let vm = this.vm;
    let re = this.re;
    let visib = re ? re.test(profile.names.join(' ')) /*|| profile.tel.some(FilterTel, re)*/ : true;
    return visib;
    //~ vm.$set(profile, '_hide', !visib);
    //~ if (visib) this['индексы'].push(index);
  };
  const TimeoutSearch = function() {///внутри таймаута
    let vm = $c.vue;
    if (!vm.filter['ФИО']) {
      //~ vm.dataFiltered.splice(0, vm.dataFiltered.length);
      vm.dataFiltered = vm.data;
    } else {
      let re = new RegExp(vm.filter['ФИО'],"i");
      vm.dataFiltered =  vm.data.filter(FilterSearch, {"vm": vm, "re": re,});
    }
    timeoutSearch = undefined;
  };
  
  meth.ChangeFilterSearch = function(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['ФИО'] = event;
      return TimeoutSearch();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(TimeoutSearch, 500);
  };
  
  /*comp.dataFiltered = function(){
    console.log("dataFiltered");
    
    if (!vm.dataFiltered) {
      //~ vm.dataFiltered = [];
      vm.dataFiltered = vm.data;
      //~ Array.prototype.push.apply(vm.dataFiltered, vm.data);
    }
    if (timeoutSearch) {
      $timeout.cancel(timeoutSearch);
      timeoutSearch = $timeout(vm.TimeoutSearch, 500);
    }
    
    return vm.dataFiltered;
    
    //~ let re = vm.filter['ФИО'] ? new RegExp(vm.filter['ФИО'],"i") : undefined;
    //~ return re ? vm.data.filter(function(item){
      //~ return re.test(item.names.join(' '));
    //~ }) : vm.data;
  };*/
  
  meth.ChangeRadio = function(event){
    let vm = this;
    //~ console.log("ChangeRadio", vm.selected_radio === event.target._value);
    if ($c.prev_selected_radio) $c.vue.$set($c.prev_selected_radio, '_selected', false);
    $c.vue.$set(vm.selected_radio, '_selected', true);
    $c.prev_selected_radio = vm.selected_radio;
    //~ console.log("ChangeRadio", event, angular.copy($c.selected_radio));
    $rootScope.$broadcast("Выбран сотрудник", vm.selected_radio);
  };
  
  meth.ClickRadio = function(event, profile){
    let vm = this;
    //~ console.log("ClickRadio", vm.selected_radio === /*event.target._value*/ profile);
    if (vm.selected_radio === /*event.target._value*/ profile) {
      vm.selected_radio = undefined;
      $rootScope.$broadcast("Выбран сотрудник", vm.selected_radio);
    }
  };
  
};

const Data  = function($Список, appRoutes){
  return new $Список(appRoutes.url_for('спецодежда/сотрудники'));
};

/*=====================================================================*/

module

.component('profilesList', {
  controllerAs: '$c',
  templateUrl: "спецодежда/сотрудники/список",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Controll
})

.factory('$СпецодеждаСотрудники', Data)

;

}());