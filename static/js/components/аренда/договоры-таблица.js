//~ import тест from '../тест2.js';
!(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
let moduleName = "Аренда::Договоры::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
let module = angular.module(moduleName, [ 'Аренда::Договор::Форма', 'Компонент::Выбор объекта', 'Компонент::Выбор в списке', 'Файлы::Просмотр',  'Uploader::Файлы', ]);//'UploaderCommon'

module.factory('$КомпонентАрендаДоговорыТаблица', function(/*$templateCache,*/ $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */ $EventBus, Util, $Список, $КомпонентАрендаДоговорФорма, $КомпонентВыборОбъекта, $КомпонентВыборВСписке, $КомпонентПросмотрФайла, $КомпонентФайлы) {// $UploaderViewIframeMixins

var projectList = new $Список(appRoutes.url_for('список проектов'));
projectList.Load();


  
const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  
};
  
const util = {/*разное*/
  IsEqualId(id){ return (id.id || id) == this.id; },
};/// конец util

const methods = {/*методы*/

Ready(){/// метод
  var vm = this;
  var loader = vm.ProjectData();
  $EventBus.$on('Дайте список проектов', function(cb){
    cb(loader);
  });
  $EventBus.$on('Прокрути к договору', function(id/*договора*/){
    //~ console.log('Прокрути к договору', id, vm.data.find(util.IsEqualId, {id}));
    vm.checkedItems.splice(0);
    let d = vm.data.find(util.IsEqualId, {id});
    vm.$set(d, 'архив', vm.IsArchiveContract(d));
    vm.checkedItems.push(d);
    vm.СброситьВсеФильтры();
    //~ vm.FilterData(); ///в ChbChange
    vm.ChbChange('архивные договоры', !!d['архив']);
    setTimeout(()=>{
      //~ $(`#contract-${ id }`, $(vm.$el)).get(0).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
      document.getElementById(`contract-${ id }`).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
    });
  });
  return vm.LoadData().then(function(){
    vm.FilterData();
    vm.ready = true;
    $EventBus.$emit('$КомпонентАрендаДоговорыТаблица - готов');
    /*$EventBus.$emit('Дайте список объектов аренды', function(loader){/// один раз выполнится
      loader.then(function(data){
        //~ console.log("Объекты аренды", data);
        //~ vm.rentObjects.push(...data.map((it)=>{ return it['$объект']; }));
        vm.rentObjects.push(...data.map((it)=>{ return {"id": it['$объект'].id, "_match": it['$объект'].name, "$item":it['$объект']}; }));
      });
    });*/
    //~ console.log("ТЕСТ", тест);
  });
},

InitDatePicker(el){
  var vm = this;
  el.pickadate({// все настройки в файле русификации ru_RU.js
    monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
    format: 'mmmm yyyy',
    monthOnly: 'OK',// кнопка
    selectYears: true,
    hiddenName: false,///!
    onClose: function (context) {/*console.log("onSet", this.$node[0].name);*/ var s = this.component.item.select; s && vm.$set(vm, this.$node[0].name/*"payMonth"*/ , [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  });//{closeOnSelect: true,}
  
},

ProjectData(){/// проекты - арендодатели
  var vm = this;
  return projectList.Load().then(function(){
    vm.projectData = projectList.Data();
    return vm.projectData;/// для промис
  });
},

LoadData(){
  var vm = this;
  vm._loader = new $Список(appRoutes.urlFor('аренда/договоры/список'));
  return vm._loader.Load()
    .then(function(resp){
      vm.data = vm._loader.Data();
      //~ vm.$договоры = vm._loader.$Data();
      return vm.data;
    });
},

SelectContract(obj){
  this.selectedContract  = obj;
  this.$emit('select-object', obj);
},

SelectProjectFilter(proj){
  //~ console.log("SelectProject", arguments);
  this.filters['арендодатель'] = proj;
  this.FilterData();
  this.AllChbsChange(!!proj);
},

New(){
  this.newContract = {};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},

/*ItemRooms(item){
  return item['@доп.соглашения'] && item['@доп.соглашения'].length
    ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения']
    :*item['@помещения'];
},*/

RoomPrice(room){
  return this.ParseNum(room['ставка']) || this.ParseNum(room['сумма'])/this.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : room.$помещение['площадь'])) || '';
},

RoomSquare(room){
  return this.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : room.$помещение['площадь']));
},

RoomSum(room){
  //~ console.log("RoomSum", room);
  return this.ParseNum(room['сумма'] || 0) || (this.ParseNum(room['ставка'] || 0)*this.RoomSquare(room))+this.ParseNum(room['сумма нал'] || 0);
},

RoomsSum(item){///итого за все помещения
  var vm = this;
  //~ console.log("RoomsSum", item.id, vm.filteredData.length,  item['@доп.соглашения'] && item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения'], item['@помещения']);
  return ((item['@доп.соглашения'] ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения'] : item['@помещения']) || []).reduce((a, room)=> a + vm.RoomSum(room), 0);
},

RoomsSquare(item){///итого площадь все помещения
  var vm = this;
  return ((item['@доп.соглашения'] ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения'] : item['@помещения']) || []).reduce((a, room) => a + vm.RoomSquare(room), 0.0);
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    var f = data.id && vm.data.find(util.IsEqualId, data);
    if (data['удалить']) {
      vm.data.removeOf(f);
      return vm.FilterData();///
    }
    
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      //~ vm.editItems.splice(vm.editItems.indexOf(f), 1);
      Object.assign(f, data);
    } else {/// новая
      if (data['копия/id']) f = vm.data.find(util.IsEqualId, {"id": data['копия/id']});
      if (f) {
        f._edit = undefined;
        //~ vm.editItems.splice(vm.editItems.indexOf(f), 1);
        //~ vm.data.splice(vm.data.indexOf(f), 0, data);
      } ///else 
      vm.data.unshift(data);
      //~ console.log("новый договор", data, f);
    }
    !vm.FilterData();/// или в шине !!!
    //~ $EventBus.$emit('Прокрути к договору', data.id);
  }
},

Edit(item){
  this.$set(item, '_edit', angular.copy(item));
  //~ let idx = this.editItems.indexOf(item);
  //~ if (idx == -1) this.editItems.push(item);
},

AllChbsChange(val){
  var vm = this;
  if (typeof val == 'boolean') vm.allChbs = val;
  //~ vm.data.map((item)=>{
    //~ item['крыжик'] = undefined;
  //~ });
  vm.checkedItems.splice(0);
  
  //~ vm.filteredData.forEach((item)=>{
    //~ item['крыжик'] =  !!vm.allChbs;
  //~ });
  if (!!vm.allChbs) vm.checkedItems = [...vm.filteredData];
},

ChbChange(name, val){
  if (val !== undefined) this.filters[name] = val; 
  this.FilterData();
  if (val === undefined) this.AllChbsChange(this.filters[name] === false ? true : !!this.filters[name]);
  //~ else this.AllChbsChange(val);
},

ClearDate(name, val){
  var vm = this;
  //~ vm.form[name] = val || null;
  vm[name]= val || null;
  vm.keys[name] = Math.random();//vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    vm.InitDatePicker(el);
    //~ console.log("ClearDate", el);
  });
},

PrintPay(month, month2){/// счета и акты
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  //~ console.log("PrintPay", month);
  if (!month) return modal.modal('open');
  
  var ids = ///vm.data.filter((item)=>{ return !!item['крыжик']; })
    vm.checkedItems.map((item)=>{ return item.id; });
  //~ var obs = vm.rentObjects.filter((ob)=>{ return !!ob['крыжик печати']; }).map((ob)=>{ return ob['$объект'].id; });
  //~ if (!ids.length) return Materialize.toast("не указаны договоры", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  //~ if (!obs.length) return Materialize.toast("не указан объект", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  vm.httpProcess = true;
  //~ console.log("PrintPay", month, ids);
  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/счет#docx', '-'/*обязательно что-нибудь*/), {"месяц": month, "месяц2":month2, "договоры": ids, "присвоить номера": vm.payNums, "счет или акт": vm.radioAccAct,  "безнал или всего": vm.radioNalBezNal, "pdf формат": vm.payPDF,/*"объекты":obs*/}).then(function(resp){
    vm.httpProcess  = false;
    modal.modal('close');
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.file) {
      //~ let url = appRoutes.urlFor('аренда/счет#docx', resp.data.docx);
      let url = appRoutes.urlFor('временный файл', resp.data.file+'?filename='+(resp.data.filename || '')+'&cleanup=0');
      if (vm.payPDF) return vm.iframeFile = {"src": url+'&inline=1', "content_type":'application/pdf', "file": resp.data.file};
      window.location.href = url;/// а это get-запрос
    }
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

///унес в миксин uploader/common.js
//~ ViewIframePDF(file){/// из uploader/файлы.js
  //~ var vm = this;
  //~ var iframe = {"src": file.src, "height": parseInt(window.innerHeight*0.8)/*modal max-height:90%;*/, "width": window.innerWidth, "content_type": file.content_type, "timeouts":[]};
  //~ if (vm.iframePDF) {
    //~ vm.iframePDF = undefined;
    //~ setTimeout(function(){ vm.iframePDF = iframe; });
  //~ } else 
  //~ vm.iframePDF = iframe;
  //~ iframe.timeouts.push(setTimeout(vm.CallbackWaitIframePDFLoad, 100));
//~ },
//~ CallbackWaitIframePDFLoad(){/// из uploader/файлы.js
  //~ var vm = this;
  //~ var iframe = vm.$el.getElementsByTagName('iframe')[0];
  //~ if (!iframe) return console.log("CallbackWaitIframePDFLoad просмотр закрыт");
  //~ if (vm.iframePDF.timeouts.length > 30 /* 30*100 мсек = 300 сек общее ожидание вызова просмотра*/) return console.log("CallbackWaitIframePDFLoad: нет просмотра по timeouts");
  //~ if (!iframe.contentDocument || iframe.contentDocument.URL/*contentWindow.document.URL*/ != 'about:blank') return $('#modal-view-in-iframe', $(vm.$el)).modal('open');
  //~ vm.iframePDF.timeouts.push(setTimeout(vm.CallbackWaitIframePDFLoad, 100));
//~ },

Reestr(month, month2){
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  var ids = ///vm.data.filter((item)=>{ return !!item['крыжик']; })
    vm.checkedItems.map((item)=>{ return item.id; }).join();
  vm.httpProcess  = true;
  window.location.href = appRoutes.url_for('аренда/реестр актов.xlsx',
    month+ ':'+(month2 || '')
    +':'+(vm.filters['арендодатель'] ? vm.filters['арендодатель'].id : '')
    +':'+ (ids || ''));
  setTimeout(()=>{
    vm.httpProcess  = false;
    //~ modal.modal('close');
  }, 2000);
  
},

ReestrBalance(){/// реестр долгов (пока в целом контрагенту, без разделения договоров)
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  var ids = ///vm.data.filter((item)=>{ return !!item['крыжик']; })
    vm.checkedItems.map((item)=>{ return item.$контрагент.id; });
    
  vm.httpProcess = true;
  /// вернет урл для GET-запроса
  return $http.post(appRoutes.urlFor('аренда/реестр долгов.xlsx'), {"арендодатель": vm.filters['арендодатель'].id, "контрагенты/id": ids,}).then(function(resp){
    vm.httpProcess  = false;
    //~ modal.modal('close');
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    //~ if (resp.data.xlsx) window.location.href = appRoutes.urlFor('аренда/движение по арендатору#xlsx', resp.data.xlsx);/// а это get-запрос
    if (resp.data.file) window.location.href = appRoutes.urlFor('временный файл', resp.data.file+'?filename='+(resp.data.filename || ''));
    if (resp.data.data) {//
      const debt = function(item) {  if (item.$контрагент.id === this['контрагент/id']) vm.$set(item, 'долг контрагента', this); };
      for (let idx = 0, len = resp.data.data.length; idx < len; ++idx) {
        (vm.checkedItems && vm.checkedItems.length ?  vm.checkedItems : vm.data).forEach(debt, resp.data.data[idx]);///отладка
      }
    }
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},
    
  //~ window.location.href = appRoutes.url_for('аренда/реестр долгов.xlsx',
    //~ month+ ':'+(month2 || '')
    //~ +':'+(vm.filters['арендодатель'] ? vm.filters['арендодатель'].id : '')
    //~ +':'+ (ids || ''));
  //~ setTimeout(()=>{
    //~ vm.httpProcess  = false;
    //~ modal.modal('close');
  //~ }, 2000);


SendMail(month, month2, send){/// без send выйдет просмотр таблички
  let vm = this;
  var ids = ///vm.data.filter((item)=>{ return !!item['крыжик']; })
    vm.checkedItems.map((item)=>{ return item.id; });
  vm.httpProcess = true;
  vm.dataEmail = undefined;
  if (!send) vm.formEmail['отправлено'] = false;
  return $http.post(appRoutes.urlFor('аренда/емайл'), {"месяц": month, "месяц2":month2, "договоры": ids, "присвоить номера": vm.payNums, "счет или акт": vm.radioAccAct,  "безнал или всего": vm.radioNalBezNal, "pdf формат": vm.payPDF, "отправить":send, "письмо": vm.formEmail,}).then(function(resp){
    vm.httpProcess  = false;
    $('#modal-pay', $(vm.$el)).modal('close');
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.data) {
      vm.dataEmail = resp.data.data;
      $('#modal-email', $(vm.$el)).modal('open');
      vm.formEmail = {"отправлено": send};
    }
    //~ if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  },
  function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.httpProcess = undefined;
    }
  );
  
},

//~ CopyClipBoard() {
  //~ var vm = this;
  //~ var textToCopy = vm.$el.getElementsByClassName('clipboard')[0];
  //~ var range = document.createRange();
  //~ range.selectNodeContents(textToCopy);
  //~ window.getSelection().addRange(range);
  //~ document.execCommand('copy');
//~ },

//~ UpdateClipboard(newClip) {
  //~ navigator.clipboard.writeText(newClip).then(function() {
    //~ /* clipboard successfully set */
    //~ Materialize.toast('Скопировано! ', 2000, 'blue-text text-darken-3 blue lighten-5 fw500 border animated zoomInUp fast');
  //~ }, function() {
    //~ /* clipboard write failed */
    //~ console.log('clipboard write failed', arguments);
  //~ });
//~ },

OnChangeFilter(event, ms){
  var vm = this;
  //~ console.log("OnKeyDownFilter", event.target.name, event.target.value);
  if (vm.filters.timeout) clearTimeout(vm.filters.timeout);
  vm.filters.timeout = setTimeout(() => {
    vm.FilterData();
  }, ms || 700);
  
},

_FilterData(item){
  var vm = this;
  //~ if (!item.hasOwnProperty('_edit')) item['_edit']  = undefined;/// доп реакт свойство
  item.rooms =  item['@доп.соглашения'] &&  item['@доп.соглашения'].length
    ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения']
    : item['@помещения'] || [];
  item['архив'] = item.hasOwnProperty('архив') ? item['архив'] : vm.IsArchiveContract(item);
  if (item['архив']) vm.archLen += 1;
  const test = (vm.filters['архивные договоры'] ? item['архив'] : !item['архив'])
    && (vm.filters['физ лица'] === undefined  || ((item['$контрагент']['реквизиты'] || {})['физ. лицо'] || false) === vm.filters['физ лица'])
    && (vm.filters['арендодатель'] ? item['проект/id'] == vm.filters['арендодатель'].id : true)
    && (vm.filters['продление'] === undefined  || !!item['продление срока'] === vm.filters['продление'])
    && (vm.filters['арендаторы'] ? (item['$контрагент'].title + ' ' + item['номер']).toLowerCase().indexOf(vm.filters['арендаторы'].toLowerCase()) >= 0  : true)
    && ( (item['@помещения'] && item['@помещения'][0] && vm.filters['объект'] && vm.filters['объект'].id ) ?  item['@помещения'][0].$объект.id == vm.filters['объект'].id : true)
    && (
      (!vm.filters['завершение в этом месяце'] && !vm.filters['завершение в след месяце'])
     || (!!vm.filters['завершение в этом месяце'] && vm.ДоговорЗавершенВМесяце(item))
     || (!!vm.filters['завершение в след месяце'] && vm.ДоговорЗавершенВМесяце(item, dateFns.addMonths(new Date(), 1)))
    )
    ;
  //~ console.log("filteredData", test);
  return test;
},

IsArchiveContract(item){
  return !dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(item['дата расторжения'] || (item['продление срока'] ? '2100-01-01' : item['дата2'])));
},

ДоговорЗавершенВМесяце(item, month){
  return (!item['продление срока'] || !!item['дата расторжения']) && dateFns.isSameMonth(month || new Date(), new Date(item['дата расторжения'] || item['дата2']));
},

FilterData(){
  var vm = this;
  //~ if (!vm.filters['арендаторы'].length) return vm.data;
  vm.archLen = 0;
  //~ vm.filteredData.length = 0;
   //~ vm.filteredData.splice(0);
  vm.filteredData =  vm.data.filter(vm._FilterData);
    vm.filters.timeout = undefined;
   // : vm.data;
  
  //~ vm.AllChbsChange(true);
  return vm;
},

ОчиститьФильтр(name){
  var vm = this;
  vm.filters[name] = '';
  vm.FilterData();
},

СброситьВсеФильтры(){
    //~ vm.filters['архивные договоры'] = !!d['архив'];
    //~ vm.filters['физ лица'] = undefined;
    //~ Object.keys(vm._cleanFilters).map((key)=>{ vm.$set(vm.filters, key, vm._cleanFilters[key]); console.log("Прокрути к договору", key, vm.filters[key]); } );
    this.filters = {...this._cleanFilters};
    this.keys['арендодатель'] = Math.random();
    this.keys['объект'] = Math.random();
  
},

SelectObjectFilter(data){
  //~ console.log("SelectObjectFilter", data);
  this.filters['объект'] = data;/// ? data.$item : {};
  this.FilterData();
  this.AllChbsChange(!!data);
},

ResizeObserver(){
  let vm = this;
  vm.resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      vm.elWidth = entry.target.clientWidth;
    }
  });
  vm.resizeObserver.observe(vm.$el);
},

