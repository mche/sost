(function () {'use strict';
/*
  https://github.com/anjaneyasivan/v-suggestions
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'v-suggest': new $КомпонентПоискВСписке(),
      ...
    }
  })
  
  onInputChange 
    1 если передан пропс items - функция возвращает очищенную строку для поиска (или ничего, тогда очистка тут) в items._match
    2 если нет items - функция должна вернуть совпадающие позиции (массив)
  
  onItemSelect - функция возвращает строку которую передать в поле ввода
  
  Пример
  <v-suggest v-model="form.title"  :items=" autocomplete " :param="{placeholder: param.placeholder || 'выбрать или новый контрагент', 'suggestionClass': 'padd-0-05'}" :onInputChange="OnSuggestInputChange" :onItemSelect="OnSuggestSelect">
    <template v-slot:item="{ item, idx }">
      <h5 class="relative"  :class="{'bold fs12': item.title == form.title, 'orange-text text-darken-4': !!item.data['проект/id']}"  style="">
        <span>{{  item.title }}</span>
      </h5>
    </template>
  </v-suggest>
*/
var moduleName = "Компонент::Поиск в списке";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

module
.factory('$КомпонентПоискВСписке', function($templateCache,  /*$timeout,$http, $rootScope, /**$compile, appRoutes, Util $EventBus*/) {// factory

const defaultParam = {
  debounce: 500,///задержка мс
  placeholder: '',
  topClass: 'v-suggestions input-field',
  inputClass: 'input',
  suggestionClass: '',
  suggestionClassStar: 'suggestion-star',
  suggestionsStyle: {"width": '100%'}, ///ширина ограничена полем ввода
  limit: 20,/// записей в списке - пагинация
};

const  props =  {
  "item":{
    "type": Object,
  },
  "items": {
    type: Array,
    //~ default: []
  },
  "param": {
    "type": Object,
    "default": function(){ return {}; },
  },
  "onInputChange": {
    type: Function,
    required: true
  },
  "onItemSelect": {
    type: Function
  },
  "value": {
    type: String,
    required: true
  },
  "allLen":{/// количество всех записей в поиске
    "type": Number,
    "default": 0,
  },
};

const util = {/*разное*/

CleanString(str){
  return str.toLowerCase().replace(util.re.trash, '').replace(util.re['space2+'], ' ').trim();
},

re: {
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space":  / /,
  "space2+": / {2,}/g,
  
},

FilterQuery(it){
  return this.re.test(it._match);
  //~ return it._match.indexOf(this.query) !== -1;
},

}; ///конец util

const methods = {
//~ Mounted(){/// метод
  //~ var vm = this;
  //~ vm.ready = true;
//~ },

HideItems() {
  var vm = this;
  vm.toggleAll = false;
  //~ setTimeout(() => {
  //~ vm.showItems = false;
  //~ console.trace("HideItems");
  vm.queryItems = [];
  if (vm._eventHideItems) $(document).off('click.suggestions', vm._eventHideItems);
  //~ }, 300);
  return vm;
},

SetInputQuery(value) {
  var vm = this;
  
  vm.lastQuery = value;
  vm.inputQuery = value;
},

onKeyDown(e){
  var vm = this;
  //~ vm.$emit('keyDown', e.keyCode, vm.inputQuery);
  switch (e.keyCode) {
    case 40:
      vm.Highlight('down');
      e.preventDefault();
      break;
    case 38:
      vm.Highlight('up');
      e.preventDefault();
      break;
    case 13:
      vm.Select();
      e.preventDefault();
      break;
    case 27:
      //~ vm.showItems = false;
      vm.HideItems();
      e.preventDefault();
      break;
    default:
      vm.QueryItems();
      return true;
  }
},

onBlur(){
  var vm = this;
  //~ HideItems
},

onFocus(){
  var vm = this;
  if (vm.inputQuery.length) vm.QueryItems(true);
  //~ vm.showItems = true;
  //~ vm.$emit('focus',vm);
},

onPaste(event){
  event.preventDefault();
  return false;
},

onInputDblClick(e){
  var vm = this;
   if (vm.inputQuery.length) vm.QueryItems(true);
  else vm.ToggleAll();
  //~ if (vm.inputQuery.length) vm.SetItems(vm.onInputChange(vm.inputQuery, vm));
  //~ else vm.SetItems(vm.onInputChange(null, vm));
  
},

Select(index){ /// уст/сброс позиции
  var vm = this;
  //~ console.log("Select", index, vm.activeItemIndex);
  var idx = index === undefined ? vm.activeItemIndex : index;
  if (idx === -1) return;
  idx = idx + vm.page*vm.extParam.limit;
  var item = vm.queryItems[idx];
  //~ var item = vm.pageItems[idx];
  if (!item)  return;
  //~ if (vm.onItemSelect) 
  var value = vm.onItemSelect ? vm.onItemSelect(item, idx, vm.item, vm) : item;
    //~ vm.SetInputQuery(item);
  //~ } else {
    //~ vm.onItemSelectedDefault(item);
  //~ }
  //~ vm.$emit('input', item);
  vm.SetInputQuery(value);
    //~ this.showItems = false;
  vm.HideItems();
},

Highlight(direction){/// подсветка
  if (this.queryItems.length === 0) return;
  let selectedIndex = this.queryItems.findIndex((item, index) => {
    return index === this.activeItemIndex;
  })
  if (selectedIndex === -1) {
    // nothing selected
    if (direction === 'down') {
      selectedIndex = 0;
    } else {
      selectedIndex = this.queryItems.length - 1;
    }
  } else {
    this.activeIndexItem = 0;
    if (direction === 'down') {
      selectedIndex++;
      if (selectedIndex === this.queryItems.length) {
        selectedIndex = 0;
      }
    } else {
      selectedIndex--;
      if (selectedIndex < 0) {
        selectedIndex = this.queryItems.length - 1;
      }
    }
  }
  this.activeItemIndex = selectedIndex;
  this.activeItem=this.queryItems[selectedIndex];
},

SetItems(items){
  var vm = this;
  vm.queryItems = [];
  if (typeof items === 'undefined' || typeof items === 'boolean' || items === null) 
    return;
  if (items instanceof Array)  {
    vm.queryItems = [...items];
    vm.PageItems(0);
    vm.activeItemIndex = -1;
    if (items.length) vm.DocumentEventHideItems();
    //~ vm.showItems = true;
  }
  else if (typeof items.then === 'function') items.then(items => {  vm.SetItems(items);  });
  return vm;
},


QueryItems(show) {
  var vm = this;
  //~ if (value === undefined) value = vm.inputQuery;
  if (!show && vm.inputQuery == vm.lastQuery) return;
  vm.lastQuery = vm.inputQuery;
  if (!vm.items) vm.SetItems(vm.onInputChange(vm.inputQuery, vm.item, vm));
  else vm.SetItems(vm._QueryItems());/// поиск по _match

},

_QueryItems() {
  var vm = this;
  var query = vm.onInputChange(vm.inputQuery, vm.item, vm);
  query = query || util.CleanString(vm.inputQuery);///query.replace(util.re.trash, '');
  if (query.length) return vm.items.filter(util.FilterQuery, {"re": new RegExp(query, 'i')});
  else return [];//vm.items; отличие от v-select когда при пустом вводе все равно отображается список
},

FilterItems(it){
  var vm = this;
  //~ var reStr = vm.inputQuery.replace(util.REtrash, '');
  //~ if (!reStr.length) return false;
  //~ var re = new RegExp(reStr, 'i');
  //~ return re.test(it._match);
  return it._match.indexOf(this.inputQuery) !== -1;
},

ToggleAll(){
  var vm = this;
  vm.toggleAll = !vm.toggleAll;
  if (vm.toggleAll)  setTimeout( () => vm.SetItems(vm.items) );
  else vm.SetItems([]).HideItems();
},

ClearInput(){
  var vm = this;
  vm.inputQuery = '';
  //~ vm.$emit('input', vm);
  //~ vm.QueryItems('');
  vm.onInputChange(null, vm.item, vm);
  vm.SetItems([]).HideItems();
},


DocumentEventHideItems(){/// убрать список клик за пределами
  var vm = this;
  if (!vm._container) vm._container = $('div:first', $(vm.$el));
  if (!vm._eventHideItems) vm._eventHideItems = function(event){
    
      var cont = $(event.target).closest(vm._container);
    //~ console.log("DocumentEventHideItems", cont);
      if (cont.length) return true;
      vm.HideItems();
      //~ $(document).off('click', that.eventHideContainer);в .HideItems()
      return false;
  };
  //~ vm._documentEventHideContainer = 
  setTimeout(function(){$(document).on('click.suggestions', vm._eventHideItems);}, 100);
  //~ return that._documentEventHideContainer;
},

/*пагинация*/
PageItems(page){
  var vm = this;
  
  if (!vm.extParam.limit) return (vm.pageItems = vm.queryItems);
  
  if (page === undefined) page = vm.page;
  else vm.page = page;
  var slice = [page*vm.extParam.limit, (page+1)*vm.extParam.limit];
  vm.pageItems =  vm.queryItems.slice(slice[0], slice[1]);///извлекает элементы с индексом меньше второго параметра
 
},

SuggestionClass(item, index){
  var vm = this;
  var cl = [vm.extParam.suggestionClass];
  if (index === vm.activeItemIndex) cl.push('suggestion-selected');
  //~ if (vm.extParam.suggestionClassStar && reStar.test(item)) cl.push(vm.extParam.suggestionClassStar);
  return cl;
},


};
//~ const reStar =  /^\s*★/;
const computed = {/** computed **/

AllLen(){
  return (this.items && this.items.length) || this.allLen;
},
  
QueryItemsLen(){
  return this.queryItems.length;
},

SuggestionsStyle(){
  var vm = this;
  var style = Object.assign({}, vm.extParam.suggestionsStyle);
  //~ if (vm.inputQuery.length)   style.top = '32px';
  style.top = 'auto';
  return style;
},
  
};

const data = function(){
  var vm = this;
  vm.extParam = Object.assign({}, defaultParam, vm.param);
  return {
    inputQuery: vm.value,
    queryItems: [],
    page: 0,
    pageItems: [],
    activeItemIndex: -1,
    activeItem: undefined,
  };
  
};

const  beforeMount = function(){
  var vm = this;
  if (vm.extParam.debounce !== 0) {
    if (typeof debounce !== 'function') return console.error("Нет функции debounce!");
    vm.QueryItems = debounce(vm.QueryItems, vm.extParam.debounce);
    //~ vm.debounceKeyDown = debounce(function(e){ vm.onKeyDown(e); }, vm.extParam.debounce);
    //~ console.log("debounce");
  } ///else vm.debounceKeyDown = vm.onKeyDown;
};

var $Компонент = {
  "inheritAttributes": true,
  props,
  beforeMount,
  //~ watch,
  data,
  methods,
  computed,
};


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент/поиск в списке');/// только в конструкторе
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
)

}());