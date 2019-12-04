(function () {'use strict';
/**/
var moduleName = "Химия::Сырье::Движение";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);/// 'EventBus' 
module
.factory('$ХимияСырьеДвижение', function($templateCache, $http,  appRoutes, $Список /*, $EventBus$timeout,$rootScope, , /**$compile, Util */) {// factory


const props = {
  "item": Object,
  "param": {
    "type": Object,
    "default": function(){
      return {};
    },
  },
  
};

const data = function(){
  var vm = this;
  //~ $q.all([vm.LoadData(), vm.OstatData()])
  vm.LoadData().then(function(){
    vm.ready = true;
    
  });
  return {
    "ready": false,
    "tableData": [],
    //~ "tableData$": {},
  };
};

const methods = {

LoadData(){
  var vm = this;
  var loader = new $Список(appRoutes.urlFor('химия/движение сырья'));
  return loader.Load({"id": vm.item.id}).then(function(){
    vm.tableData = loader.Data();
    
  },
  function(resp){
    console.log("Ошибка", resp);
    Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 5000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
  }
  );
  
},
  
};

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  components: {},
};


const $Конструктор = function (){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент/химия/сырье/движение');/// только в конструкторе
  return $Компонент;
};

return $Конструктор;

});///конец factory

})();