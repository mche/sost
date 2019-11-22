(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Продукция::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Поиск в списке', 'Компонент::Выбор в списке', 'Химия::Сырье::Остатки', 'EventBus' ]);

module
.factory('$КомпонентХимияПродукцияФорма', function($templateCache, appRoutes, $http, $q, $КомпонентПоискВСписке, $КомпонентВыборВСписке, $Список, $ХимияСырьеТекущиеОстатки, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
//~ Vue.use(VueNumeric.default);
  
const props = {
  "item": {
    "type": Object,
    "default": function(){
      return {};
    },
  },
  
};

const idMaker = IdMaker();/// глобал util/IdMaker.js
const data = function(){
  var vm = this;
  vm.idMaker = idMaker;
  //~ vm.StockData();
  return {
    "ready": false,
    "form": vm.InitForm(angular.copy(vm.item)),
    "cancelerHttp": undefined,
  };
  
};

const util = {


//~ _MapProdData(item){
  //~ return {title: item.title, data: item, _match: item.title};
//~ },

ProdNomenData(){///для обновления списка
  var loader = new $Список(appRoutes.urlFor('химия/номенклатура'));
  //~ loader.OnLoadMap = util._MapProdData;/// function(d){ return d.map(util._MapProdData); };
  loader.Load({"parent_title": '★ продукция ★'});
  return loader;
},

//~ StockData(){
  //~ return $ХимияСырьеТекущиеОстатки.Load().then(function(){
    //~ $ХимияСырьеТекущиеОстатки.Data().map(function(item){

    //~ });
  //~ });
  
//~ },

};

var prodNomenData =  util.ProdNomenData();
$ХимияСырьеТекущиеОстатки.Load();

const methods = {
  InitForm(item){
    var vm = this;
    var d = new Date;
    item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
    //~ if (!item['номенклатура']) 
    item['номенклатура'] = {"id": item['номенклатура/id'], "title": (item['$номенклатура'] && item['$номенклатура'].title) || ''};
    if (!item['@продукция/сырье']) item['@продукция/сырье'] = [];
    else item['@продукция/сырье'].map((it)=>{it._id = vm.idMaker.next().value});
    if (!item['@продукция/сырье'].length) item['@продукция/сырье'].push({"_id": vm.idMaker.next().value});/// это поле для компутед суммы!!!
    return item;
  },
  
  ProdNomenData(){
    var vm = this;
    if (!prodNomenData) prodNomenData =  util.ProdNomenData();/// ага обновиться
    return prodNomenData.Load(/*уже передан параметр*/).then(function(data){
      vm.prodNomenData = prodNomenData.Data();
    });
  },
  
  StockData(){
    var vm = this;
    return $ХимияСырьеТекущиеОстатки.Load().then(function(){
      vm.stockData = $ХимияСырьеТекущиеОстатки.Data();
    });
    
  },
  
OnProdInputChange(query, vmSuggest){///из v-suggest
  var vm = this;
  if (query === null) return; ///vm.MapSuggest(vm.autocomplete);
  if (vm.form['номенклатура'].id && vm.form['номенклатура'].title != query) vm.form['номенклатура'].id = undefined;
  vm.form['номенклатура'].title = query;
  //~ console.log("OnProdInputChange", query, vm.form['номенклатура']);
  //~ return util.CleanString(query); /// обязательно очищеннный запрос-строка
},

OnProdSelect(item, idx, vmSuggest){
  var vm = this;
  //~ var item = vm.lastItems[idx];
  //~ console.log("onSuggestSelect", item, vmSuggest.options);
  if (!item) /*сброс*/ vm.form['номенклатура'] = {"title":''};
  else /*if (item.data)*/ Object.assign(vm.form['номенклатура'], item/*.data*/);
  return item.title || '';/// !!! Вернуть строку
},

OnStockSelect(data, select) {
  var vm = this;
  var row = select.row;
  var rows = vm.form['@продукция/сырье'];
  
  //~ console.log("OnStockSelect", data, select);
  
  if (!data) {/*сброс*/
    vm.$set(row, 'сырье/id', undefined);
    vm.$set(row, '_stock', undefined);
    
    if (rows.length > 1 && !rows[rows.length-1]['сырье/id'] &&  row === rows[rows.length-2]) rows.pop();
  }
  else /*if (data.row)*/ {
    vm.$set(row, 'сырье/id', data.id);
    vm.$set(row, '_stock', data);
    if ( row === rows[rows.length-1])  rows.push({"_id": vm.idMaker.next().value});
  }
  
  
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
      && form['количество'] && form['№ партии'] && this.ValidStock();
    
  },
  
  ValidStock(){
    var vm = this;
    return vm.form['@продукция/сырье'].some(vm.ValidStockRow);
    
  },
  
  ValidStockRow(row){
    return !!row['сырье/id'] && !!row['количество'];
  },
  
  Save(){
    var vm = this;
    
    vm.cancelerHttp =  $http.post(appRoutes.urlFor('химия/сохранить продукцию'), vm.form)
      .then(function(resp){
        vm.cancelerHttp = undefined;
        if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
        vm.$emit('on-save', resp.data.success);
        prodNomenData = undefined;///будет обновление
        //~ $ХимияСырьеТекущиеОстатки.Clear();///обновление
        $EventBus.$emit('Обновить текущие остатки сырья');
        $EventBus.$emit('Обновить текущие остатки продукции');
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
  $q.all([vm.ProdNomenData(), vm.StockData()]).then(function(){
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