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

const Factory = function($templateCache,  /*$timeout,$http, $rootScope, /**$compile, appRoutes, Util $EventBus*/) {// factory

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

var meth = {/*методы*/};
var comp = {/** computed **/};

meth.Mounted = function(){/// метод
  var vm = this;
  vm.ready = true;
};

/*meth.onItemSelectedDefault = function(item) {
  if (typeof item === 'string') {
    this.$emit('input', item);
    this.setInputQuery(item);
    //~ this.showItems = false;
    this.hideItems();
    // console.log('change value')
  }
};*/

meth.hideItems = function() {
  var vm = this;
  vm.toggleAll = false;
  //~ setTimeout(() => {
  //~ vm.showItems = false;
  //~ console.trace("hideItems");
  vm.items = [];
  if (vm._eventHideItems) $(document).off('click.suggestions', vm._eventHideItems);
  //~ }, 300);
  return vm;
};

meth.setInputQuery = function(value) {
  this.lastQuery = value;
  this.query = value;
};

meth.onKeyDown = function(e) {
  var vm = this;
  //~ vm.$emit('keyDown', e.keyCode, vm.query);
  switch (e.keyCode) {
    case 40:
      vm.highlightItem('down');
      e.preventDefault();
      break;
    case 38:
      vm.highlightItem('up');
      e.preventDefault();
      break;
    case 13:
      vm.selectItem();
      e.preventDefault();
      break;
    case 27:
      //~ vm.showItems = false;
      vm.hideItems();
      e.preventDefault();
      break;
    default:
      vm.QueryChanged();
      return true;
  }
};

meth.onBlur = function(){
  var vm = this;
  //~ hideItems
  
};

meth.onFocus = function(){
  var vm = this;
  //~ vm.showItems = true;
  //~ vm.$emit('focus',vm);
};

meth.onPaste  = function(event){
  event.preventDefault();
  return false;
};

meth.onInputDblClick = function(e){
  var vm = this;
  if (vm.query.length) vm.setItems(vm.onInputChange(vm.query, vm));
  else vm.setItems(vm.onInputChange(null, vm));
  
};

meth.selectItem = function(index){
  var vm = this;
  //~ console.log("selectItem", index, vm.activeItemIndex);
  var idx = index === undefined ? vm.activeItemIndex : index;
  if (idx === -1) return;
  idx = idx + vm.page*vm.extendedOptions.limit;
  var item = vm.items[idx];
  //~ var item = vm.itemsPage[idx];
  if (!item)  return;
  if (vm.onItemSelected) 
    vm.onItemSelected(item, idx, vm);
    //~ vm.setInputQuery(item);
  //~ } else {
    //~ vm.onItemSelectedDefault(item);
  //~ }
  //~ vm.$emit('input', item);
  vm.setInputQuery(item);
    //~ this.showItems = false;
  vm.hideItems();
};

meth.highlightItem = function(direction) {
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
};

meth.setItems = function(items) {
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
  else if (typeof items.then === 'function') items.then(items => {  vm.setItems(items);  });
  return vm;
};

/*const re = {
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space2+": / {2,}/g,
};*/
meth.QueryChanged = function(value) {
  var vm = this;
  if (value === undefined) value = vm.query;
  if (vm.query == vm.lastQuery) return;
  vm.lastQuery = vm.query;
  const result = vm.onInputChange(value/*.replace(re.trash, '').replace(re['space2+'], ' ').trim()*/, vm);
  vm.setItems(result);
};

meth.ToggleAll = function(){
  var vm = this;
  vm.toggleAll = !vm.toggleAll;
  if (vm.toggleAll)  setTimeout(() => { vm.setItems(vm.onInputChange(null, vm)); });
  else vm.setItems([]).hideItems();
};

meth.ClearInput = function(){
  var vm = this;
  vm.query = '';
  //~ vm.$emit('input', vm);
  //~ vm.QueryChanged('');
  vm.onInputChange('', vm);
  vm.setItems([]).hideItems();
};


meth.DocumentEventHideItems= function(){/// убрать список клик за пределами
  var vm = this;
  if (!vm._container) vm._container = $('div:first', $(vm.$el));
  if (!vm._eventHideItems) vm._eventHideItems = function(event){
    
      var cont = $(event.target).closest(vm._container);
    //~ console.log("DocumentEventHideItems", cont);
      if (cont.length) return true;
      vm.hideItems();
      //~ $(document).off('click', that.eventHideContainer);в .hideItems()
      return false;
  };
  //~ vm._documentEventHideContainer = 
  setTimeout(function(){$(document).on('click.suggestions', vm._eventHideItems);}, 100);
  //~ return that._documentEventHideContainer;
};

/*пагинация*/
meth.ItemsPage = function(page){
  var vm = this;
  
  if (!vm.extendedOptions.limit) return (vm.itemsPage = vm.items);
  
  if (page === undefined) page = vm.page;
  else vm.page = page;
  var slice = [page*vm.extendedOptions.limit, (page+1)*vm.extendedOptions.limit];
  vm.itemsPage =  vm.items.slice(slice[0], slice[1]);///извлекает элементы с индексом меньше второго параметра
 
};

const reStar =  /^\s*★/;
meth.SuggestionClass = function(item, index){
  var vm = this;
  var cl = [vm.extendedOptions.suggestionClass];
  if (index === vm.activeItemIndex) cl.push('suggestion-selected');
  if (vm.extendedOptions.suggestionClassStar && reStar.test(item)) cl.push(vm.extendedOptions.suggestionClassStar);
  return cl;
};

comp.itemsLen = function(){
  var vm = this;
  return vm.items.length;
  
};

comp.SuggestionsStyle = function(){
  var vm = this;
  var style = Object.assign({}, vm.extendedOptions.suggestionsStyle);
  if (vm.query.length) style.top = '32px';
  return style;
};

var $Компонент = {
  "inheritAttributes": true,
  "props": {
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
  },
  data () {
    var vm = this;
    vm.extendedOptions = Object.assign({}, defaultOptions, vm.options);
    return {
      //~ extendedOptions,
      query: vm.value,
      //~ lastQuery: null,
      items: [],
      //~ itemsSlice: [],
      page: 0,
      itemsPage: [],
      activeItemIndex: -1,
      //~ showItems: true,
    };
  },
  beforeMount () {
    var vm = this;
    if (vm.extendedOptions.debounce !== 0) {
      if (typeof debounce !== 'function') return console.error("Нет функции debounce!");
      vm.QueryChanged = debounce(vm.QueryChanged, vm.extendedOptions.debounce);
      //~ vm.debounceKeyDown = debounce(function(e){ vm.onKeyDown(e); }, vm.extendedOptions.debounce);
      //~ console.log("debounce");
    } ///else vm.debounceKeyDown = vm.onKeyDown;
  },
  "watch": {
    /*'query': function (newValue, oldValue) {
      if (newValue === this.lastQuery) {
        this.lastQuery = null;
        return;
      }
      this.QueryChanged(newValue);
      this.$emit('input', newValue);
    },*/
    //~ 'value': function (newValue, oldValue) {
      //~ console.log('value>>>', newValue, newValue === this);
      //~ this.setInputQuery(newValue === this ? '' : newValue);
    //~ }
  },
  "methods": meth,
  "computed": comp,
};
//~ </script>


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/поиск в списке');/// только в кострукторе
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентПоискВСписке', Factory);

}());