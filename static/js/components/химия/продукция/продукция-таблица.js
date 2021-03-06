(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Продукция::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Химия::Продукция::Форма', 'Химия::Продукция::Остатки', 'Химия::Продукция::Движение', ]);

module
.factory('$КомпонентХимияПродукцияТаблица', function($templateCache, appRoutes, $http, $КомпонентХимияПродукцияФорма, $ХимияПродукцияТекущиеОстатки, $ХимияПродукцияДвижение /*$timeout,$rootScope, $Список, /**$compile, Util $EventBus*/) {// factory

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
    vm.MountModal();
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
    "modalHistoryItem": undefined,///история движения
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
      vm.tableData = resp.data;
      //~ vm.tableData$ = resp.data.reduce((a,c)=>{a[c.id]=c; return a;}, {});
    });
  
},

OstatData(){
  var vm = this;
  return $ХимияПродукцияТекущиеОстатки.Load().then(function(){
    $ХимияПродукцияТекущиеОстатки.$Data(vm.ostatData$);
    vm.ostatData = $ХимияПродукцияТекущиеОстатки.Data();
    
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
  return $http.post(appRoutes.urlFor('химия/продукция/таблица'), {"id": id})
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
      if (data['удалить']  || (data['номенклатура/id'] &&  f['номенклатура/id'] != data['номенклатура/id'])) return vm.$emit('do-reload', data);/// vm.tableData.removeOf(f);
      //~ console.log("OnSaveForm", data );
      if (data['дата'] && data['дата'] != vm.param['дата'].replace(/-(\d)$/, '-0$1')) vm.tableData.removeOf(f); /// и еще остаток поверить
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } 
    else {/// новая
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

MountModal(){
  var vm = this;
  //~ vm.$nextTick(() => {
  setTimeout(()=>{
    $('.modal', $(vm.$el)).modal();// {"complete": vm.ModalComplete} Callback for Modal close}
    
  });
  
},

ToggleHistory(item){///ostatData$[item.id]
  var vm = this;
  vm.$set(item || vm.modalHistoryItem, '_history', !(item || vm.modalHistoryItem)._history);
  vm.modalHistoryItem = item;
  if (item) $('#modal-history-prod').modal('open');
  else $('#modal-history-prod').modal('close');
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

//~ const mounted  = function(){
//~ };

var $Компонент = {
  props,
  data,
  methods,
  computed,
  components: {},
};


const $Конструктор = function (){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент/химия/продукция/таблица');/// только в конструкторе
  $Компонент.components['v-form'] = new $КомпонентХимияПродукцияФорма();
  $Компонент.components['v-history'] = new $ХимияПродукцияДвижение();
  return $Компонент;
};

return $Конструктор;
});

})();