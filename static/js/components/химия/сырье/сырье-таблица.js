(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Сырье::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Химия::Сырье::Форма', 'Химия::Сырье::Остатки', 'Химия::Сырье::Движение', ]);

module
.factory('$КомпонентХимияСырьеТаблица', function($templateCache, appRoutes, $http, $q, $КомпонентХимияСырьеФорма, $ХимияСырьеТекущиеОстатки, $ХимияСырьеДвижение /*$timeout,$rootScope, $Список, /**$compile, Util $EventBus*/) {// factory

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
  //~ $q.all([vm.LoadData(), vm.OstatData()])
  vm.LoadData().then(function(){
    vm.ready = true;
    
  });
  vm.OstatData();
  return {
    "ready": false,
    "tableData": [],
    //~ "tableData$": {},
    "ostatData$": {},
    "ostatData": [],
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
  return $http.post(appRoutes.urlFor('химия/сырье/таблица'), {"дата": vm.param['дата']})
    .then(function(resp){
      vm.tableData = resp.data;
      //~ vm.tableData$ = resp.data.reduce((a,c)=>{a[c.id]=c; return a;}, {});
    });
  
},

OstatData(){
  var vm = this;
  return $ХимияСырьеТекущиеОстатки.Load().then(function(){
    $ХимияСырьеТекущиеОстатки.$Data(vm.ostatData$);
    vm.ostatData = $ХимияСырьеТекущиеОстатки.Data();
    
  });
},

Add(){
  var vm = this;
  vm.newForm={"дата": vm.param['дата']};
},
Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},
EditOstat(item){
  var vm = this;
  vm.LoadOstatItem(item.id).then(function(it){
    
    //~ vm.openForm=item;
    vm.$set(item, '_edit', it);
    //~ console.log("EditOstat", item);
  });
},

LoadOstatItem(id){///позиция прошлой продукции по остатку
  var vm = this;
  return $http.post(appRoutes.urlFor('химия/сырье/таблица'), {"id": id})
    .then(function(resp){
      return resp.data[0];
    },
    function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 5000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
  );
},

OnSaveForm(data){/// событие из формы отмена/сохранено
  var vm = this;
  if (vm.newForm) vm.newForm = undefined;
  if (data) {
    var f = vm.tableData.find(util.IsEqualId, data);
    if (f) { /// редакт или удалил
      if (!data['отмена']) return vm.$emit('do-reload', data);
      
      if (data['удалить'] || (data['номенклатура/id'] &&  f['номенклатура/id'] != data['номенклатура/id'])) return vm.$emit('do-reload', data);///tableData.removeOf(f);
      if (data['дата'] && data['дата'] != vm.param['дата'].replace(/-(\d)$/, '-0$1')) /*console.log("vm.tableData.removeOf(f)", data['дата'], vm.param['дата'].replace(/-(\d)$/, '-0$1'), */vm.tableData.removeOf(f); /// и еще остаток поверить
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.tableData.unshift(data);
    }
  }
  
},

OnSaveOstat(data){///
  var vm = this;
  var f = vm.ostatData.find(util.IsEqualId, data);
  if (f) {///редакт остат
    if (!data['отмена']) return vm.$emit('do-reload', data);
    if (f._edit) f._edit = undefined;
  }
},
  
};

const computed = {
  TableData$(){
    return this.tableData.reduce((a,c)=>{a[c.id]=c; return a;}, {});
  },
  IsPrevOstat(){
    return this.ostatData.some(item => !this.TableData$[item.id]  && item['остаток'] > 0);
  },
};

var $Компонент = {
  props,
  data,
  methods,
  computed,
  components: {},
};


const $Конструктор = function (){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент/химия/сырье/таблица');/// только в конструкторе
  $Компонент.components['v-form'] = new $КомпонентХимияСырьеФорма();
  $Компонент.components['v-history'] = new $ХимияСырьеДвижение();
  return $Компонент;
};

return $Конструктор;
});

})();