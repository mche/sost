(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаРасходыФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Договоры::Выбор";
try {angular.module(moduleName); return;} catch(e) { }
try {angular.module('Компонент::Выбор в списке');} catch(e) {  console.log("Заглушка модуля [Компонент::Выбор в списке]", angular.module('Компонент::Выбор в списке', [])/*.factory("$КомпонентВыборВСписке", function(){})*/); }///заглушка!

var module = angular.module(moduleName, ['Компонент::Выбор в списке', 'EventBus',  /*'Компонент::Поиск в списке',  'Uploader::Файлы',*/ ]);

module
.factory('$КомпонентАрендаДоговорыВыбор', function($templateCache, $КомпонентВыборВСписке, $EventBus, $АрендаДоговорыДанные, /*$templateCache, $http, $q,$timeout,  appRoutes, $КомпонентПоискВСписке, , Util*//*$КомпонентФайлы */) {// factory


const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "items": {
    type: Array,
    default: function () {
      let items = [];
      let vm = this;
      /// можно прямо $АрендаДоговорыДанные, пофиг
      /*$EventBus.$emit('Дайте список договоров арендаторов', function(loader){/// один раз выполнится
        loader.Load().then(()=>{
          items.push(...loader.Data());
          vm.ready = true;
        });
        });*/

      $АрендаДоговорыДанные.Load().then(()=>{
        items.push(...$АрендаДоговорыДанные.Data());
        vm.ready = true;
      });
      
      //~ console.log("items default", this, items);
      return items;
    },
  },
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};///конец props

const methods = {
  
OnSelect(item, propSelect){/// из компонента выбор из списка 
  this.$emit('on-select', item, propSelect);/// тупо проброс
}, 
  
};/* end methods*/

const data = function() {
  let vm = this;
  vm.templateCache = $templateCache;

  return {//
    "ready": false,
  };

};///конец data

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  //~ computed,
  //~ "created"() {  },
  //~ mounted,
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('выбор договора аренды');
  //~ $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  //~ $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ $Компонент.components['v-runtime-template'] = vRuntimeTemplate;
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/
module
.factory('$АрендаДоговорыДанные', function($Список, appRoutes, $EventBus/*$templateCache, $http, $q,$timeout,  $КомпонентПоискВСписке, , Util*//*$КомпонентФайлы */) {// factory

var contragentContracts = new $Список(appRoutes.url_for('аренда/договоры/список'));

  const re_OOO = /(^|\s)(?:ип|ооо|зао|оао)($|\s)/gi; /// \b не работает
  //~ const re2 = /[^ \-\w\u0400-\u04FF]/gi;
  const re_trash = /[^ \.\-\w\u0400-\u04FF]/gi;
  const re_space2 = / {2,}/g;
  
contragentContracts.OnLoadMap = function(item){
  let title = item.$контрагент.title.toLowerCase().replace(re_trash, '').replace(re_OOO, '').replace(re_space2, ' ').trim();
  item._match = `${ title  } ${ item.$контрагент['реквизиты'] && item.$контрагент['реквизиты']['ИНН'] } ${  item['@помещения'] && item['@помещения'][0]['$объект'].name } ${ item['дата1'] } ${ item['номер'] }`.toLowerCase();
 /// , /*"адрес": item['адрес'],*/ "$помещение": room, "$объект": item['$объект'],});
  ///${ item['@помещения'].map(p=>{ return p['$помещение']['номер-название']; }).join(':') } 
  return item;
};
contragentContracts.Load({/*"договоры на дату": vm.form['дата'],*/ "order_by": " order by  lower(regexp_replace(k.title, '^\W', '', 'g')) "});

$EventBus.$on('Дайте список договоров арендаторов', function(cb){/// этому компоненту эти данные не нужны, но он корневой
    cb(contragentContracts/*.Data()*/);
});

return contragentContracts;

  
});// end Factory
/**********************************************************************/

}());