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
var module = angular.module(moduleName, [ 'Util', 'Компонент::Поиск в списке'/*'EventBus'*/ ]);

const Factory = function($templateCache, $timeout, Util, $КомпонентПоискВСписке /*$http, $rootScope, /**$compile, appRoutes, Util $EventBus*/) {// factory

var meth = {/*методы*/};
var comp = {/** computed **/};

meth.Mounted = function(){/// метод
  var vm = this;
  vm.Autocomplete();///init
  vm.ready = true;
  //~ $timeout(function(){
    //~ vm.Autocomplete();
  //~ }, 500);
  
};

const FilterData = function(item){
  //~ if (!this.array_id) return true;
  return this.array_id.some(function(id){ return id == item.id; });// '!'+id != item.id && 
};
const re = {
  "ATI": /АТИ/i,
  "star": /^\s*★\s*/,
  "OOO": /[^\w\u0400-\u04FF]*(?:ип|ооо|зао)[^\w\u0400-\u04FF]*/gi, /// \b не работает
  //~ "OOO": /^\s*(?:ип|ооо|зао)\s*/gi,
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space":  / /,
  "space2+": / {2,}/g,
  
};
const MapData = function(item) {
  if (!!item['проект/id'] && !re.star.test(item.title)) item.title = ' ★ ' + item.title;
  var value = item.title;
  if (!!item['проект/id'] && !re.star.test(item.title)) value = ' ★ ' + value;
  if (this.vm.param['АТИ'] && !re.ATI.test(value) && item['АТИ']) value = value + '(АТИ '+ item['АТИ'] + ')';
  return {value: value, data: item};
};
const SortData = function (a, b) {
  if (!!a.data['проект/id'] && !b.data['проект/id']) { return -1; }
  if (!a.data['проект/id'] && !!b.data['проект/id']) { return 1; }
  if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
  if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
  return 0;
};

/*const LookupFilter = function(suggestion, originalQuery, queryLowerCase, that) {
  /// без пробела по умолчанию
  //~ console.log("lookupFilter", suggestion.value.toLowerCase().replace(re.trash, '').replace(re['space2+'], ' ').trim(), originalQuery, queryLowerCase);
  if (!re.space.test(queryLowerCase)) return $.Autocomplete.defaults.lookupFilter(suggestion, originalQuery, queryLowerCase);
  var match = (' '+queryLowerCase+' ').replace(re.OOO, '').replace(re.trash, '').replace(re['space2+'], ' ').trim();
  //~ console.log("lookupFilter", match);
  //~ console.log(this, "lookupFilter", that.defaults);
  if(!match.length) return false;
  that.hightlight = match;
  
  return suggestion.value.toLowerCase().replace(re.trash, '').replace(re['space2+'], ' ').trim().indexOf(match) !== -1;
};*/
/*const FormatAutocomplete = function (suggestion, currentValue) {//arguments[3] объект Комплит
  var html = arguments[3].options.formatResultsSingle(suggestion, currentValue);
  if (suggestion.data['проект/id']) return $(html).addClass('orange-text text-darken-3').get(0).outerHTML;
  return html;
};*/

meth.Autocomplete = function(){// init input textfield
  var vm = this;
  //~ if(!vm.textField) vm.textField = $('input[type="text"]', $(vm.$el));
  
  var array_id;
  if (vm.form.id && angular.isArray(vm.form.id)) {
    array_id =  vm.item.id;
    vm.form.id = undefined;
  }
 
  //~ vm.autocomplete = [];
  //~ Array.prototype.push.apply(
  vm.autocomplete = (array_id ? vm.data.filter(FilterData, {"array_id": array_id}) : vm.data)
    .map(MapData, {"vm":vm})
    .sort(SortData);
  
  //~ vm.textField.autocomplete({
    //~ "containerCss": vm.param.css && (vm.param.css['autocomplete container'] || vm.param.css['suggestions container']),
    //~ "lookup": vm.autocomplete,
    //~ "lookupFilter": LookupFilter,
    //~ "appendTo": vm.textField.parent(),
    //~ "formatResult": FormatAutocomplete,
    //~ "onSelect": function (suggestion) {
      //~ $timeout(function(){
        //~ vm.SetItem(suggestion.data, true);
        //~ Util.Scroll2El(vm.textField.focus());
      //~ });
    //~ },
    //~ "onSearchComplete": function(query, suggestions){ vm.form._suggests = suggestions; /***if(suggestions.length) $c.item.id = undefined;*/},
    //~ "onHide": function (container) {}
    
  //~ });
  
  if(vm.form.id && !angular.isArray(vm.form.id)) {
    var item = vm.data.find(function(item){ return item.id == vm.form.id; });
    if(item) vm.SetItem(item);//, $c.onSelect
  }
  
};


meth.SetItem = function(item, onSelect){
  var vm = this;
  vm.form = Object.assign({}, item);
  //~ vm.form.title = item.title;
  //~ vm.form.id=item.id;
  vm.form._fromItem = angular.copy(item);
  //~ vm.form['проект/id'] = item['проект/id'];
  //~ if (vm.param['АТИ'])
    //~ vm.form['АТИ'] = item['АТИ'] || item['АТИ title'];//// || ( $c.item._fromItem && ($c.item._fromItem['АТИ'] || $c.item._fromItem['АТИ title']));

  if (onSelect) vm.$emit('on-select', vm.form);
  //~ var ac = vm.textField.autocomplete();
  //~ if  (ac) ac.onBlur();
};

/*meth.ClearInput = function(event){
  var vm = this;
  vm.form = {"title": ''};
  //~ vm.$emit('on-select', vm.form);//$c.onSelect({"item": $c.item});
};*/

comp.acLen = function(){
  return this.autocomplete && this.autocomplete.length;
};

const CleanString = function(str){
  return str.toLowerCase().replace(re.star, '').replace(re.OOO, '').replace(re.trash, '').replace(re['space2+'], ' ').trim();
};
const FilterSuggest = function(item){
  return CleanString(item.value).indexOf(this.match) !== -1;
};
const MapSuggest = function(item){
  return item.value;
};
meth.MapSuggest = function(items){
  var vm = this;
  vm.lastItems = items;
  //~ console.log("MapSuggest", items);
  return vm.lastItems.map(MapSuggest);
};
meth.OnSuggestInputChange = function(query, vmSuggest){
  var vm = this;
  //~ console.log("onSuggestInputChange", query);
  if (query === null) return vm.MapSuggest(vm.autocomplete);/// ToggleAll
  if (vm.form.id && vm.form.title != query)  vm.form = {"title": query};
  vm.form.title = query;
  vm.$emit('on-select', vm.form);/// потому что для нового контрагента передать title
  
  if (query == '') return null;
    //~ vm.ClearInput();
  
  query = CleanString(query);
  if (query.length < 2) return null;
  return vm.MapSuggest(vm.autocomplete.filter(FilterSuggest, {"match":query}));  
};

meth.OnSuggestSelect = function(val, idx, vmSuggest){
  var vm = this;
  var item = vm.lastItems[idx];
  console.log("onSuggestSelect", item, vmSuggest.extendedOptions);
  vm.SetItem(item.data, true);
  
};

meth.OnKeyDown = function(){
  var vm = this;
  //~ console.log("OnKeyDown", arguments);
  
};



var $Компонент = {
  //~ "template": $templateCache.get('компонент/дерево/список'), ! в конструкторе
  "props": {
    "item": Object,
    "data": Array,
    "param": {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  "data"() {
    let vm = this;
    var form  = angular.copy(vm.item);
    if (!form.title) form.title = '';
    //~ console.log("data", vm.data);
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "form": form,
      //~ "textField": undefined,
      //~ "autocomplete": undefined,
    };
    //);
  },
  "methods": meth,
  "computed": comp,
  //~ "created"() { //~ },
  "mounted"() {
    this.Mounted();
  },
  "components": { /*в конструкторе*/ },
};


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/контрагент');/// только в кострукторе
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентКонтрагент', Factory);

}());