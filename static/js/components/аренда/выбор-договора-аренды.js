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
  //~ $Компонент.template = $templateCache.get('выбор договора аренды');
  //~ let r = Vue.compile($templateCache.get('выбор договора аренды'));
  //~ $Компонент.render = r.render; ///function(){ return r.render();};
  //~ $Компонент.render = ()=>{var s=this,t=s.$createElement,_c=t; return [_c('img',{attrs:{"alt":"Vue logo","src":"assets/logo.png"}}),s._v(" "),_c('Hello',{attrs:{"msg":"Welcome to Vue"}})]};
  $Компонент.render = function(){var s=this,t=s.$createElement,e=s._self._c||t;return s.ready?e("v-select",{attrs:{select:s.item,items:s.items,param:{placeholder:"поиск договора арендатора",ulDropDownClass:["striped teal lighten-4"]}},on:{"on-select":s.OnSelect},scopedSlots:s._u([{key:"selected",fn:function(t){var a=t.selected;return[a?e("h3",{staticClass:"animated hover-bottom-shadow-blue-darken-3-000 relative slideInRight",class:{"maroon-text ":a["архив?"],"teal-text text-darken-4":!a["архив?"]}},[e("i",{directives:[{name:"show",rawName:"v-show",value:a["архив?"],expression:"selected['архив?']"}],staticClass:"material-icons"},[s._v("lock")]),s._v(" "),e("span",{staticClass:"chip000 fw500 nowrap padd-0-05"},[s._v(s._s(a.$контрагент.title))]),s._v(" "),e("span",{directives:[{name:"show",rawName:"v-show",value:a.$контрагент["реквизиты"]&&a.$контрагент["реквизиты"]["ИНН"],expression:"selected.$контрагент['реквизиты'] && selected.$контрагент['реквизиты']['ИНН']"}],staticClass:"chip000 fs10 nowrap padd-0-05"},[e("span",{staticClass:"fs8 grey-text"},[s._v("ИНН:")]),s._v(" "+s._s(a.$контрагент["реквизиты"]["ИНН"]))]),s._v(" "),e("span",{staticClass:"chip000 nowrap padd-0-05",attrs:{title:"номер договора"}},[e("span",{staticClass:"fs8-000 grey-text"},[s._v("дог. №")]),s._v(" "+s._s(a["номер"].replace("№",""))+" "),e("span",{staticClass:"fs8-000 grey-text"},[s._v("от")]),s._v(" "+s._s(a["дата договора"]||a["дата1"])+" ")]),s._v(" "),e("span",{staticClass:"chip000 fs10-000 nowrap padd-0-05",attrs:{title:"объект и помещения"}},[e("span",[e("i",{staticClass:"fs10 material-icons"},[s._v("place")])]),s._v(" "),e("span",[s._v(s._s(a["@помещения"]&&a["@помещения"][0]&&a["@помещения"][0].$объект.name))])])]):e("h4",{staticClass:"grey-text"},[s._v("Выбрать договор арендатора")])]}},{key:"listItem",fn:function(t){var a=t.listItem,i=t.selected,l=t.highlighted;return[e("h5",{staticClass:"hover-shadow3d padd-0-05 relative",class:{"maroon-text":a["архив?"],"teal-text text-darken-4":!a["архив?"],"bold fs12":a===i,fw500:a===l,nowrap:a!==i}},[e("i",{directives:[{name:"show",rawName:"v-show",value:a["архив?"],expression:"listItem['архив?']"}],staticClass:"fs10 material-icons"},[s._v("lock")]),s._v(" "),e("span",{staticClass:"chip padd-0-05"},[s._v(s._s(a.$контрагент.title))]),s._v(" "),e("span",{staticClass:"chip fs8 padd-0-05"},[e("span",{staticClass:"fs8 grey-text"},[s._v("ИНН:")]),s._v(" "+s._s(a.$контрагент["реквизиты"]&&a.$контрагент["реквизиты"]["ИНН"]))]),s._v(" "),e("span",{staticClass:"chip padd-0-05",attrs:{title:"номер договора"}},[e("span",{staticClass:"fs8-000 grey-text"},[s._v("дог.")]),s._v(" № "+s._s(a["номер"].replace("№",""))+" от "+s._s(a["дата договора"]||a["дата1"]))]),s._v(" "),e("span",{staticClass:"chip padd-0-05",attrs:{title:"объект и помещения"}},[e("span",[e("i",{staticClass:"fs10 material-icons"},[s._v("place")])]),s._v(" "),e("span",{staticClass:"fs8"},[s._v(s._s(a["@помещения"]&&a["@помещения"][0]&&a["@помещения"][0].$объект.name))])])])]}}])}):e("v-progress-indeterminate",{attrs:{color:"teal",message:"Загружается..."}})};
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