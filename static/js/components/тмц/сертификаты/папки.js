(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентТМЦСертификатыПапки({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "ТМЦ::Сертификаты::Папки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Дерево::Список', 'ТМЦ::Сертификаты::Папка::Форма', 'Uploader::Файлы']);

module
.factory('$КомпонентТМЦСертификатыПапки', function($templateCache, $КомпонентДеревоСписок, $Список, appRoutes, $КомпонентТМЦСертификатыПапкаФорма, $КомпонентФайлы, $EventBus) {// factory

const  props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};


const methods = {/*методы*/
LoadData(){/// метод
  var vm = this;
  vm.folders = new $Список(appRoutes.urlFor('тмц/сертификаты/папки', 0));
  //~ vm.folders.Load();
  return vm.folders.Load();
  //~ .then(function(){
    //~ vm.folders = vm.folders.Data();
  //~ });
},

OnSaveNode(node){///  из события сохранения/возникновения записи компонента формы
  console.log("OnSaveNode", node);
},

Files(item){
  item._files = item._files || true;
  console.log("Files", item);
  return true;
}

}; /*конец методы*/


const data = function(){
  let vm = this;
  //~ vm.folders = folders;
  vm.param.selectItemEventName = 'Выбрана папка';
  vm.param.newNode = {"title":'Новая папка'};
  vm.LoadData().then(function(){
    vm.ready = true;
  });
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
      "ready": false,
      //~ "selectedFolder": {},
    "selectedRowTMC": undefined,
      //~ "param": ,
    };
  //);
  
};

const mounted = function() {
  //~ console.log('mounted', this);
  var vm = this;

};

const created = function(){
  //~ console.log("created", this.param.selectItemEventName);
  var vm = this;
  $EventBus.$on(this.param.selectItemEventName, function(items){
    console.log('Выбрана папка', items.map(function(it){ return it.title; }));
    //~ if (vm.selectedItem && vm.selectedItem.id != (item && item.parent && (item.parent.id || item.parent))) vm.$set(vm.selectedItem, '_expand', false);
    //~ vm.selectedItem = item;
  });
   $EventBus.$on('Выбрана строка ТМЦ', function(row){
      //~ console.log("Выбрана строка ТМЦ", row);
     vm.selectedRowTMC = row;
    });
  
};

//~ const computed  = {
//~ Param(){
  //~ return Object.assign({}, this.param);
  
//~ },
  
//~ };

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  //~ computed,
  created,
  mounted,
  "components": {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  if (!$Компонент.template)  $Компонент.template = $templateCache.get('тмц/сертификаты/папки');
  $Компонент.components = {
    'v-tree-list': new $КомпонентДеревоСписок(/*new $КомпонентТМЦСертификатыПапкаФорма()*/),
    'v-uploads': new $КомпонентФайлы(),
    //~ 'v-item-form': new $КомпонентТМЦСертификатыПапкаФорма(),
  };
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());