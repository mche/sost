(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентВыборОбъекта({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Выбор объекта";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util']);

module.factory('$КомпонентВыборОбъекта', function($timeout, $templateCache, $Список, appRoutes) {// factory

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "select": Object,
  "dataUrl": {
    type: String,
    default: 'доступные объекты без проектов',
  },
};/// конец props

const util = {/*разное*/
FilterByID(it){
  return it.id == this.id;
},
}; ///конец util

const methods = {/*методы*/
LoadData(param){
  var vm = this;
  var loader = new $Список(appRoutes.urlFor(vm.dataUrl));
  return loader.Load(param)
    .then(function(resp){
      //~ Array.prototype.push.apply($c.data, resp.data/*.filter($c.FilterObj)*/.filter($c.FilterUniqById, {}));
      vm['объекты'] = loader.Data();
      vm['$объекты'] = loader.$Data();
      if (vm.select !== undefined) vm.Select(vm['объекты'].find(util.FilterByID, vm.select));
      else if (!vm.param['все объекты'] && vm['объекты'].length == 1) vm.Select(vm['объекты'][0]);
    });
  
},
  
Ready(){
  var vm = this;
  vm.ready = true;
  $timeout(function(){
    vm.dropDown = $('.select-dropdown', $(vm.$el));///.addClass('dropdown-content');
    if (vm.select === undefined) vm.DropDownShow();
  });
},
  
Select(obj){
  var vm = this;
  //~ console.log("Select", obj);
  if (obj === vm.selected) return vm.DropDownHide();
  //~ vm.selected = undefined;
  vm.highlighted = obj;
  //~ $timeout(function(){
    vm.selected = obj;
    //~ if($c.onSelectObj) $c.onSelectObj({"obj": obj, "data": $c.data});
    vm.$emit('on-select-object',obj);
    vm.DropDownHide();
  //~ }, 100);
  
},

ToggleList(event, hide){
  var vm = this;
  //~ console.log("ToggleList", vm.selected);
  //~ if (!selectObj) selectObj =  $('.dropdown-content', $($element[0]));
  //~ $timeout(function(){
    if (!hide || vm.selected) vm.DropDownShow();
    else vm.DropDownHide();
  //~ });
},

ChangeInput(event){
  var vm = this;
  var key = event ? event.key : '';
  if (vm.dataFiltered && vm.dataFiltered.length && (key == 'ArrowDown' || key == 'ArrowUp')) {
    var idx = vm.dataFiltered.indexOf(vm.highlighted || vm.selected) || 0;
    if (key == 'ArrowDown') vm.highlighted = vm.dataFiltered[idx+1];
    else vm.highlighted = vm.dataFiltered[idx-1] || vm.dataFiltered[$c.dataFiltered.length-1];
    //~ var li =  $('li', vm.dropDown).get(vm.dataFiltered.indexOf(vm.highlighted));
    //~ li.scrollTop = li.scrollHeight;///.scrollIntoView();
    return;
  }
  vm.dataFiltered = undefined;
  if (vm.changeTimeout) $timeout.cancel(vm.changeTimeout);
  vm.changeTimeout = $timeout(function(){
    vm.dataFiltered = [...vm['объекты'].filter(vm.FilterObj)];
    //~ console.log("ChangeInput", vm.dataFiltered);
    vm.changeTimeout = undefined;
    if (key == 'Enter') {
      if (vm.highlighted) vm.Select(vm.highlighted);
      else if (vm.selected) vm.Select(vm.selected);
    }
    else if (event && $(event.target).val() && !vm.selected) vm.highlighted = vm.dataFiltered[0];
  }, event ? 300 : 0);
  return vm.changeTimeout;
},

FilterObj(obj){
  var vm = this;
  if (!vm.inputObject) return true;
  var re = new RegExp(vm.inputObject, 'i');
  return re.test(/*((!vm.param['без проекта'] && obj['$проект'] && obj['$проект'].name) || '')+*/obj.name);
  
},

ItemClass(obj){
  var vm = this;
  var cls = [/*vm.param.itemClass || ''*/];
  if (obj === undefined) cls.push('grey-text');
  if (obj.id === 0) cls.push('bold');
  if (obj === vm.selected) cls.push('fw500');
  else cls.push('hover-shadow3d');
  
  return cls;
},

event_hide(event){
  var vm = this;
  //~ console.log("event_hide", vm);
  if($(event.target).closest(vm.dropDown.parent()).eq(0).length) return;
  vm.DropDownHide();
  $(document).off('click', vm.event_hide);
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
      $(document).on('click', vm.event_hide);
      if (vm.selected) {
        var li =  $('li', vm.dropDown).get(vm.dataFiltered.indexOf(vm.selected));
        li.scrollTop = li.scrollHeight;///.scrollIntoView();
      } 
    });
  });
},
DropDownHide(){
  var vm = this;
  //~ vm.dropDown.hide();
  vm.dropDownShow = false;
  //~ console.log("DropDownHide");
  //~ $timeout(function(){ delete $c.showList; });
},


}; ///конец методы

const computed = {/*  */

}; ///конец computed

const data = function() {
  let vm = this;
  vm.LoadData().then(function(){
    vm.Ready();
    
  });
  return {
    "ready": false,
    "selected": undefined, ///выбранный объект
    "highlighted": undefined, /// подсвеченный объект
    "inputObject": '', ///поле ввода поиска
    "dataFiltered": undefined, /// 
    "dropDownShow": false, 
  };

};///  конец data

const mounted = function(){
  var vm = this;
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
  $Компонент.template = $templateCache.get('компонент выбор объекта');
  return $Компонент;
};

return $Конструктор;

});// конец factory

}());