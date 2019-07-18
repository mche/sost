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

const Factory = function($http, $timeout, $templateCache, /* $rootScope, appRoutes,*/ $СпецодеждаСотрудникиДанные, $EventBus){
  //~ var $c = this;
  var meth = {/*методы Vue*/};
  //~ var comp = {/* computed*/};
  meth.EventBus = function(){
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
  };
  
  meth.Init = function(){
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
  };
  
  meth.LoadData = function(){
    let vm = this;
    vm.data = vm.data || [];
    vm.$профили = vm.$профили || {};
    vm.data.splice(0, vm.data.length);
    //~ vm._loader = $c._loader || $СпецодеждаСотрудники;
    return $СпецодеждаСотрудникиДанные.Clear().Load().then(function(resp){
      $СпецодеждаСотрудникиДанные.Data(vm.data);
      vm.$профили = $СпецодеждаСотрудникиДанные.$Data();
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
  
  meth.FilteredData = function() {///внутри таймаута
    let vm = this;
    if (!vm.filter['ФИО'] && !vm.filter['профили']) {
      vm.dataFiltered = [...vm.data];
    } else {
      let re = vm.filter['ФИО'] ? new RegExp(vm.filter['ФИО'],"i") : undefined;
      vm.dataFiltered =  vm.data.filter(Filter, {"vm": vm, "re": re,});
    }
    timeoutSearch = undefined;
  };
  
  meth.ChangeFilterFIO = function(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['ФИО'] = event;
      return vm.FilteredData();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(vm.FilteredData, 400);
  };
  
  meth.ChangeRadio = function(){
    let vm = this;
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
    vm.FilteredData();
  };

return /*конструктор*/function (data){
  let $this = this;
  data = data || {};
  
  return {
    "template": $templateCache.get('спецодежда/сотрудники/список'),
    "props": ['param'],
    "data": function () {
      let vm = this;
      return {
        "ready": false,
        "filter": {"ФИО": '', "профили": undefined, },
        "dataFiltered": [],
        "selectedRadio": undefined,///input type=radio
        "selectedProfiles": undefined,/// массив ИДов
      };
    },
    "methods": meth,
    /*"computed": {
      "edit": function(){
        return this.InitItem(angular.copy(this.item));
      }
    },*/
    "created"() {},
    "mounted"() {
      //~ console.log('mounted', this);
      this.Init();
    },
    //~ "mixins": [Vue2Filters.mixin],
  };
}; /// конструктор
};/// Factory


const Data  = function($Список, appRoutes){
  return new $Список(appRoutes.url_for('спецодежда/сотрудники'));
};

/*=====================================================================*/

module

//~ .component('profilesList', {
  //~ controllerAs: '$c',
  //~ templateUrl: "спецодежда/сотрудники/список",
  //~ bindings: {
    //~ param: '<',
    //~ data: '<',

  //~ },
  //~ controller: Controll
//~ })

.factory('$КомпонентСпецодеждаСотрудники', Factory)
.factory('$СпецодеждаСотрудникиДанные', Data)

;

}());