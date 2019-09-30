(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаОбъектФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Объект::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Выбор объекта']);

module
.factory('$КомпонентАрендаОбъектФорма',  function($templateCache, $http, $timeout, appRoutes, $КомпонентВыборОбъекта) {// factory

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
};/// конец props

const util = {/*разное*/
  IsValidRoom(room){
    return !!room[this.name];
  },
  reqFields: ['номер-название', 'этаж', 'площадь'],
  IsValidField(name){
    return !!this[name];
  },
}; ///конец util

const methods = {/*методы*/
Ready(){/// метод
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
  });
},

SelectObject(obj){
  console.log("SelectObject", obj);
  
},

Valid(){
  var form = this.form;
  return form['адрес'] && form['адрес'].length
    && this.ValidRooms('номер-название') && this.ValidRooms('этаж') && this.ValidRooms('площадь');
  ;
},

CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

ValidRooms(name){///проверка строк кабинетов
  var form = this.form;
  if (!form["@кабинеты"] || !form["@кабинеты"].length) return true;
  return form["@кабинеты"].every(util.IsValidRoom, {"name": name});
  
},

ValidRoom(room){
  return util.reqFields.every(util.IsValidField, room);
},

AddRoom(idx){// индекс вставки, если undefined или -1 - вставка в конец; 0 - в начало
  var vm = this;
  var form = vm.form;
  var n = {};
  
  if (idx === undefined) idx = form["@кабинеты"].length + 1;
    //~ var prevRow = data["@позиции тмц"][ idx === 0 ? idx : (idx < 0 ? data["@позиции тмц"].length - idx : idx-1) ];
    //~ if (prevRow) {
      //~ if (prevRow['$объект'] && prevRow['$объект'].id) n['$объект'] = angular.copy(prevRow['$объект']);
    //~ }
  form['@кабинеты'].splice(idx, 0, n);
},

DeleteRoom(room){
  this.form['@кабинеты'].removeOf(room);
},

CopyRoom(room){
  var vm = this;
  var copy = angular.copy(room);
  var idx = vm.form['@кабинеты'].indexOf(room);
  if (idx < 0) return;
  copy.id = undefined;
  vm.form['@кабинеты'].splice(idx, 0, copy);
},

Save(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить объект'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
    },
    function(resp){
      console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},

Remove(){
  var vm = this;
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/удалить объект'), {"id": vm.form.id})
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Удалено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      
      vm.$emit('on-save', {"id": resp.data.remove.id, "удалить": true,});
    },
    function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},
}; ///конец методы

const data = function() {
  let vm = this;
  var form = angular.copy(vm.item);
  if (!form["@кабинеты"]) form["@кабинеты"] = [{}];
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "expandRooms": false,
    };
  //);
};///  конец data

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  /*"computed": {
    "edit": function(){
      return this.InitItem(angular.copy(this.item));
    }
  },*/
  //~ "created"() {  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
  "components": {
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/объект/форма');
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());