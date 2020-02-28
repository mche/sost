(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаРасходыФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Расходы::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus', 'Компонент::Поиск в списке', 'Компонент::Выбор в списке', /* 'Uploader::Файлы',*/ ]);

module
.factory('$КомпонентАрендаРасходыФорма', function($templateCache, $http, $q, $timeout, appRoutes, $EventBus, $КомпонентПоискВСписке, $КомпонентВыборВСписке, Util/*$КомпонентФайлы */) {// factory

//~ var rentRoomsData;///синглетон для данных объектов аренды
//~ $Контрагенты.Load();

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};///конец props
  
const util = {/*разное*/
  //~ IsEqualId(it){ return (it.id || it) == this.id; },
  MapPosItem(pos){
    var vm = this;
    //~ console.log("MapItemRooms", room);
    //~ var r = room['помещение/id'] && rentRoomsData.find(util.IsEqualId, {"id": room['помещение/id']});
    //~ room['объект-помещение'] = room.$помещение ? `${ room.$объект['name'] }: №${ room.$помещение['номер-название'] }, ${ room.$помещение['этаж'] } эт., ${ parseFloat(room.$помещение['площадь']).toLocaleString() } м²` : '';
    pos._id = vm.idMaker.next().value;
    //~ vm.InputMetr(room) || vm.InputSum(room);
  },
  FilterPos(item){
    return item._match.indexOf(this.match) !== -1;
  },
  //~ MapRoom(item){
    //~ return item['объект-помещение'];
  //~ },
};///конец util

const methods = {/*методы*/


Ready(){/// метод
  var vm = this;
  
  //~ vm.rentRooms = rentRoomsData;

  vm.ready = true;
  $timeout(function(){
    //~ $('input[type="text"]', $(vm.$el)).first().focus();
    
    vm.InitDatepicker($('.datepicker', $(vm.$el)));
    
    $('.modal', $(vm.$el)).modal();
  });

},

InitDatepicker(el){
  var vm = this;
  el.pickadate({// все настройки в файле русификации ru_RU.js
    //~ "clear": 'Очистить',
    "formatSkipYear": false,// доп костыль - дописывать год при установке
    "onSet": function (context) {
      var s = this.component.item.select;
      if (!s) return;
      vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-'));
    },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  });//{closeOnSelect: true,}
  
},

ContragentContractData(){
  var vm = this;
  return $http.post(appRoutes.urlFor('аренда/договоры/список'), {"договоры на дату": vm.form['дата'], "order_by": " order by  lower(regexp_replace(k.title, '^\W', '', 'g')) "}).then(function(resp){
    vm.contragentContracts = resp.data.map(function(item){
      item._match = `${ item['$контрагент']['title']  } ${  item['@помещения'][0]['$объект'].name } ${ item['@помещения'].map(p=>{ return p['$помещение']['номер-название']; }).join(':') } ${ item['дата1'] } ${ item['номер'] }`.toLowerCase();
     /// , /*"адрес": item['адрес'],*/ "$помещение": room, "$объект": item['$объект'],});
      return item;
    });
  });
},

NomenData(){/// номенклатура позиций
  var vm = this;
  return $http.get(appRoutes.urlFor('аренда/расходы/номенклатура')).then(function(resp){
    vm.nomenData = resp.data.map((item)=>{
      item._match = item.title;
      return item;
    });
  });
},

OnNomenInput(query, propItem){/// из компонента выбор из списка
  var vm = this;
  //~ console.log("OnNomenInput", query, propItem);
  if (/*query === '' || */query === null || query === undefined) return  vm.RemovePos(propItem); ///vm.MapSuggest(vm.autocomplete);
  if (propItem['$номенклатура'].id && propItem['$номенклатура'].title != query) vm.$set(propItem, '$номенклатура', {});//Object.keys(propItem['$номенклатура']).forEach((k)=>{ delete propItem['$номенклатура'][k]; });
  propItem['$номенклатура'].title = query;
  vm.AddPos(propItem);
},

OnNomenSelect(item, idx, propItem){/// из компонента выбор из списка
  //~ console.log("OnNomenSelect", item, idx, propItem);
  var vm = this;
  var items = vm.form['@позиции'];
  vm.AddPos(propItem);
  if (item) {
    //~ Object.assign(propItem.$номенклатура, item);
    vm.$set(propItem, '$номенклатура', item);
    if (item['$позиция']) {
      if (!propItem['ед']) propItem['ед']=item['$позиция']['ед'];
      if (!propItem['цена']) {
        propItem['цена']=item['$позиция']['цена'];
        vm.PosSum(propItem);
      }
    }
  } else {///удалить строку формы
    items.removeOf(propItem);
  }
  return (item && item.title) || '';/// !!! Вернуть строку
},

AddPos(pos, items){
  var vm = this;
  items = items || vm.form['@позиции'];
  if (!pos || pos  === items[items.length-1])  items.push({"$номенклатура":{"title": ''}, /*"количество":'', "цена":'',*/ "сумма":'', "_id": vm.idMaker.next().value});/// тут обязательно объявить реактивные поля!
},

RemovePos(pos){
   this.form['@позиции'].removeOf(pos);
},

InitForm(item){/// обязательные реактивные поля
  var vm = this;
  var d = new Date;
  item["дата"] = item["дата"] || vm.param['месяц'] || d.toISOString().replace(/T.+/, '');
  //~ item["дата2"] = item["дата2"] || (new Date(d.setMonth(d.getMonth() + 11))).toISOString().replace(/T.+/, '');
  //~ if (!item['договор']) item['договор'] = {"id": item['договор/id'], /*"реквизиты":{},*/};
  if (!item['договор/id']) item['договор/id'] = undefined;
  if (!item['@позиции']) item['@позиции'] = [];
  if (!item['@позиции'].length) vm.AddPos(undefined, item['@позиции']);//.push({"$номенклатура":{"title": ''}, "сумма": ''});/// это поле для компутед суммы!!!
  item['@позиции'].map(util.MapPosItem, vm);
  item._uploads = [];
  item._id = vm.idMaker.next().value;
  return item;
},


Save(){
  var vm = this;
  
  //~ vm.form['контрагент']['реквизиты'] = JSON.stringify({"ИНН": vm.form['контрагент/ИНН'], "юр. адрес": vm.form['контрагент/юр. адрес']});
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить расход'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      //~ vm.$emit('on-save', resp.data.success);
      console.log("Сохранено", resp.data);
      //~ $Контрагенты.RefreshData();
      //~ vm.ContragentData();
      //~ rentRoomsData = undefined;
    },
    function(resp){
      console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},

Valid(name){
  var vm = this;
  //~ if (name == 'договор') return !!(vm.form['договор'].id || vm.form['договор'].title);
  if (name) return !!vm.form[name];
  
  return vm.form['дата'] && vm.form['договор/id']
    && vm.ValidPos()
  ;
},

ValidPos(pos){
  var vm = this;
  if (pos) return pos['$номенклатура'] && (pos['$номенклатура'].id || pos['$номенклатура'].title)  && !!vm.ParseNum(pos['количество']) && !!vm.ParseNum(pos['цена']);
  return vm.form['@позиции'].length > 1
    && vm.form['@позиции'].slice(0,-1).every(function(pos){
      return vm.ValidPos(pos);
    });
  
},



CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

//~ SelectContragent(data){///из компонента
  //~ var vm = this;
  //~ vm.form['контрагент'] = data;
  //~ vm.form['$контрагент'] = data;
//~ },

OnContragentSelect(item, propSelect){/// из компонента выбор из списка 
  //~ console.log("OnContractSelect", item, propSelect);
  var vm = this;
  vm.form['договор/id'] = item ? item.id : undefined;
}, 



PosSum(pos){
  var vm = this;
  pos['количество'] = vm.ParseNum(pos['количество']);
  pos['цена'] = vm.ParseNum(pos['цена']);
  pos['сумма'] = pos['количество'] * pos['цена'];
  pos['цена'] = pos['цена'] || '';
  vm.$set(pos, 'сумма2', pos['сумма'] && pos['сумма'].toLocaleString({"currency": 'RUB'}) +' ₽');
},

ParseNum(num){
  return parseFloat(Util.numeric(num)) || 0;
},

ClearDate(name){
  var vm = this;
  vm.form[name] = null;
  vm.keys[name] = vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    vm.InitDatepicker(el);
    //~ console.log("ClearDate", el);
  });
},

}; /// конец methods

