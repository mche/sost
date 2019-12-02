(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Отгрузка::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Химия::Отгрузка::Форма', 'Химия::Контрагенты', ]);

module
.factory('$КомпонентХимияОтгрузкаТаблица', function($templateCache, appRoutes, $q, $http, $КомпонентХимияОтгрузкаФорма, $ХимияКонтрагенты, $EventBus /*$timeout,$rootScope, $Список, /**$compile, Util */) {// factory

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
  $q.all([vm.LoadData(), $ХимияКонтрагенты.Load()]).then(function(){
    vm.contragentData = $ХимияКонтрагенты.$Data();
    vm.tableColsId.push(...Object.keys(vm['$контрагенты/id']).sort(vm.SortContragent));
    vm.tableColsId.reduce((a, c)=>{a.push(c,c); return a;}, vm.tableColsId2);///пары колонок 
    vm.tableRows.push(...Object.keys(vm['$номенклатура']).sort(vm.SortNomen).map(nid => vm['$номенклатура'][nid]));
    vm.ready = true;
  });
  return {
    "ready": false,
    "tableData": {},
    "tableColsId": [], /// для колонок
    "tableColsId2": [],///пары ид1,ид1,ид2,ид2...
    "tableRows": [], /// для строк уже есть объекты
    "openForm": undefined,
    "selectedRow": undefined,
  };
};

const util = {
  IsEqualId(it){ return (it.id || it) == this.id; },
  
};

const methods = {

SortContragent(a,b){
  var v1 = this.contragentData[a].title;
  var v2 = this.contragentData[b].title;
  if (v1 > v2) return 1;
  if (v1 < v2) return -1;
  return 0;
},

SortNomen(a,b){
  var v1 = this['$номенклатура'][a].parents_title.join('')+this['$номенклатура'][a].title;
  var v2 = this['$номенклатура'][b].parents_title.join('')+this['$номенклатура'][b].title;
  if (v1 > v2) return 1;
  if (v1 < v2) return -1;
  return 0;
},
  
LoadData(){
  var vm = this;
  return $http.post(appRoutes.urlFor('химия/отгрузка/сводка'), {"дата": vm.param['дата']})
    .then(function(resp){
      vm['$контрагенты/id'] = {}; /// для колонок
      vm['$номенклатура'] = {}; /// для строк уже объекты
      
      resp.data.map(function(data){
        var nid = data['номенклатура/id'];
        var kid = data['контрагент/id'];
        vm['$контрагенты/id'][kid] = true;
        if (!vm['$номенклатура'][nid]) vm['$номенклатура'][nid] = data['@отгрузка/позиции'][0]['$продукция или сырье']['$номенклатура'];
        if (!vm.tableData[nid]) vm.tableData[nid] = {};
        if (!vm.tableData[nid]['итого']) vm.tableData[nid]['итого'] = {};

        data['@отгрузка/позиции'].reduce((a, c) => {
          //~ a[c['продукция или сырье/id']] = a[c['продукция или сырье/id']] || {};
          a[c['$продукция или сырье']['ед']] = (a[c['$продукция или сырье']['ед']] || 0)+c['количество'];
          //~ c._edit = false;//// траблы с реактивностью для редактирования
          return a;
        }, vm.tableData[nid]['итого']);
        
        vm.tableData[nid][kid] = data;///['@отгрузка/позиции'][0];
      });
      
      //~ console.log("tableData", vm.tableData, vm['$номенклатура']);
    },
    function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      //~ vm.cancelerHttp = undefined;
    }
  );
  
},

Add(){
  var vm = this;
  vm.openForm={"дата": vm.param['дата']};
},

Edit(pos){
  var vm = this;
  //~ this.$set(pos, '_edit', {"id": pos['отгрузка/id']});!!! ТРАБЛЫ
  //~ pos._edit = {"id": pos['отгрузка/id']};
  //~ console.log("Edit", pos);
  vm.LoadItem(pos['отгрузка/id']).then(function(item){
    vm.openForm=item;
  });
},

LoadItem(id){/// из сводки трудно выделить целиком запись отгрузки
  var vm = this;
  return $http.post(appRoutes.urlFor('химия/отгрузка'), {"id": id})
    .then(function(resp){
      return resp.data;
    },
    function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 5000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      //~ vm.cancelerHttp = undefined;
    }
  );
  
},

OnSaveForm(data){/// событие из формы отмена/сохранено
  var vm = this;
  if (vm.openForm) vm.openForm = undefined;
  //~ console.log("OnSaveForm", data);
  if (data) setTimeout(()=>{
    vm.$emit('do-reload', data);
    vm.ready = false;
            $EventBus.$emit('Обновить контрагентов');
        $EventBus.$emit('Обновить текущие остатки сырья');
        $EventBus.$emit('Обновить текущие остатки продукции');
  });

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
  $Компонент.template = $templateCache.get('компонент/химия/отгрузка/таблица');/// только в конструкторе
  $Компонент.components['v-form'] = new $КомпонентХимияОтгрузкаФорма();
  return $Компонент;
};

return $Конструктор;
});

})();