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
var module = angular.module(moduleName, []);

const Factory = function($templateCache, $http, $timeout, appRoutes) {// factory

let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
  });
};

meth.Valid = function(){
  var form = this.form;
  return form['адрес'] && form['адрес'].length
    && this.ValidRooms('номер-название') && this.ValidRooms('этаж') && this.ValidRooms('площадь');
  ;
};

meth.CancelBtn = function(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
};

const IsValidRoom = function(room){
  return !!room[this.name];
};
meth.ValidRooms = function(name){///проверка строк кабинетов
  var form = this.form;
  if (!form["@кабинеты"] || !form["@кабинеты"].length) return true;
  return form["@кабинеты"].every(IsValidRoom, {"name": name});
  
};
const reqFields = ['номер-название', 'этаж', 'площадь'];
const IsValidField = function(name){
  return !!this[name];
};
meth.ValidRoom = function(room){
  return reqFields.every(IsValidField, room);
};

meth.AddRoom = function(idx){// индекс вставки, если undefined или -1 - вставка в конец; 0 - в начало
  var vm = this;
  var form = vm.form;
  var n = {};
  
  if (idx === undefined) idx = form["@кабинеты"].length + 1;
    //~ var prevRow = data["@позиции тмц"][ idx === 0 ? idx : (idx < 0 ? data["@позиции тмц"].length - idx : idx-1) ];
    //~ if (prevRow) {
      //~ if (prevRow['$объект'] && prevRow['$объект'].id) n['$объект'] = angular.copy(prevRow['$объект']);
    //~ }
  form['@кабинеты'].splice(idx, 0, n);
};

meth.DeleteRoom = function(room){
  this.form['@кабинеты'].removeOf(room);
};

meth.CopyRoom = function(room){
  var vm = this;
  var copy = angular.copy(room);
  var idx = vm.form['@кабинеты'].indexOf(room);
  if (idx < 0) return;
  copy.id = undefined;
  vm.form['@кабинеты'].splice(idx, 0, copy);
}

meth.Save = function(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить объект'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
    });
};

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  "props": {
      "item": {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  "data"() {
    let vm = this;
    var form = angular.copy(vm.item);
    if (!form["@кабинеты"]) form["@кабинеты"] = [{}];
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "cancelerHttp": undefined,
      "form": form,
      };
    //);
  },
  "methods": meth,
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
  //~ "components": {
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  //~ },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/объект/форма');
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаОбъектФорма', Factory);

}());