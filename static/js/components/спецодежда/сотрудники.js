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
var module = angular.module(moduleName, ['EventBus']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $timeout, $element,/* $rootScope, $templateCache, appRoutes,*/ $СпецодеждаСотрудники, $EventBus){
  var $c = this;
  var meth = {/*методы Vue*/};
  //~ var comp = {/* computed*/};
  $EventBus.$on("Отметить сотрудников", function(profilesId){// массив
    //~ console.log("Отметить сотрудников", profilesId);
    if ($c.vue.selectedProfiles) $c.vue.selectedProfiles.map(function(pid){/// сбросить предыдущих
      $c.vue.$set($c.$профили[pid], '_selected', false);
    });
    
    $c.vue.ClickSelectedProfiles(false);
    
    if (profilesId) profilesId.map(function(pid){
      $c.vue.$set($c.$профили[pid], '_selected', true);
      //~ $c.vue.selectedRadio = undefined;
    });
  
    $c.vue.selectedProfiles = undefined;
    $timeout(function(){// анимация
      $c.vue.selectedProfiles = profilesId;
      if (profilesId && profilesId.length) $c.vue.ClickSelectedProfiles(true);
    });
    
  });
  
  //~ $EventBus.$on("Сбросить выбор сотрудника", function(){
    //~ $c.vue.selectedRadio = undefined;
  //~ });
  
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
              "filter": {"ФИО": '', "профили": undefined, },
              //~ "data": $c.data,
              "dataFiltered": $c.data,
              "selectedRadio": undefined,///input type=radio
              "selectedProfiles": undefined,/// массив ИДов
            };
          },
          "mounted"(){
            var vm = this;
            $timeout(function() {
              var list = $('ul.profiles', $(vm.$el));
              var top = list.offset().top+5;
              list.css("height", 'calc(100vh - '+top+'px)');
            });
            
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
    $c.$профили = $c.$профили || {};
    $c.data.splice(0, $c.data.length);
    $c._loader = $c._loader || $СпецодеждаСотрудники;
    return $c._loader.Clear().Load().then(function(resp){
      $c._loader.Data($c.data);
      $c.$профили = $c._loader.$Data();
    });
    
  };
  

  meth.ToggleSelect = function(profile, select){// bool
    var vm = this;
    if (!vm.selectedProfiles) return;
    if (select === undefined) select = !profile._selected;
    //~ profile._selected = select;
    vm.$set(profile, '_selected', select);
    //~ if (vm.selectedProfiles) {
      var idx = vm.selectedProfiles.indexOf(profile.id);
      if (idx >= 0) vm.selectedProfiles.splice(idx, 1);
      else vm.selectedProfiles.push(profile.id);
    //~ }
    $EventBus.$emit("Отметка сотрудника"/*+(select ? '' : ' снята')*/, profile);
    //~ if (profile._selected) {
      //~ vm.$set(profile, '_checked', true);
    //~ }
  };
  
  meth.FilterSelectedProfiles = function(profile){
    let vm = this;
    return !vm.selectedProfiles || vm.selectedProfiles.some(function(pid){ return profile.id == pid; });
  };
  
  var timeoutSearch;
  const Filter  = function(profile, index){///
    let vm = this.vm;
    let reFIO = this.re;
    return (reFIO && reFIO.test(profile.names.join(' '))) || (vm.filter['профили'] && vm.FilterSelectedProfiles(profile));
  };
  const FilteredData = function() {///внутри таймаута
    let vm = $c.vue;
    if (!vm.filter['ФИО'] && !vm.filter['профили']) {
      vm.dataFiltered = $c.data;
    } else {
      let re = vm.filter['ФИО'] ? new RegExp(vm.filter['ФИО'],"i") : undefined;
      vm.dataFiltered =  $c.data.filter(Filter, {"vm": vm, "re": re,});
    }
    timeoutSearch = undefined;
  };
  
  meth.ChangeFilterFIO = function(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['ФИО'] = event;
      return FilteredData();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(FilteredData, 400);
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
  
  meth.ChangeRadio = function(){
    let vm = this;
    //~ console.log("ChangeRadio", vm.selectedRadio === event.target._value);
    //~ if ($c.prev_selectedRadio) $c.vue.$set($c.prev_selectedRadio, '_selected', false);
    //~ if (vm.selectedRadio) $c.vue.$set(vm.selectedRadio, '_selected', true);
    //~ $c.prev_selectedRadio = vm.selectedRadio;
    //~ console.log("ChangeRadio", event, angular.copy($c.selectedRadio));
    $EventBus.$emit("Выбран сотрудник", vm.selectedRadio);
  };
  
  meth.ClickRadio = function(profile){
    let vm = this;
    //~ console.log("ClickRadio", vm.selectedRadio === /*event.target._value*/ profile);
    if (vm.selectedRadio === /*event.target._value*/ profile) {
      vm.selectedRadio = undefined;
      vm.ChangeRadio();
    }
  };
  
  meth.ClickSelectedProfiles = function(val){
    let vm = this;
    vm.filter['профили'] = val === undefined ? !vm.filter['профили'] : val;
    FilteredData();
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