(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Продукция::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Поиск в списке', 'Компонент::Выбор в списке', 'Химия::Сырье::Остатки', ]);

module
.factory('$КомпонентХимияПродукцияФорма', function($templateCache, appRoutes, $http, $q, $КомпонентПоискВСписке, $КомпонентВыборВСписке, $Список, $ХимияСырьеТекущиеОстатки /*$timeout,$rootScope, , /**$compile, Util $EventBus*/) {// factory
//~ Vue.use(VueNumeric.default);
  
const props = {
  "item": {
    "type": Object,
    "default": function(){
      return {};
    },
  },
  
};

const data = function(){
  var vm = this;
  vm.stockData = $ХимияСырьеТекущиеОстатки.Data();
  return {
    "ready": false,
    "form": vm.InitForm(angular.copy(vm.item)),
    "cancelerHttp": undefined,
  };
  
};

const util = {
CleanString(str){
  return str.toLowerCase().replace(util.re.trash, '').replace(util.re['space2+'], ' ').trim();
},

re: {
  "trash": /[^ \.\-\w\u0400-\u04FF]/gi,
  "space":  / /,
  "space2+": / {2,}/g,
  
},

_MapProdData(item){
  return {title: item.title, data: item, _match: item.title};
},

ProdData(){///для обновления списка
  var data = new $Список(appRoutes.urlFor('химия/номенклатура'));
  data.OnLoadMap = function(d){
    return d.map(util._MapProdData);
  };
  data.Load({"parent_title": '★ продукция ★'});
  return data;
},

};

var prodData =  util.ProdData();
$ХимияСырьеТекущиеОстатки.Load().then(function(){
  $ХимияСырьеТекущиеОстатки.Data().map(function(item){
    item._match = [/*item.$номенклатура.parents_title.slice(1).join('\n'), */item.$номенклатура.title, item['ед'], item['№ ПИ']].join('\n');
  });
});

const methods = {
  InitForm(item){
    var vm = this;
    var d = new Date;
    item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
    //~ if (!item['номенклатура']) 
    item['номенклатура'] = {"id": item['номенклатура/id'], "title": (item['$номенклатура'] && item['$номенклатура'].title) || ''};
    if (!item['@сырье']) item['@сырье'] = [];
    if (!item['@сырье'].length) item['@сырье'].push({});/// это поле для компутед суммы!!!
    return item;
  },
  
  ProdData(){
    var vm = this;
    return prodData.Load(/*уже передан параметр*/).then(function(data){
      vm.prodData = prodData.Data();
    });
  },
  
  //~ StockOstatData(){
    //~ vm['остатки сырья'] = $ХимияСырьеТекущиеОстатки;
    //~ return vm['остатки '].Load();
    
  //~ }
  
OnProdInputChange(query, vmSuggest){///из v-suggest
  var vm = this;
  //~ 
  if (query === null) return; ///vm.MapSuggest(vm.autocomplete);
  if (vm.form['номенклатура'].id && vm.form['номенклатура'].title != query) vm.form['номенклатура'].id = undefined;
  vm.form['номенклатура'].title = query;
  //~ vm.$emit('on-select', vm.form);/// потому что для нового контрагента передать title
  //~ console.log("OnProdInputChange", query, vm.form['номенклатура']);
  return util.CleanString(query); /// обязательно очищеннный запрос-строка
},

OnProdSelect(item, idx, vmSuggest){
  var vm = this;
  //~ var item = vm.lastItems[idx];
  //~ console.log("onSuggestSelect", item, vmSuggest.options);
  if (!item) /*сброс*/ vm.form['номенклатура'] = {"title":''};
  else if (item.data) Object.assign(vm.form['номенклатура'], item.data);
  return item.title || '';/// !!! Вернуть строку
},

OnStockSelect(item, select{
  var vm = this;
  //~ var item = vm.lastItems[idx];
  console.log("onSuggestSelect", item, select);
  //~ if (!item) /*сброс*/ vm.form['номенклатура'] = {"title":''};
  //~ else if (item.data) Object.assign(vm.form['номенклатура'], item.data);
  //~ return item.title || '';/// !!! Вернуть строку
},
  
  CancelBtn(){
    this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
  },
  
  IsNumber (event) {
   let keyCode = (event.keyCode ? event.keyCode : event.which);
    //~ console.log("IsNumber", keyCode); //keyCodes value
   if ((keyCode < 48 || keyCode > 57) && keyCode !== 44) { // 46 is dot
      event.preventDefault();
   }
  },

  Valid(name){
    var form = this.form;
    return (form['номенклатура'].title && form['номенклатура'].title.length)
      && form['количество'] /*&& form['№ партии']*/;
    
  },
  
  Save(){
    var vm = this;
    
    vm.cancelerHttp =  $http.post(appRoutes.urlFor('химия/сохранить продукцию'), vm.form)
      .then(function(resp){
        vm.cancelerHttp = undefined;
        if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
        vm.$emit('on-save', resp.data.success);
      },
      function(resp){
        console.log("Ошибка сохранения", resp);
        Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        vm.cancelerHttp = undefined;
      });
  },
  
  SetDate(date){
    var vm = this;
    vm.form['дата'] = date;

  },
};

const mounted = function(){
  //~ this.$nextTick(() => {
    //~ window.uploader = this.$refs.uploader.uploader;
  //~ });
  var vm = this;
  $q.all([vm.ProdData(), $ХимияСырьеТекущиеОстатки.Load()]).then(function(){
    vm.ready = true;
    setTimeout(function(){
      $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
        //~ formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {
          var s = this.component.item.select;
          //~ vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-')); console.log("pickadate", this); 
          vm.SetDate([s.year, s.month+1, s.date].join('-'));
        },
      });
        
    });
  });
};/// конец mounted

var $Компонент = {
  props,
  data,
  methods,
  mounted,
  //~ computed,
  components: {},
};


const $Конструктор = function (){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент/химия/продукция/форма');/// только в конструкторе
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  return $Компонент;
};

return $Конструктор;
});

})();