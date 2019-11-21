(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Отгрузка::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'Компонент::Поиск в списке',*/ 'Компонент::Контрагент', 'Компонент::Выбор в списке', /*'Химия::Сырье::Остатки',*/ 'EventBus' ]);

module
.factory('$КомпонентХимияОтгрузкаФорма', function($templateCache, appRoutes, $http, $q, /*$КомпонентПоискВСписке,*/ $КомпонентКонтрагент, $КомпонентВыборВСписке, $Список, /*$ХимияСырьеТекущиеОстатки,*/ $EventBus, /** Util */) {// factory
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


ContragentData(){///для обновления списка
  var loader = new $Список(appRoutes.urlFor('химия/контрагенты'));
  loader.Load();
  return loader;
},

//~ StockData(){
  //~ return $ХимияСырьеТекущиеОстатки.Load().then(function(){
    //~ $ХимияСырьеТекущиеОстатки.Data().map(function(item){
      //~ item._match = [/*item.$номенклатура.parents_title.slice(1).join('\n'), */item.$номенклатура.title, item['ед'], item['№ ПИ']].join('\n');
    //~ });
  //~ });
  
//~ },

};

var contragentData =  util.ContragentData();
//~ util.StockData();

const methods = {
  
  InitForm(item){
    var vm = this;
    var d = new Date;
    item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
    //~ item['номенклатура'] = {"id": item['номенклатура/id'], "title": (item['$номенклатура'] && item['$номенклатура'].title) || ''};
    //~ if (!item['$контрагент']) item['$контрагент'] = {"title": ''};
    //~ if (!item['контрагент']) 
    item['контрагент'] = {"id": item['контрагент/id']};
    if (!item['@отгрузка/позиции']) item['@отгрузка/позиции'] = [];
    else item['@отгрузка/позиции'].map((it)=>{it._id = vm.idMaker.next().value});
    if (!item['@отгрузка/позиции'].length) item['@отгрузка/позиции'].push({"_id": vm.idMaker.next().value});/// это поле для компутед суммы!!!
    return item;
  },
  
  ContragentData(){
    var vm = this;
    if (!contragentData) contragentData =  util.ContragentData();/// ага обновиться
    return contragentData.Load(/*уже передан параметр*/).then(function(data){
      vm.contragentData = contragentData.Data();
    });
  },
  
  SelectContragent(data){///из компонента
    var vm = this;
    //~ console.log("SelectContragent", data);
    vm.form['контрагент'] = data;
  },
  
  //~ StockData(){
    //~ var vm = this;
    //~ return $ХимияСырьеТекущиеОстатки.Load().then(function(){
      //~ vm.stockData = $ХимияСырьеТекущиеОстатки.Data();
    //~ });
    
  //~ },
  
OnProdInputChange(query, vmSuggest){///из v-suggest
  var vm = this;
  //~ 
  if (query === null) return; ///vm.MapSuggest(vm.autocomplete);
  if (vm.form['номенклатура'].id && vm.form['номенклатура'].title != query) vm.form['номенклатура'].id = undefined;
  vm.form['номенклатура'].title = query;
  //~ vm.$emit('on-select', vm.form);/// потому что для нового контрагента передать title
  //~ console.log("OnProdInputChange", query, vm.form['номенклатура']);
  //~ return util.CleanString(query); /// обязательно очищеннный запрос-строка
},

OnProdSelect(item, idx, vmSuggest){
  var vm = this;
  //~ var item = vm.lastItems[idx];
  //~ console.log("onSuggestSelect", item, vmSuggest.options);
  if (!item) /*сброс*/ vm.form['номенклатура'] = {"title":''};
  else if (item.data) Object.assign(vm.form['номенклатура'], item.data);
  return item.title || '';/// !!! Вернуть строку
},

OnStockSelect(data, select) {
  var vm = this;
  var row = select.row;
  var rows = vm.form['@отгрузка/позиции'];
  
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
    //~ return (form['номенклатура'].title && form['номенклатура'].title.length)
      //~ && form['количество'] && form['№ партии'] && this.ValidStock();
    
  },
  
  
  Save(){
    var vm = this;
    
    vm.cancelerHttp =  $http.post(appRoutes.urlFor('химия/сохранить отгрузку'), vm.form)
      .then(function(resp){
        vm.cancelerHttp = undefined;
        if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
        vm.$emit('on-save', resp.data.success);
        prodNomenData = undefined;///будет обновление
        //~ $ХимияСырьеТекущиеОстатки.Clear();///обновление
        $EventBus.$emit('Обновить текущие остатки сырья');
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
  $q.all([vm.ContragentData(), /*vm.StockData()*/]).then(function(){
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
  $Компонент.template = $templateCache.get('компонент/химия/отгрузка/форма');/// только в конструкторе
  //~ $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();/// для контрагента
  $Компонент.components['v-contragent'] =  new $КомпонентКонтрагент();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();/// для позиций
  return $Компонент;
};

return $Конструктор;
});

})();