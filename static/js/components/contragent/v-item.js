(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентКонтрагент(),
      ...
    }
  })
  
*/
var moduleName = "Компонент::Контрагент";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Util', 'Компонент::Поиск в списке', /*'Компонент::Выбор в списке',*//*'EventBus'*/ ]);

module
.factory('$КомпонентКонтрагент', function($templateCache, $timeout, Util, $КомпонентПоискВСписке, /*$КомпонентВыборВСписке,*/ /*$http, $rootScope, /**$compile, appRoutes, Util $EventBus*/) {// factory

const  props  = {
"item": Object,
  //~ type: Object,
    //~ default: function () {
      //~ return {id: undefined, title: '',};
    //~ },
//~ },
"data": Array,
"param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};

const util = {
MapSuggest(item){
  return item.value;
},
FilterData(item){
  //~ if (!this.array_id) return true;
  return this.array_id.some(function(id){ return id == item.id; });// '!'+id != item.id && 
},
MapData(item) {
  var value = item.title;
  //~ if (!!item['проект/id'] && !util.re.star.test(item.title)) item.title = ' ★ ' + item.title;
  if (!!item['проект/id'] /*&& !util.re.star.test(item.title)*/) value = ' ★ ' + value;
  if (/*this.vm.param['АТИ'] && !util.re.ATI.test(value) &&*/ item['АТИ']) value = value + '(АТИ '+ item['АТИ'] + ')';
  return {title: value, data: item, _match: item.title};
},

SortData(a, b) {
  if (!!a.data['проект/id'] && !b.data['проект/id']) { return -1; }
  if (!a.data['проект/id'] && !!b.data['проект/id']) { return 1; }
  if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
  if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
  return 0;
},

IsEqualId(it){ return (it.id || it) == this.id; },

CleanString(str){
  return str.toLowerCase().replace(util.re.star, '').replace(util.re.OOO, '').replace(util.re.trash, '').replace(util.re['space2+'], ' ').trim();
},

/*FilterSuggest(item){
  return util.CleanString(item.value).indexOf(this.match) !== -1;
},*/
re: {
  "ATI": /АТИ/i,
  "star": /^\s*★\s*/,
  "OOO": /[^\w\u0400-\u04FF]*(?:ип|ооо|зао)[^\w\u0400-\u04FF]*/gi, /// \b не работает
  //~ "OOO": /^\s*(?:ип|ооо|зао)\s*/gi,
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space":  / /,
  "space2+": / {2,}/g,
  
},

};/* конец util*/

const methods = {/*методы*/

Autocomplete(){// init input textfield
  var vm = this;
  //~ if(!vm.textField) vm.textField = $('input[type="text"]', $(vm.$el));
  
  var array_id;
  if (vm.form.id && angular.isArray(vm.form.id)) {
    array_id =  vm.item.id;
    vm.form.id = undefined;
  }
 
  //~ vm.autocomplete = [];
  //~ Array.prototype.push.apply(
  vm.autocomplete = (array_id ? vm.data.filter(util.FilterData, {"array_id": array_id}) : vm.data)
    .map(util.MapData, {"vm":vm})
    .sort(util.SortData);
  
  if(vm.form.id && !angular.isArray(vm.form.id)) {
    var item = vm.data.find(util.IsEqualId, {"id": vm.form.id});/*function(item){ return item.id == vm.form.id; }*/
    if(item) vm.SetItem(item);//, $c.onSelect
  }
  
},


SetItem(item, onSelect){
  var vm = this;
  vm.form.title = item.title;
  vm.$set(vm.form, 'id', item.id); /// не понятно
  if (onSelect) vm.$emit('on-select', vm.form);
},

/*meth.ClearInput = function(event){
  var vm = this;
  vm.form = {"title": ''};
  //~ vm.$emit('on-select', vm.form);//$c.onSelect({"item": $c.item});
};*/


/*MapSuggest(items){
  var vm = this;
  vm.lastItems = items;
  //~ console.log("MapSuggest", items);
  return vm.lastItems.map(util.MapSuggest);
},*/

OnSuggestInputChange(query, vmSuggest){///из v-suggest
  var vm = this;
  //~ console.log("onSuggestInputChange", query);
  if (query === null) return; ///vm.MapSuggest(vm.autocomplete);
  if (vm.form.id && vm.form.title != query)  vm.form = {"title": query};
  vm.form.title = query;
  vm.$emit('on-select', vm.form);/// потому что для нового контрагента передать title
  return util.CleanString(query); /// обязательно очищеннный запрос-строка
  //~ if (query == '') return null;
  //~ query = util.CleanString(query);
  //~ if (query.length < 2) return null;
  //~ return vm.MapSuggest(vm.autocomplete.filter(util.FilterSuggest, {"match":query}));  
},

OnSuggestSelect(item, idx, vmSuggest){
  var vm = this;
  //~ var item = vm.lastItems[idx];
  //~ console.log("onSuggestSelect", item, vmSuggest.options);
  if (!item) /*сброс*/ vm.SetItem({"title": ''}, true);
  else if (item.data) vm.SetItem(item.data, true);
  return item.title || '';/// !!! Вернуть строку
  //~ console.log("onSuggestSelect", vm.form, item, vmSuggest.options);
},

}; /** конец methods **/

var computed = {
};/** конец computed **/

const data = function(){
  let vm = this;
  var form  = angular.copy(vm.item);
  if (!form.title) form.title = '';
  //~ if (!form.id) form.id=undefined;
  //~ console.log("data", form);
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "form": form,
    //~ "textField": undefined,
    //~ "autocomplete": undefined,
  };
};

const mounted = function(){
  var vm = this;
  vm.Autocomplete();///init
  vm.ready = true;
  //~ $timeout(function(){
    //~ vm.Autocomplete();
  //~ }, 500);
  
};

var $Компонент = {
  //~ "template": ! в конструкторе
  props,
  data,
  methods,
  computed,
  //~ "created"() { //~ },
  mounted,
  "components": { /*в конструкторе*/ },
};


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/контрагент');/// только в кострукторе
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  //~ $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

}// end Factory
/**********************************************************************/
);

}());