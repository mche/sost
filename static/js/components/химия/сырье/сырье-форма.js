(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Сырье::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Поиск в списке', 'Химия::Номенклатура', 'Uploader::Файлы', 'EventBus']);


module
.factory('$КомпонентХимияСырьеФорма', function($templateCache, appRoutes, $http, $КомпонентПоискВСписке, $ХимияНоменклатураСырье, $КомпонентФайлы, $EventBus  /*$timeout,$rootScope, , /**$compile, Util*/) {// factory
  
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
  return {
    "ready": false,
    "form": vm.InitForm(angular.copy(vm.item)),
    "cancelerHttp": undefined,
  };
  
};

const util = {

};

//~ var stockNomenData =  $ХимияНоменклатураСырье;

const methods = {
  InitForm(item){
    var vm = this;
    var d = new Date;
    item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
    //~ if (!item['номенклатура']) 
    item['номенклатура'] = {"id": item['номенклатура/id'], "title": (item['$номенклатура'] && item['$номенклатура'].title) || ''};
    return item;
  },
  
  StockNomenData(){
    var vm = this;
    //~ if (!stockNomenData) stockNomenData =  util.StockNomenData();/// если было обновление
    return $ХимияНоменклатураСырье.Load(/*уже передан параметр*/).then(function(data){
      vm.stockNomenData = $ХимияНоменклатураСырье.Data();
    });
  },
  
OnStockInputChange(query){///из v-suggest propItem, vmSuggest
  var vm = this;
  //~ 
  if (query === null) return; ///vm.MapSuggest(vm.autocomplete);
  if (vm.form['номенклатура'].id && vm.form['номенклатура'].title != query) vm.form['номенклатура'].id = undefined;
  vm.form['номенклатура'].title = query;
  //~ vm.$emit('on-select', vm.form);/// потому что для нового контрагента передать title
  //~ console.log("OnStockInputChange", query, vm.form['номенклатура']);
  //~ return util.CleanString(query); /// обязательно очищеннный запрос-строка
},

OnStockSelect(item, idx){///, propItem, vmSuggest
  var vm = this;
  //~ var item = vm.lastItems[idx];
  //~ console.log("onSuggestSelect", item, vmSuggest.options);
  if (!item) /*сброс*/ vm.form['номенклатура'] = {"title":''};
  else /*if (item.data)*/ Object.assign(vm.form['номенклатура'], item/*.data*/);
  return item.title || '';/// !!! Вернуть строку
},
  
  CancelBtn(){
    this.$emit('on-save', this.item.id ? {"id": this.item.id, "отмена": true} : undefined);
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
    return form['номенклатура'].title
      && form['количество'] && form['ед'];
    
  },
  
  Save(){
    var vm = this;
    
    vm.cancelerHttp =  $http.post(appRoutes.urlFor('химия/сохранить сырье'), vm.form)
      .then(function(resp){
        vm.cancelerHttp = undefined;
        if (resp.data.hasOwnProperty('error')) return Materialize.toast("Ошибка сохранения "+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        Materialize.toast($('<h1>').html('Сохранено успешно').addClass('green-text text-darken-3 '), 2000, 'green-text text-darken-3 green lighten-4 fw500 border animated zoomInUp');
        vm.$emit('on-save', resp.data.success);
        //~ stockNomenData = undefined;
        $EventBus.$emit('Обновить текущие остатки сырья');
        //~ if (vm.form['номенклатура'])
        $EventBus.$emit('Обновить номенклатуру сырья');
        
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
  vm.StockNomenData().then(function(){
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
      
      setTimeout(function(){
        //~ /*if (vm.item.id) */vm.$el.scrollTop = vm.$el.scrollHeight;  //
        //~ if (!vm.item.id) 
        vm.$el.scrollIntoView(true);
      }, 500);
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
  $Компонент.template = $templateCache.get('компонент/химия/сырье/форма');/// только в конструкторе
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  return $Компонент;
};

return $Конструктор;
});

})();