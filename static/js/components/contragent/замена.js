(function () {'use strict';
/*
  Модуль замены одного контрагента другим
*/

var moduleName = "Контрагенты::Замена";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/  'Контрагенты', 'Компонент::Контрагент',]);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, $http , appRoutes, TemplateCache, $Контрагенты, $КомпонентКонтрагент ) {
  var ctrl = this;
  $Контрагенты.Load();
  
  ctrl.$onInit = function(){
    TemplateCache.split(appRoutes.urlFor('assets', 'контрагенты/замена.html'), 1)
      .then(function(proms){
        //~ $timeout(function(){ ctrl.Vue(); });
        ctrl.Vue(); 
      });
  };
  
const methods = {
  
Ready(){/// метод
  var vm = this;
  vm.ready = true;
  
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
    
    //~ $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
        //~ formatSkipYear: true,// доп костыль - дописывать год при установке
        //~ onSet: function (context) {var s = this.component.item.select; vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-')); console.log("pickadate", this); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      //~ });//{closeOnSelect: true,}
    
    $('.modal', $(vm.$el)).modal();
  });

},

ContragentData(){
  var vm = this;
  return $Контрагенты.Load().then(function(){
    vm.contragentData = $Контрагенты.Data();
  });
},

SelectContragent1(item){
  //~ console.log("SelectContragent1", arguments);
  var k = this.form['контрагенты'][0];
  k.id = item.id;
  k.title = item.title;
},
SelectContragent2(item){
  //~ console.log("SelectContragent2", arguments);
  var k = this.form['контрагенты'][1];
  k.id = item.id;
  k.title = item.title;
},

Valid(){
  var k = this.form['контрагенты'];
  return !!k[0].id && !!k[1].id && k[0].id != k[1].id;
   //~ return this.form['контрагенты'].every((k)=>{ return !!k.id; });
},

Confirm(){
  var vm = this;
  $('#modal-confirm', $(vm.$el)).modal('open');
},

Send(){
  var vm = this;
  vm.ready = false;
  return $http.post(appRoutes.urlFor('заменить контрагента'), vm.form['контрагенты']).then(
    function(resp){
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      if (resp.data.success) {
        Materialize.toast('Успешно выполнено', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
        vm.form['контрагенты'][0].id = undefined;
        vm.form['контрагенты'][0].title = undefined;
        $Контрагенты.RefreshData();
        vm.ContragentData().then(function(){
          vm.Ready();
        });
      }
    },
    function(resp){
      console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.ready = true;
    },
  );
  
},

};/* конец methods */
  
const data = function(){
  
  return {
    "ready": false,
    "form": {"контрагенты": [{"id": undefined}, {"id": undefined}]},
    
  };
};
  
const mounted = function(){
  var vm = this;
  vm.ContragentData().then(function(){
    vm.Ready();
    
  });
};/** конец mounted **/
  
ctrl.Vue = function(){
  var comp = new $КомпонентКонтрагент();
  ctrl.vue = new Vue({
    "el":  $element[0],
    data,
    methods,
    mounted,
    "components": {
      'v-contragent-1': comp,/// {/*"param": $c.param*/}, $c
      'v-contragent-2': comp,
    },
  });
};
  
}

/*=============================================================*/

);

}());