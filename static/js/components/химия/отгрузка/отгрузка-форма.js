(function () {'use strict';
/**/
var moduleName = "Компонент::Химия::Отгрузка::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'Компонент::Поиск в списке',*/ 'Компонент::Контрагент', 'Компонент::Выбор в списке', 'Химия::Сырье::Остатки', 'Химия::Продукция::Остатки', 'EventBus', 'Химия::Контрагенты' ]);

module
.factory('$КомпонентХимияОтгрузкаФорма', function($templateCache, appRoutes, $http, $q, /*$КомпонентПоискВСписке,*/ $КомпонентКонтрагент, $КомпонентВыборВСписке, $Список, $ХимияСырьеТекущиеОстатки, $ХимияПродукцияТекущиеОстатки, $EventBus, $ХимияКонтрагенты /** Util */) {// factory
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


//~ ContragentData(){///для обновления списка
  //~ var loader = new $Список(appRoutes.urlFor('химия/контрагенты'));
  //~ loader.Load();
  //~ return loader;
//~ },

//~ StockData(){
  //~ return $ХимияСырьеТекущиеОстатки.Load().then(function(){
    //~ $ХимияСырьеТекущиеОстатки.Data().map(function(item){
      //~ item._match = [/*item.$номенклатура.parents_title.slice(1).join('\n'), */item.$номенклатура.title, item['ед'], item['№ ПИ']].join('\n');
    //~ });
  //~ });
  
//~ },

};

var contragentData = $ХимияКонтрагенты;
$ХимияПродукцияТекущиеОстатки.Load();
$ХимияСырьеТекущиеОстатки.Load();

const methods = {

  InitForm(item){
    var vm = this;
    var d = new Date;
    item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
    //~ item['номенклатура'] = {"id": item['номенклатура/id'], "title": (item['$номенклатура'] && item['$номенклатура'].title) || ''};
    //~ if (!item['$контрагент']) item['$контрагент'] = {"title": ''};
    //~ if (!item['контрагент']) 
    item['контрагент'] = {"id": item['контрагент/id']};
    if (!item['@позиции']) item['@позиции'] = [];
    else item['@позиции'].map((it)=>{it._id = vm.idMaker.next().value});
    if (!item['@позиции'].length) item['@позиции'].push({"_id": vm.idMaker.next().value});/// это поле для компутед суммы!!!
    return item;
  },
  
  ContragentData(){
    var vm = this;
    if (!contragentData) contragentData =  $ХимияКонтрагенты;/// ага обновиться
    return contragentData.Load(/*уже передан параметр*/).then(function(data){
      vm.contragentData = contragentData.Data();
    });
  },
  
  SelectContragent(data){///из компонента
    var vm = this;
    //~ console.log("SelectContragent", data);
    vm.form['контрагент'] = data;
  },
  
  StockData(){
    var vm = this;
    return $ХимияСырьеТекущиеОстатки.Load().then(function(){
      vm.stockData = $ХимияСырьеТекущиеОстатки.Data();
    });
    
  },
  
  ProdData(){
    var vm = this;
    return $ХимияПродукцияТекущиеОстатки.Load().then(function(){
      vm.prodData = $ХимияПродукцияТекущиеОстатки.Data();
    });
    
  },

OnStockSelect(data, select) {
  var vm = this;
  var row = select.row;
  var rows = vm.form['@позиции'];
  
  //~ console.log("OnStockSelect", data, select);
  
  if (!data) {/*сброс*/
    vm.$set(row, 'продукция или сырье/id', undefined);
    vm.$set(row, '_stock', undefined);
    
    if (rows.length > 1 && !rows[rows.length-1]['продукция или сырье/id'] &&  row === rows[rows.length-2]) rows.pop();
  }
  else /*if (data.row)*/ {
    vm.$set(row, 'продукция или сырье/id', data.id);
    vm.$set(row, '_stock', data);
    if ( row === rows[rows.length-1])  rows.push({"_id": vm.idMaker.next().value});
  }
  
  
},
  
  CancelBtn(){
    this.$emit('on-save', /*this.item.id ? {"id": this.item.id} :*/ undefined);
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
    //~ console.log("Valid", form['контрагент']);
    return (form['контрагент'].id || form['контрагент'].title)
      //~ && form['количество'] && form['№ партии']
    && this.ValidPos()
    ;
    
  },
  ValidPos(){
    var vm = this;
    //~ console.log("ValidPos");
    return vm.form['@позиции'].some(vm.ValidPosRow);
    
  },
  
  ValidPosRow(row){
    //~ console.log("ValidPosRow", row);
    return !!row['продукция или сырье/id'] && !!row['количество'];
  },
  
  Save(){
    var vm = this;
    
    vm.cancelerHttp =  $http.post(appRoutes.urlFor('химия/сохранить отгрузку'), vm.form)
      .then(function(resp){
        vm.cancelerHttp = undefined;
        if (resp.data.hasOwnProperty('error')) return Materialize.toast("Ошибка сохранения "+ resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        Materialize.toast($('<h1>').html('Сохранено успешно').addClass('green-text text-darken-3 '), 2000, 'green-text text-darken-3 green lighten-4 fw500 border animated zoomInUp');
        vm.$emit('on-save', resp.data.success);
        contragentData = undefined;///будет обновление
        /// обновления не тут
        //~ $EventBus.$emit('Обновить контрагентов');
        //~ $EventBus.$emit('Обновить текущие остатки сырья');
        //~ $EventBus.$emit('Обновить текущие остатки продукции');
        
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
  $q.all([vm.ContragentData(), vm.StockData(), vm.ProdData(),]).then(function(){
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
      
      var scroll = vm.$el.children[0].children[0];
      /*if (vm.item.id) */ scroll.scrollTop = scroll.scrollHeight;  //
      //~ .scrollIntoView();
    });
  });
};/// конец mounted

//~ const computed = {
//~ };

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