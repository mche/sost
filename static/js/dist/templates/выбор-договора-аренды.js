parcelRequire.register("js/c/аренда/выбор-договора-аренды.vue.html", {render:function(){var s=this,t=s.$createElement,e=s._self._c||t;return s.ready?e("v-select",{attrs:{select:s.item,items:s.items,param:{placeholder:"поиск договора арендатора",ulDropDownClass:["striped teal lighten-4"]}},on:{"on-select":s.OnSelect},scopedSlots:s._u([{key:"selected",fn:function(t){var a=t.selected;return[a?e("h3",{staticClass:"animated hover-bottom-shadow-blue-darken-3-000 relative slideInRight",class:{"maroon-text ":a["архив?"],"teal-text text-darken-4":!a["архив?"]}},[e("i",{directives:[{name:"show",rawName:"v-show",value:a["архив?"],expression:"selected['архив?']"}],staticClass:"material-icons"},[s._v("lock")]),s._v(" "),e("span",{staticClass:"chip000 fw500 nowrap padd-0-05"},[s._v(s._s(a.$контрагент.title))]),s._v(" "),e("span",{directives:[{name:"show",rawName:"v-show",value:a.$контрагент["реквизиты"]&&a.$контрагент["реквизиты"]["ИНН"],expression:"selected.$контрагент['реквизиты'] && selected.$контрагент['реквизиты']['ИНН']"}],staticClass:"chip000 fs10 nowrap padd-0-05"},[e("span",{staticClass:"fs8 grey-text"},[s._v("ИНН:")]),s._v(" "+s._s(a.$контрагент["реквизиты"]["ИНН"]))]),s._v(" "),e("span",{staticClass:"chip000 nowrap padd-0-05",attrs:{title:"номер договора"}},[e("span",{staticClass:"fs8-000 grey-text"},[s._v("дог. №")]),s._v(" "+s._s(a["номер"].replace("№",""))+" "),e("span",{staticClass:"fs8-000 grey-text"},[s._v("от")]),s._v(" "+s._s(a["дата договора"]||a["дата1"])+" ")]),s._v(" "),e("span",{staticClass:"chip000 fs10-000 nowrap padd-0-05",attrs:{title:"объект и помещения"}},[e("span",[e("i",{staticClass:"fs10 material-icons"},[s._v("place")])]),s._v(" "),e("span",[s._v(s._s(a["@помещения"]&&a["@помещения"][0]&&a["@помещения"][0].$объект.name))])])]):e("h4",{staticClass:"grey-text"},[s._v("Выбрать договор арендатора")])]}},{key:"listItem",fn:function(t){var a=t.listItem,i=t.selected,l=t.highlighted;return[e("h5",{staticClass:"hover-shadow3d padd-0-05 relative",class:{"maroon-text":a["архив?"],"teal-text text-darken-4":!a["архив?"],"bold fs12":a===i,fw500:a===l,nowrap:a!==i}},[e("i",{directives:[{name:"show",rawName:"v-show",value:a["архив?"],expression:"listItem['архив?']"}],staticClass:"fs10 material-icons"},[s._v("lock")]),s._v(" "),e("span",{staticClass:"chip padd-0-05"},[s._v(s._s(a.$контрагент.title))]),s._v(" "),e("span",{staticClass:"chip fs8 padd-0-05"},[e("span",{staticClass:"fs8 grey-text"},[s._v("ИНН:")]),s._v(" "+s._s(a.$контрагент["реквизиты"]&&a.$контрагент["реквизиты"]["ИНН"]))]),s._v(" "),e("span",{staticClass:"chip padd-0-05",attrs:{title:"номер договора"}},[e("span",{staticClass:"fs8-000 grey-text"},[s._v("дог.")]),s._v(" № "+s._s(a["номер"].replace("№",""))+" от "+s._s(a["дата договора"]||a["дата1"]))]),s._v(" "),e("span",{staticClass:"chip padd-0-05",attrs:{title:"объект и помещения"}},[e("span",[e("i",{staticClass:"fs10 material-icons"},[s._v("place")])]),s._v(" "),e("span",{staticClass:"fs8"},[s._v(s._s(a["@помещения"]&&a["@помещения"][0]&&a["@помещения"][0].$объект.name))])])])]}}])}):e("v-progress-indeterminate",{attrs:{color:"teal",message:"Загружается..."}})},staticRenderFns:[],_compiled:!0,_scopeId:null,functional:void 0});