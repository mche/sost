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

module.factory('$КомпонентВыборВСписке', function($timeout, $templateCache) {// factory

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "select": Object,/// нужен только id, все содержимое возвращается на событии вторым аргументом
  "items": Array,
  /*
  массив элементов {id:..., _match:..., ...}
  */
};/// конец props

const util = {/*разное*/
FilterByID(it){
  return it.id == this.id;
},
}; ///конец util

const methods = {/*методы*/
  
Ready(){
  var vm = this;
  vm.ready = true;
  
  if (vm.select !== undefined) vm.Select(vm.items.find(util.FilterByID, vm.select));
  
  $timeout(function(){
    vm.dropDown = $('.select-dropdown', $(vm.$el));///.addClass('dropdown-content');
    if (vm.select === undefined) vm.DropDownShow();
  });
},
  
Select(it){
  var vm = this;
  //~ console.log("Select", it);
  if (it === vm.selected) return vm.DropDownHide();
  vm.$emit('on-select',it, vm.select);
  //~ vm.selected = undefined;
  vm.highlighted = it;
  //~ $timeout(function(){
    vm.selected = it;
    
    vm.DropDownHide();
  //~ }, 100);
  
},

ToggleItems(event, hide){
  var vm = this;
  //~ console.log("ToggleItems", vm.selected);
  //~ if (!selectObj) selectObj =  $('.dropdown-content', $($element[0]));
  //~ $timeout(function(){
    if (!hide || vm.selected) vm.DropDownShow();
    else vm.DropDownHide();
  //~ });
},

ChangeInput(event){
  var vm = this;
  var key = event ? event.key : '';
  if (vm.itemsFiltered && vm.itemsFiltered.length && (key == 'ArrowDown' || key == 'ArrowUp')) {
    var idx = vm.itemsFiltered.indexOf(vm.highlighted || vm.selected) || 0;
    if (key == 'ArrowDown') vm.highlighted = vm.itemsFiltered[idx+1];
    else vm.highlighted = vm.itemsFiltered[idx-1] || vm.itemsFiltered[$c.itemsFiltered.length-1];
    //~ var li =  $('li', vm.dropDown).get(vm.itemsFiltered.indexOf(vm.highlighted));
    //~ li.scrollTop = li.scrollHeight;///.scrollIntoView();
    return;
  }
  vm.itemsFiltered = undefined;
  if (vm.changeTimeout) $timeout.cancel(vm.changeTimeout);
  vm.changeTimeout = $timeout(function(){
    vm.itemsFiltered = [...vm.items.filter(vm.FilterQuery)];
    //~ console.log("ChangeInput", vm.itemsFiltered);
    vm.changeTimeout = undefined;
    if (key == 'Enter') {
      if (vm.highlighted) vm.Select(vm.highlighted);
      else if (vm.selected) vm.Select(vm.selected);
    }
    else if (event && $(event.target).val() && !vm.selected) vm.highlighted = vm.itemsFiltered[0];
  }, event ? 300 : 0);
  return vm.changeTimeout;
},

FilterQuery(it){
  var vm = this;
  if (!vm.inputQuery) return true;
  var re = new RegExp(vm.inputQuery, 'i');
  return re.test(it._match);
  
},

ItemClass(it){/// слот
  var vm = this;
  var cls = [/*vm.param.itemClass || ''*/];
  if (it === undefined) cls.push('grey-text');
  if (it.id === 0) cls.push('bold');
  if (it === vm.selected) cls.push('fw500');
  else cls.push('hover-shadow3d');
  
  return cls;
},

EventHideDropDown(event){
  var vm = this;
  //~ console.log("EventHideDropDown", vm);
  if ($(event.target).closest(vm.dropDown.parent()).eq(0).length) return;
  vm.DropDownHide();
  $(document).off('click', vm.EventHideDropDown);
  return false;
},

DropDownShow(){
  var vm = this;
  //~ console.log("DropDownShow");
  //~ vm.dropDown.show();
  vm.ChangeInput().then(function(){
    vm.dropDownShow = true;
    $timeout(function(){
      $('input', vm.dropDown.parent()).focus();
      $(document).on('click', vm.EventHideDropDown);
      if (vm.selected) {
        var li =  $('li', vm.dropDown).get(vm.itemsFiltered.indexOf(vm.selected));
        li.scrollTop = li.scrollHeight;///
        if (vm.select && vm.select.id) setTimeout(()=>li.scrollIntoView());/// особенности прокрутки
        //~ console.log("scroll", li);
      } 
    });
  });
},

DropDownHide(){
  var vm = this;
  //~ vm.dropDown.hide();
  vm.dropDownShow = false;
  //~ console.log("DropDownHide");
},

}; ///конец методы

const computed = {/*  */

}; ///конец computed

const data = function() {
  let vm = this;
  return {
    "ready": false,
    "selected": undefined, ///выбранный объект
    "highlighted": undefined, /// подсвеченный объект
    "inputQuery": '', ///поле ввода поиска
    "itemsFiltered": undefined, /// 
    "dropDownShow": false, 
  };

};///  конец data

const mounted = function(){
  var vm = this;
  vm.Ready();
};/// конец mounted

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  //~ created,
  mounted,
  components: {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент выбор из списка');
  return $Компонент;
};

return $Конструктор;

});// конец factory

}());