const computed = {

TotalSum(){
  var vm = this;
  var s = vm.form['@позиции'].reduce(function(a, pos){
    if (!pos || !pos['сумма']) return a;
    return a + pos['сумма'];
  }, 0);
  return s;
},

//~ TotalSqure(){
  //~ var vm = this;
  //~ var s = vm.form['@помещения'].reduce(function(a, room){
    //~ if (!room || !room.$помещение) return a;
    //~ return a + vm.ParseNum(room.$помещение['площадь']);
  //~ }, 0.0);
  //~ return s;
//~ },

};

const idMaker = IdMaker();/// глобал util/IdMaker.js

const data = function() {
  let vm = this;
  vm.idMaker = idMaker;
  var form = vm.InitForm(angular.copy(vm.item));
  //~ if (form.id) vm.Uploads(form.id);

  return {//
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "keys": {"дата расторжения": vm.idMaker.next().value, "дата договора":vm.idMaker.next().value}, ///передерг рендер
    //~ "uploads": [],
  };
  //);
};///конец data

const mounted = function(){

  var vm = this;
  $q.all([vm.ContragentContractData(), vm.NomenData()]).then(function(){
    vm.Ready();
  });
};/// конец mounted


var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  mounted,
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('аренда/расходы/форма');
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  //~ $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());