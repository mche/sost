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
  
*/
var moduleName = "Компонент::Поиск в списке";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

module
.factory('$КомпонентПоискВСписке', function($templateCache,  /*$timeout,$http, $rootScope, /**$compile, appRoutes, Util $EventBus*/) {// factory

const defaultOptions = {
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
  //~ "item": {
    //~ type: Object,
    //~ default: {}
  //~ },
  "options": {
    type: Object,
    default: {}
  },
  "onInputChange": {
    type: Function,
    required: true
  },
  "onItemSelected": {
    type: Function
  },
  "value": {
    type: String,
    required: true
  },
  "allLen":{/// количество всех записей в поиске
    type: Number,
    default: 0,
  },
};

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
  vm.items = [];
  if (vm._eventHideItems) $(document).off('click.suggestions', vm._eventHideItems);
  //~ }, 300);
  return vm;
},

SetInputQuery(value) {
  this.lastQuery = value;
  this.inputQuery = value;
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
  //~ vm.showItems = true;
  //~ vm.$emit('focus',vm);
},

onPaste(event){
  event.preventDefault();
  return false;
},

onInputDblClick(e){
  var vm = this;
  if (vm.inputQuery.length) vm.SetItems(vm.onInputChange(vm.inputQuery, vm));
  else vm.SetItems(vm.onInputChange(null, vm));
  
},

Select(index){ /// уст/сброс позиции
  var vm = this;
  //~ console.log("Select", index, vm.activeItemIndex);
  var idx = index === undefined ? vm.activeItemIndex : index;
  if (idx === -1) return;
  idx = idx + vm.page*vm.extendedOptions.limit;
  var item = vm.items[idx];
  //~ var item = vm.itemsPage[idx];
  if (!item)  return;
  if (vm.onItemSelected) 
    vm.onItemSelected(item, idx, vm);
    //~ vm.SetInputQuery(item);
  //~ } else {
    //~ vm.onItemSelectedDefault(item);
  //~ }
  //~ vm.$emit('input', item);
  vm.SetInputQuery(item);
    //~ this.showItems = false;
  vm.HideItems();
},

Highlight(direction){/// подсветка
  if (this.items.length === 0) return;
  let selectedIndex = this.items.findIndex((item, index) => {
    return index === this.activeItemIndex;
  })
  if (selectedIndex === -1) {
    // nothing selected
    if (direction === 'down') {
      selectedIndex = 0;
    } else {
      selectedIndex = this.items.length - 1;
    }
  } else {
    this.activeIndexItem = 0;
    if (direction === 'down') {
      selectedIndex++;
      if (selectedIndex === this.items.length) {
        selectedIndex = 0;
      }
    } else {
      selectedIndex--;
      if (selectedIndex < 0) {
        selectedIndex = this.items.length - 1;
      }
    }
  }
  this.activeItemIndex = selectedIndex;
},

SetItems(items){
  var vm = this;
  vm.items = [];
  if (typeof items === 'undefined' || typeof items === 'boolean' || items === null) 
    return;
  if (items instanceof Array)  {
    vm.items = [...items];
    vm.ItemsPage(0);
    vm.activeItemIndex = -1;
    if (items.length) vm.DocumentEventHideItems();
    //~ vm.showItems = true;
  }
  else if (typeof items.then === 'function') items.then(items => {  vm.SetItems(items);  });
  return vm;
},

/*const re = {
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space2+": / {2,}/g,
};*/
QueryItems(value) {
  var vm = this;
  if (value === undefined) value = vm.inputQuery;
  if (vm.inputQuery == vm.lastQuery) return;
  vm.lastQuery = vm.inputQuery;
  const result = vm.onInputChange(value/*.replace(re.trash, '').replace(re['space2+'], ' ').trim()*/, vm);
  vm.SetItems(result);
},

ToggleAll(){
  var vm = this;
  vm.toggleAll = !vm.toggleAll;
  if (vm.toggleAll)  setTimeout(() => { vm.SetItems(vm.onInputChange(null, vm)); });
  else vm.SetItems([]).HideItems();
},

ClearInput(){
  var vm = this;
  vm.inputQuery = '';
  //~ vm.$emit('input', vm);
  //~ vm.QueryItems('');
  vm.onInputChange('', vm);
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
ItemsPage(page){
  var vm = this;
  
  if (!vm.extendedOptions.limit) return (vm.itemsPage = vm.items);
  
  if (page === undefined) page = vm.page;
  else vm.page = page;
  var slice = [page*vm.extendedOptions.limit, (page+1)*vm.extendedOptions.limit];
  vm.itemsPage =  vm.items.slice(slice[0], slice[1]);///извлекает элементы с индексом меньше второго параметра
 
},

SuggestionClass(item, index){
  var vm = this;
  var cl = [vm.extendedOptions.suggestionClass];
  if (index === vm.activeItemIndex) cl.push('suggestion-selected');
  if (vm.extendedOptions.suggestionClassStar && reStar.test(item)) cl.push(vm.extendedOptions.suggestionClassStar);
  return cl;
},


};
const reStar =  /^\s*★/;
const computed = {/** computed **/
itemsLen(){
  var vm = this;
  return vm.items.length;
},

SuggestionsStyle(){
  var vm = this;
  var style = Object.assign({}, vm.extendedOptions.suggestionsStyle);
  if (vm.inputQuery.length) style.top = '32px';
  return style;
},
  
};

const data = function(){
  var vm = this;
  vm.extendedOptions = Object.assign({}, defaultOptions, vm.options);
  return {
    inputQuery: vm.value,
    items: [],
    page: 0,
    itemsPage: [],
    activeItemIndex: -1,
  };
  
};

const  beforeMount = function(){
  var vm = this;
  if (vm.extendedOptions.debounce !== 0) {
    if (typeof debounce !== 'function') return console.error("Нет функции debounce!");
    vm.QueryItems = debounce(vm.QueryItems, vm.extendedOptions.debounce);
    //~ vm.debounceKeyDown = debounce(function(e){ vm.onKeyDown(e); }, vm.extendedOptions.debounce);
    //~ console.log("debounce");
  } ///else vm.debounceKeyDown = vm.onKeyDown;
};

//~ const watch = {
  /*'query': function (newValue, oldValue) {
    if (newValue === this.lastQuery) {
      this.lastQuery = null;
      return;
    }
    this.QueryItems(newValue);
    this.$emit('input', newValue);
  },*/
  //~ 'value': function (newValue, oldValue) {
    //~ console.log('value>>>', newValue, newValue === this);
    //~ this.SetInputQuery(newValue === this ? '' : newValue);
  //~ }
//~ };

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
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/поиск в списке');/// только в конструкторе
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

}// end Factory
/**********************************************************************/
)

}());