(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Договор::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Компонент::Контрагент', 'Контрагенты']);

const Factory = function($templateCache, $http, $timeout, appRoutes, $КомпонентКонтрагент, $Контрагенты) {// factory

let meth = {/*методы*/};

meth.Mounted = function(){
  var vm = this;
  vm.ContragentData().then(function(){
    vm.Ready();
  });
};

meth.Ready = function(){/// метод
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
    
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {var s = this.component.item.select; vm.$set(vm.form, 'дата', [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      });//{closeOnSelect: true,}
    
    $('.modal', $(vm.$el)).modal();
  });

};

$Контрагенты.Load();
meth.ContragentData = function(){
  var vm = this;
  return $Контрагенты.Load().then(function(){
    vm.contragentData = $Контрагенты.Data();
  });
};


meth.InitItem = function(item){/// обязательные реактивные поля
  item["дата"] = item["дата"] || (new Date).toISOString().replace(/T.+/, '');
  return item;
};

meth.Save = function(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить договор'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
    });
};

meth.Valid = function(){
  
  return this.form['номер'] && this.form['номер'].length
    && this.form['дата'] && this.form['контрагент'] && (this.form['контрагент'].id || this.form['контрагент'].title)
  ;
};

meth.CancelBtn = function(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
  
};

meth.SelectContragent = function(data){
  console.log("SelectContragent", data);
  
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
    var form = vm.InitItem(angular.copy(vm.item));
    if (!form['контрагент']) form['контрагент'] = {};
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
    this.Mounted();
  },
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('аренда/договор/форма');
  $Компонент.components['v-contragent'] =  new $КомпонентКонтрагент();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаДоговорФорма', Factory);

}());