LabelFLClick(){/// третье состояние радио физ лица
  let val = this.filters['физ лица'];
  if (this.filters['физ лица'] !== undefined) setTimeout(()=>{
    if (val !== this.filters['физ лица']) return;
    this.filters['физ лица'] = undefined; 
    this.ChbChange('физ лица');
  });
  //~ console.log("LClick", this.filters);
},

LabelProlongClick(){/// третье состояние радио продление
  let val = this.filters['продление'];
  if (this.filters['продление'] !== undefined) setTimeout(()=>{
    if (val !== this.filters['продление']) return;
    this.filters['продление'] = undefined;
    this.ChbChange('продление');
  });
  //~ console.log("LClick", this.filters);
},

ModalComplete(){
  let vm = this;
  //~ console.log("ModalComplete");
  if (vm.iframeFile) return $http.get(appRoutes.urlFor('удалить временный файл',  vm.iframeFile.file))
    .then(function(resp){
      if (resp.data.error) console.log("Ошибка удаления временного файла:", esp.data.error);
      vm.iframeFile=undefined;
    }, function(){
      console.log("Ошибка удаления временного файла");
    });
},

//~ FindItem(id){
  //~ return this.checkedItems.find((item)=>item ? item.id == id : false);
//~ },
Xor(a,b){
  return (a || b) && !(a && b);
},

}; ///конец methods

