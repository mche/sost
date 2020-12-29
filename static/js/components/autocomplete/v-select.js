(function () {'use strict';
/*
  отличие от $КомпонентПоискВСписке - не ввод новой позиции
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентВыборВСписке({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Компонент::Выбор в списке";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module.factory('$КомпонентВыборВСписке', function(/*$timeout,templateCache*/) {// factory

const defaultParam = {
  debounce: 500,///задержка мс
  placeholder: '',
  //~ topClass: 'v-suggestions input-field',
  //~ inputClass: 'input',
  //~ suggestionClass: '',
  //~ suggestionClassStar: 'suggestion-star',
  //~ suggestionsStyle: {"width": '100%'}, ///ширина ограничена полем ввода
  limit: 20,/// записей в списке - пагинация; 0 - без пагинации
};

const props = {
  "param": { /// накладка на defaultParam
    type: Object,
    default: function () {
      return {};
    },
  },
  "select": Object,/// нужен только id, все содержимое возвращается на событии вторым аргументом
  "items": Array,
  //~ "@items": Array,
  /*
  массив элементов {id:..., _match:..., ...}
  */
};/// конец props

const util = {/*разное*/
FilterByID(it){
  return it.id == this.id;
},
"REtrash": /[^ \.,\-\w\u0400-\u04FF]/gi,

FilterQuery(it){
  //~ var vm = this;
  //~ var reStr = 
  //~ if (!reStr.length) return false;
  //~ var re = new RegExp(reStr, 'i');
  return this.re.test(it._match);
  //~ return it._match.indexOf(reStr) !== -1;
},

}; ///конец util

const methods = {/*методы*/
  
Ready(){
  var vm = this;
  vm.ready = true;
  
  if (vm.select !== undefined && (vm.select.id || vm.select.id === 0)) vm.Select(vm.items.find(util.FilterByID, vm.select));
  
  vm.QueryItems();
  vm.SelectedPage();
  
  setTimeout(function(){
    vm.dropDown = $('.select-dropdown', $(vm.$el));///.addClass('dropdown-content');
    if (vm.select === undefined || vm.param['раскрыть список']) vm.DropDownShow();
  });
},
  
Select(it){ /// выбор/сброс позиции
  var vm = this;
  //~ console.log("Select", vm.$slots);
  if (it !== vm.selected) {///}return vm.DropDownHide();
    //~ if (!noEmit /*|| !vm.select || !it || it.id != vm.select.id*/) 
    vm.$emit('on-select',it, vm.select);
    //~ vm.selected = undefined;
    vm.highlighted = it;
    vm.selected = it;
  }
  vm.DropDownHide();
},

OnKeyDown(e){
  var vm = this;
   var idx = vm.itemsFiltered.indexOf(vm.highlighted || vm.selected) || 0;
  switch (e.keyCode) {
    case 40:
      vm.highlighted = vm.itemsFiltered[idx+1];
      e.preventDefault();
      break;
    case 38:
      vm.highlighted = vm.itemsFiltered[idx-1] || vm.itemsFiltered[vm.itemsFiltered.length-1];
      e.preventDefault();
      break;
    case 13:
      if (vm.highlighted) vm.Select(vm.highlighted);
      else if (vm.selected) vm.Select(vm.selected);
      //~ else vm.Select({"_match": vm.inputQuery});
      e.preventDefault();
      break;
    case 27:
      vm.DropDownHide()
      e.preventDefault();
      break;
    default:
      vm.DebounceQueryItems ? vm.DebounceQueryItems() : vm.QueryItems();
      return true;
  }
},


QueryItems(){
  var vm = this;
  if (vm.inputQuery == vm.lastQuery) return;
  vm.lastQuery = vm.inputQuery;
  var query = vm.inputQuery.replace(util.REtrash, '');
  vm.itemsFiltered = query.length  ? [...vm.items.filter(util.FilterQuery, {"re": new RegExp(query, 'i')})] : [...vm.items];
  if (!vm.selected) vm.highlighted = vm.itemsFiltered[0];
  vm.ItemsPage(0);
},

EventHideDropDown(event){
  var vm = this;
  //~ console.log("EventHideDropDown", vm);
  if ($(event.target).closest(vm.dropDown.parent()).eq(0).length) return;
  vm.DropDownHide(); // там  //~ $(document).off('click', vm.EventHideDropDown);
  return false;
},

DropDownShow(){
  var vm = this;
  //~ console.log("DropDownShow");
  //~ vm.dropDown.show();
  vm.dropDownShow = true;
  
  setTimeout(function(){
    $('input', vm.dropDown.parent()).focus();
    $(document).on('click', vm.EventHideDropDown);
    if (vm.selected && !vm.extParam.limit) {/// прокрутка до глубокой позиции если без пагинации
      var li =  $('li', vm.dropDown).get(vm.itemsPage.indexOf(vm.selected));
      //~ console.log("DropDownShow", vm.selectNone);
      if (vm.selectNone)  li.scrollTop = li.scrollHeight;
      //~ debugger;
      //~ if (vm.select && vm.select.id) 
      else setTimeout(()=>li.scrollIntoView({ "block": 'start', "behavior": 'smooth', }));/// особенности прокрутки
    } else {
      vm.selectNone = true;/// т.е. открыл без изначальной установки позиции
    }
  });
},

DropDownHide(){
  var vm = this;
  //~ vm.dropDown.hide();
  vm.dropDownShow = false;
  //~ console.log("DropDownHide");
  $(document).off('click', vm.EventHideDropDown);
},

/*ClearSelected(){
  var vm = this;
  vm.Select();
  vm.ItemsPage(0);
},*/

ClearInput(){
  var vm = this;
  vm.inputQuery = '';
  vm.QueryItems();
  vm.SelectedPage();
  vm.Select();
  vm.ItemsPage(0);
},

/*пагинация*/
ItemsPage(page){
  var vm = this;
  
  if (!vm.extParam.limit) return (vm.itemsPage = vm.itemsFiltered);
  
  if (page === undefined) page = vm.page;
  else vm.page = page;
  var slice = [page*vm.extParam.limit, (page+1)*vm.extParam.limit];
  vm.itemsPage =  vm.itemsFiltered.slice(slice[0], slice[1]);///извлекает элементы с индексом меньше второго параметра
 
},

SelectedPage(){
  var vm = this;
  if (vm.selected) {/// для пагинации
    var idxSelected = vm.itemsFiltered.indexOf(vm.selected);
    var page = Math.floor(idxSelected/vm.extParam.limit);
    if (page != vm.page) vm.ItemsPage(page);
  }
  
},

NewItem(){
  this.Select({"_new": this.inputQuery});
},

}; ///конец методы

const computed = {/*  */
itemsFilteredLen(){
  var vm = this;
  return vm.itemsFiltered.length;
},
itemsLen(){
  var vm = this;
  return vm.items.length;
},
}; ///конец computed

const data = function() {
  let vm = this;
  vm.extParam = Object.assign({}, defaultParam, vm.param);
  return {
    "ready": false,
    "selected": undefined, ///выбранный объект - установленная позиция от параметра select и выбора в списке
    "highlighted": undefined, /// подсвеченный объект-позиция
    "inputQuery": '', ///поле ввода поиска
    "itemsFiltered": undefined, /// 
    "itemsPage": undefined, /// 
    "page": 0, /// текущая страница
    "dropDownShow": false, /// переключатель отображения списка
  };

};///  конец data

const mounted = function(){
  var vm = this;
  vm.Ready();
};/// конец mounted

const  beforeMount = function(){
  var vm = this;
  if (vm.extParam.debounce !== 0) {
    if (typeof debounce !== 'function') return console.error("Нет функции debounce!");
    vm.DebounceQueryItems = debounce(vm.QueryItems, vm.extParam.debounce);
  }
};

let template = parcelRequire('js/c/autocomplete/v-select.vue.html');

var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ created,
  beforeMount,
  mounted,
  components: {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('компонент выбор из списка');
  return $Компонент;
};

return $Конструктор;

});// конец factory

}());