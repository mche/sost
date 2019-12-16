(function () {'use strict';
/*
*/
var moduleName = "Компонент::Отпуск::Календарь";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Компонент::Календарь::Год',]);//

module
.factory('$КомпонентОтпускКалендарь',  function($http, appRoutes, $templateCache, $КомпонентКалендарьГод /*$timeout, $rootScope, appRoutes,$EventBus*/ ){
  //~ var $c = this;
const props = {
  "param": {"type": Object, "default": function(){ return {}; }},
  "profile":{"type": Object,},
  
};
const data = function(){
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
    
  });
  return {
    "ready": false,
    "year": undefined,
    "calendarData": {},
    "moneyData": [],
  };
};

const methods = {

LoadData(){
  var vm = this;
  return $http.post(appRoutes.urlFor('отпуск сотрудника'), {"id": vm.profile.id}).then(
    function(resp){
      vm.calendarData = resp.data.shift();
      vm.moneyData = resp.data.shift()['@суммы по месяцам'];
      if (vm.calendarData) vm.ChangeYear(Object.keys(vm.calendarData).pop());
      if (vm.moneyData) vm.sum = vm.moneyData.reduce((s,m)=>{ s[0]+=parseFloat(m['начислено']); s[1]+=parseFloat(m['дней в месяце']); return s;}, [0, 0]);/// две суммы
    }
  );
  
},
ChangeYear(y){
  this.year = y;
},

ToggleDate(dateInfo){
  console.log(dateInfo);
},
  
}; /* конец methods */

const computed = {
  Years(){
    return Object.keys(this.calendarData);
  }
  
};

var $Компонент = {
  props,
  data,
  methods,
  computed,
  components: {},
};


const $Конструктор = function(){
  let $this = this;
  $Компонент.template = $Компонент.template || $templateCache.get('компонент/отпуск/календарь');/// только в конструкторе
  if (!$Компонент.components['year-calendar'])   $Компонент.components['year-calendar'] = new $КомпонентКалендарьГод();
  return $Компонент;
};

return $Конструктор;
});

})();