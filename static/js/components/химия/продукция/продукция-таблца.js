(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Продукция::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Химия::Продукция::Форма' ]);

module
.factory('$КомпонентХимияПродукцияТаблица', function($templateCache, appRoutes, $http, $КомпонентХимияПродукцияФорма /*$timeout,$rootScope, $Список, /**$compile, Util $EventBus*/) {// factory

const props = {
  "param": {
    "type": Object,
    "default": function(){
      return {};
    },
  },
  
};
  
const data = function(){
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
    
  });
  return {
    "ready": false,
    "tableData": [],
    "newForm": undefined,
    "selectedRow": undefined,
  };
};

const util = {
  IsEqualId(it){ return (it.id || it) == this.id; },
  
};

const methods = {
LoadData(){
  var vm = this;
  return $http.post(appRoutes.urlFor('химия/продукция/таблица'), {"дата": vm.param['дата']})
    .then(function(resp){
      vm.tableData.push(...resp.data);
    });
  
},

Add(){
  var vm = this;
  vm.newForm={"дата": vm.param['дата']};
},
Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},

OnSaveForm(data){/// событие из формы отмена/сохранено
  var vm = this;
  if (vm.newForm) vm.newForm = undefined;
  if (data) {
    var f = vm.tableData.find(util.IsEqualId, data);
    if (f) { /// редакт или удалил
      if (data['удалить']) return vm.tableData.removeOf(f);
      //~ console.log("OnSaveForm", [data['дата'], new Date(data['дата']).toString()], [vm.param['дата'], new Date(vm.param['дата']).toString()] );
      if (data['дата'] != vm.param['дата'].replace(/-(\d)$/, '-0$1')) vm.tableData.removeOf(f); /// и еще остаток поверить
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.tableData.unshift(data);
    }
  }
  
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
  $Компонент.template = $templateCache.get('компонент/химия/продукция/таблица');/// только в конструкторе
  $Компонент.components['v-form'] = new $КомпонентХимияПродукцияФорма();
  return $Компонент;
};

return $Конструктор;
});

})();