const computed = {
//~ IsChbs(){
  //~ console.log("IsChbs");
  //~ return this.data.some((item)=>{ return !!item['крыжик']; });
//~ },
//~ FilteredDataLen(){
  //~ return this.filteredData.length;
//~ },

/*FilteredData(){//// !!!!!!!!!! не катит, после обновления через форму нет реакции!!!!!!!!! никак ваще
  this.archLen = 0;
  console.log("FilteredData");
  return this.data.filter(this._FilterData);
},*/
  
EditItemStyle(){
  if (this.elWidth < 1200) return {"width":'110%', "left":'-5%',};
  return {"width":'90%', "left":'5%',};
},

  
  /* computed */};

const  data = function(){
  //~ console.log("on data item", this.item);
  let vm = this;
  vm.data = [];
  vm.appRoutes = appRoutes;
  vm._cleanFilters = {"арендодатель": undefined, "арендаторы": '', "объект": undefined, "архивные договоры": false, "физ лица": undefined/*радио 3 состояния*/, "продление": undefined /*радио 3 состояния*/, "завершение в этом месяце":false, "завершение в след месяце":false,};
  
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    //~ "data": [],
    //~ "$договоры":{},/// хэш договоров по id
    "filteredData":[],
    "newContract": undefined,
    "selectedContract": undefined,
    "checkedItems":[],
    //~ "editItems":[],
    "allChbs": false, /// крыжик выбора всех договоров
    "payMonth":  new Date().toISOString().replace(/T.+/, ''),
    "nextMonth": dateFns.format(dateFns.addMonths(new Date(), 1/*один мес*/), 'DD MMMM YYYY', {locale: dateFns.locale_ru}).replace(/\d+\s*(.+?).{1}\s*(\d+)$/, (m, m1, m2)=>`${m1}е ${m2}`),
    "payMonth2": undefined,
    "payNums": true, ///крыжик счета с номерами
    "payPDF": true,///крыжик 
    "radioAccAct": 'счет',/// или акт
    "radioNalBezNal": 'безнал',/// или вместе нал и безнал
    "filters": {...vm._cleanFilters},
    //~ "rentObjects":[],
    "archLen":0, /// кол-во архивных договоров
    "clipBoard": undefined,
    "projectData":undefined,///арендодатели для компонетов
    "keys":{'payMonth2':Math.random(), "объект":Math.random(), "арендодатель":Math.random(), },
    "httpProcess": undefined,
    "elWidth": undefined,/// будет при resizeObserver
     "iframeFile": undefined,/// 
    "dataEmail": undefined, /// модальная таблица рассылки на почту
    "formEmail":{},/// рассылка этого сообщения
    };
  //);
};///конец data

const mounted = function(){
  //~ console.log('mounted', this);
  var vm = this;
  var $el = $(vm.$el);
  vm.Ready().then(function(){
    setTimeout(function(){
      $('.modal', $el).modal( );// Callback for Modal close} {"complete": vm.ModalComplete}
      vm.InitDatePicker($('.datepicker.pay-month', $el));
      vm.ResizeObserver();
    });
    
  });
};

const beforeDestroy = function(){
  this.resizeObserver.unobserve(this.$el);
  //~ console.log("beforeDestroy");
};

let template = parcelRequire('js/c/аренда/договоры-таблица.vue.html');

var $Компонент = {
  props,
  data,
  //~ mixins:[$UploaderViewIframeMixins],
  methods,
  computed,
  //~ "created"() {  },
  mounted,
  beforeDestroy,
  components:{},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components['v-rent-contract-form'] =  new $КомпонентАрендаДоговорФорма();
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  $Компонент.components['v-view-file-iframe'] = new $КомпонентПросмотрФайла();
  $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-test'] = new Vue(тест);

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());