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

module
.factory('$КомпонентСпецодеждаСотрудники',  function($http, $timeout, $templateCache, /* $rootScope, appRoutes,*/ $СпецодеждаСотрудникиДанные, $EventBus){
  //~ var $c = this;
const props = ['param'];
const data = function () {
  let vm = this;
  return {
    "ready": false,
    "filter": {"ФИО": '', "профили": undefined, },
    "dataFiltered": [],
    "selectedRadio": undefined,///input type=radio
    "selectedProfiles": undefined,/// массив ИДов
  };
};

var timeoutSearch;
const util = {
  FilterProfile(profile, index){///
    let vm = this.vm;
    let reFIO = this.re;
    return (reFIO && reFIO.test(profile.names.join(' '))) || (vm.filter['профили'] && vm.FilterSelectedProfiles(profile));
  },
};
  const methods = {/*методы Vue*/
  //~ var comp = {/* computed*/};
  EventBus(){
    let vm = this;
    $EventBus.$on("Отметить сотрудников", function(profilesId){// массив
      //~ console.log("Отметить сотрудников", profilesId);
      if (vm.selectedProfiles) vm.selectedProfiles.map(function(pid){/// сбросить предыдущих
        vm.$set(vm.$профили[pid], '_selected', false);
      });
      
      vm.ClickSelectedProfiles(false);
      
      if (profilesId) profilesId.map(function(pid){
        vm.$set(vm.$профили[pid], '_selected', true);
        //~ vm.selectedRadio = undefined;
      });
    
      vm.selectedProfiles = undefined;
      $timeout(function(){// анимация
        vm.selectedProfiles = profilesId;
        if (profilesId && profilesId.length) vm.ClickSelectedProfiles(true);
      });
      
    });
  },
  
  Init(){
    let vm = this;
    vm.EventBus();
    
    vm.LoadData().then(function(){
      vm.dataFiltered = [...vm.data];
      vm.ready = true;
      
      $timeout(function() {
        var list = $('ul.profiles', $(vm.$el));
        var top = list.offset().top+5;
        list.css("height", 'calc(100vh - '+top+'px)');
      });
    });
  },
  
  LoadData(){
    let vm = this;
    vm.data = vm.data || [];
    vm.$профили = vm.$профили || {};
    vm.data.splice(0, vm.data.length);
    //~ vm._loader = $c._loader || $СпецодеждаСотрудники;
    return $СпецодеждаСотрудникиДанные.Clear().Load().then(function(resp){
      $СпецодеждаСотрудникиДанные.Data(vm.data);
      vm.$профили = $СпецодеждаСотрудникиДанные.$Data();
    });
    
  },
  

  ToggleSelect(profile, select){// bool
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
  },
  
  FilterSelectedProfiles(profile){
    let vm = this;
    return !vm.selectedProfiles || vm.selectedProfiles.some(function(pid){ return profile.id == pid; });
  },
  

  FilteredData() {///внутри таймаута
    let vm = this;
    if (!vm.filter['ФИО'] && !vm.filter['профили']) {
      vm.dataFiltered = [...vm.data];
    } else {
      let re = vm.filter['ФИО'] ? new RegExp(vm.filter['ФИО'],"i") : undefined;
      vm.dataFiltered =  vm.data.filter(util.FilterProfile, {"vm": vm, "re": re,});
    }
    timeoutSearch = undefined;
  },
  
  ChangeFilterFIO(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['ФИО'] = event;
      return vm.FilteredData();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(vm.FilteredData, 400);
  },
  
  ChangeRadio(){
    let vm = this;
    $EventBus.$emit("Выбран сотрудник", vm.selectedRadio);
  },
  
  ClickRadio(profile){
    let vm = this;
    //~ console.log("ClickRadio", vm.selectedRadio === /*event.target._value*/ profile);
    if (vm.selectedRadio === /*event.target._value*/ profile) {
      vm.selectedRadio = undefined;
      vm.ChangeRadio();
    }
  },
  
  ClickSelectedProfiles(val){
    let vm = this;
    vm.filter['профили'] = val === undefined ? !vm.filter['профили'] : val;
    vm.FilteredData();
  },
};/*конец methods*/

var $Компонент = {
  props,
  data,
  methods,
  "mounted"() {
    //~ console.log('mounted', this);
    this.Init();
  },
    //~ "mixins": [Vue2Filters.mixin],
  
};

var $Конструктор = function (){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('спецодежда/сотрудники/список');
  return $Компонент;
}; /// конструктор

return $Конструктор;
});/// Factory

/*=====================================================================*/

module.factory('$СпецодеждаСотрудникиДанные', function($Список, appRoutes){
  return new $Список(appRoutes.url_for('спецодежда/сотрудники'));
});



}());