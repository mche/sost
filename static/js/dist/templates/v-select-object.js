parcelRequire.register("js/c/object/v-select-object.vue.html", (function(){var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('v-progress-indeterminate',{directives:[{name:"show",rawName:"v-show",value:( !_vm.ready ),expression:" !ready "}],attrs:{"color":'teal',"message":'Загружается...'}}),_vm._v(" "),( _vm.ready )?_c('v-select',{attrs:{"select":_vm.select,"param":{'без стрелки раскрытия списка':true, 'без поля поиска':_vm.param['без поля поиска'], ulDropDownClass: _vm.param.ulDropDownClass,},"items":_vm.list},on:{"on-select":_vm.SelectObject},scopedSlots:_vm._u([{key:"selected",fn:function(ref){
var selected = ref.selected;
return [_c('h4',{staticClass:"chip blue-text text-darken-3 input-hover000 hoverable-000",class:{'fw500 animated slideInUp': !!selected}},[_c('i',{staticClass:"material-icons fs10"},[_vm._v("place")]),_vm._v(" "),_c('span',[_vm._v(_vm._s((selected && selected.$item && selected.$item.name) || _vm.param.placeholder || 'Выбрать объект'))])])]}},{key:"listItem",fn:function(ref){
var listItem = ref.listItem;
var selected = ref.selected;
var highlighted = ref.highlighted;
return [_c('h5',{staticClass:"padd-0-05 blue-text text-darken-3 relative hoverable-000",class:{'bold fs14': listItem === selected, 'fw500': listItem === highlighted,},attrs:{"class0000":" ItemClass(obj) "}},[_c('span',[_vm._v("★ "+_vm._s(listItem.$item.name))]),_vm._v(" "),_c('span',{staticClass:"grey-text fs7",staticStyle:{"position":"absolute","right":"0","bottom":"0"}},[_vm._v("#"+_vm._s(listItem.id))])])]}}],null,false,3778335290)}):_vm._e()],1)}
var staticRenderFns = []
; return {render,staticRenderFns};})());
