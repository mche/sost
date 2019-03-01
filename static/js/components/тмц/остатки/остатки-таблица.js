(function () {'use strict';
/*
*/

var moduleName = "ТМЦ текущие остатки";
try {angular.module(moduleName); return;} catch(e) { }
//~ try {angular.module('Контрагенты');} catch(e) {  console.log('Заглушка на "Контрагенты" ', angular.module('Контрагенты', []).factory("$Контрагенты", function(){})); }
try {angular.module('ТМЦ форма списания');} catch(e) {  angular.injector(['Console']).get('$Console').log('Заглушка на "ТМЦ форма списания" ', angular.module('ТМЦ форма списания', [])); }
try {angular.module('ТМЦ форма перемещения');} catch(e) {  angular.injector(['Console']).get('$Console').log('Заглушка на "ТМЦ форма перемещения" ', angular.module('ТМЦ форма перемещения', [])); }

var module = angular.module(moduleName, ['Util', 'appRoutes', 'Объекты', 'Номенклатура', 'Контрагенты', 'ТМЦ форма списания', 'ТМЦ форма перемещения',]);//'ngSanitize',, 'dndLists'

const Component = function  ($scope, $rootScope, $q, $http, $timeout, $element, Util, appRoutes, $ТМЦТекущиеОстатки, $Объекты, $Номенклатура, $Контрагенты) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $c.re = {'приход': new RegExp('приход'), 'расход': new RegExp('расход'), 'списание': new RegExp('списание'), 'инвентаризация': new RegExp('инвентаризация')};
  //~ $scope.Util = Util;
  $c['крыжики номенклатуры'] = {};///по ИД
  
  
  $c.$onInit = function(){
    if(!$c.param) $c.param={};
    if(!$c.data) $c.data=[];
    var async = [];
    async.push($Объекты["все объекты без доступа"]().then(function(resp){ $c.$объекты = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});}));
    async.push($Номенклатура.Load().then(function(data){
      $c.$номенклатура = /*data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {})*/ $Номенклатура.$Data();
      $c['номенклатура'] = $Номенклатура.Data();
    }));
    

    
    if (Object.prototype.toString.call($c.data) == "[object Array]" && $c.data.length === 0) async.push($ТМЦТекущиеОстатки.Load($c.param).then(function(resp){
    //~ if ($c.data.then || Object.prototype.toString.call($c.data) == "[object Array]") $c.data.then(function(resp){
      if (resp.data.error) return;
      Array.prototype.push.apply($c.data, resp.data);//.map(function(row){ $c.InitRow(row); return row; }));//
    }));
    else if ($c.data.then) async.push($c.data.then(function(resp){
      if (resp.data.error) return;
      Array.prototype.push.apply($c.data, resp.data);
    }));
    $q.all(async).then(function(){
      
      $c.LoadPlus();
      
      //~ $c['@номенклатура/id'] = [];
      $c['@объекты/id'] = [];
      $c.$data = $c.data.reduce(function(result, row, index, array) {
        if (!result[row['объект/id']]) result[row['объект/id']]={};
        result[row['объект/id']][row['номенклатура/id']] = row;
        //~ if (!$c['@номенклатура/id'].some(function(id){ return row['номенклатура/id'] == id; })) $c['@номенклатура/id'].push(row['номенклатура/id']);
        if (!$c['@объекты/id'].some(function(id){ return row['объект/id'] == id; })) $c['@объекты/id'].push(row['объект/id']);
        return result;
        
      }, {});
      
      $c.nomenTreeItem = {id:154997};
      $c['фильтр номенклатуры по ИД'] = 154997;///инструмент
      $c['крыжик текущие приходы']  = !0;
      
      $c.ready = !0;
      
      $timeout(function(){
        $('.modal', $($element[0])).modal({
          //~ endingTop: '0%',
          //~ ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            //~ $c.modal_trigger = trigger;
        });
      });
      
    });

  };
  
  /*** приходы */
  $c.LoadPlus = function(){
    //~ if (!$c.$приходы) $c.$приходы = {};
    var oid = $c.param['объект'].id;
    $ТМЦТекущиеОстатки.PlusLoad(0).then(function(){
      $c.$приходы = $ТМЦТекущиеОстатки.PlusData(0);
    });

    //~ return $http.post(appRoutes.url_for('тмц/движение/приходы'), {'объект': {id: $c.param['объект'].id}}).then(function(resp){
      //~ if (resp.data.error) return;
      //~ $c.$приходы = resp.data;
    //~ });
    
  };

  $c.ChangeNomenFilter = function(event, val){
    if (val !== undefined) $c['фильтр наименования'] = val;
    if ($c._ChangeNomenFilter) $timeout.cancel($c._ChangeNomenFilter);
    $c._ChangeNomenFilter = $timeout(function(){
      delete $c._ChangeNomenFilter;
      $c.RefreshTable();///.then(function(){ if (event) $timeout(function(){$(event.target).focus();}); });
      
    }, val === undefined ? 600 : 0);
    
  };
  
  $c.RefreshTable = function(){
    $c._refreshTable = true;
    return $timeout(function(){
      delete $c._refreshTable;
    });
    
  };
  
  $c.InitTable = function(){///фильтрация строк
    if (!$c['@номенклатура/id']) $c['@номенклатура/id'] = [];
    $c['@номенклатура/id'].splice(0, $c['@номенклатура/id'].length);
    var uniq = {};
    var uniqAll = {};
    $c.data.map(function(row){
      if ( $c.FilterByNomen(row['номенклатура/id']) && $c.FilterByNomenTree(row) && $c.FilterByChbKol(row) && $c.FilterByPlus(row['номенклатура/id']) && $c.FilterByObject(row['объект/id']) )  uniq[row['номенклатура/id']] = 1;
      uniqAll[row['номенклатура/id']] = 1;
    });
    
    $c['@номенклатура/id']  = Object.keys(uniq);///.filter($c.FilterByPlus);///фильтровать по приходам тут
    $c['@номенклатура без фильтрации/id']  = Object.keys(uniqAll);
    
    $c['@объекты/id/фильтр'] = $c['@объекты/id'].filter($c.FilterByObject);
  };

$c.FilterByPlus  = function(nid){///фильтр по наличию приходов + доп крыжики
  //~ if (!$c['крыжик только приходы']) return true;
  if (!$c['$приходы']) return !$c['крыжик только приходы'] || false;
  if (!$c['$приходы'][nid]) {
    $c['$приходы'][nid] = {'@_приходы': []};
    return !$c['крыжик только приходы'] || false;
  }
  if($c['$приходы'] && $c['$приходы'][nid] && $c['$приходы'][nid]['@приходы'])
    $c['$приходы'][nid]['@_приходы'] = $c.FilterDatePlus($c['$приходы'][nid]['@приходы']).filter(function(p){ return $c.FilterByObject(p['объект/id']); });
  return !$c['крыжик только приходы'] || $c['$приходы'][nid] && $c['$приходы'][nid]['@_приходы'] && $c['$приходы'][nid]['@_приходы'].length;
  
};
  
$c.FilterByChbKol = function(row){
  return $c['крыжик все остатки'] || parseFloat(row['остаток']) != 0;
  
}

$c.FilterByNomen = function(nid){
  var nomen = $c.$номенклатура[nid];
  if (!$c['фильтр наименования']) return true;
  var title = nomen.parents_title.join('')+nomen.title;
  var re = new RegExp($c['фильтр наименования']);
  return re.test(title);
};

$c.SetFilterObject = function(o){
  if ($c.param['объект'] && $c.param['объект'].id && $c.param['объект'].id == o.id) return;
  if ($c['крыжик только объект']) $c['крыжик только объект'] = undefined;
  else $c['крыжик только объект'] = o.id;
  $c.RefreshTable();
};
$c.FilterByObject = function(oid){
  return !$c['крыжик только объект'] || $c['крыжик только объект'] == oid;
  
};

$c.FilterPlus = function(p){///фильтровать приходы?
  //~ var oid = this;
  return !$c.param['объект'] || !$c.param['объект'].id || ($c.param['объект'].id == p['объект/id']);///
};

$c.OnSelectNomenTreeItem = function(item){
  //~ console.log('OnSelectNomenTreeItem', item);
  //~ if (item.id)  
  $c['фильтр номенклатуры по ИД'] = item.id;
  $c.RefreshTable();
};

var FilterByNomenTree = function(id){ return $c['фильтр номенклатуры по ИД'] == id; };
$c.FilterByNomenTree = function(row){
  if (!$c['фильтр номенклатуры по ИД']) return true;
  var nomen = $c.$номенклатура[row['номенклатура/id']];
  return nomen.parents_id.some(FilterByNomenTree) || FilterByNomenTree(nomen.id);
  
};

/***фильтровать текущий период */
var FilterDatePlus = function(row){ return ($c['крыжик текущие приходы'] && row['текущий период']) || ($c['крыжик предыдущие приходы'] && !row['текущий период']);  };
$c.FilterDatePlus = function(data){///$c['$приходы'][nid]['@приходы']
  return data.filter(FilterDatePlus);
};

$c.ChangeChbPlus = function(){
  if (!($c['крыжик текущие приходы'] || $c['крыжик предыдущие приходы'])) $c['крыжик только приходы'] = !1;
  $c.RefreshTable();
  
  
};

$c.OrderByNomen = function(nid) {///id номенклатуры
  //~ return row['номенклатура'] && row['объект'] && row['номенклатура'].parents_title.join('').toLowerCase()+row['номенклатура'].title.toLowerCase()+row['объект'].name.toLowerCase();
  var n = $c.$номенклатура[nid];
  //~ console.log('OrderByNomen', n);
  return n && n.parents_title.join('').toLowerCase()+n.title.toLowerCase();
};

$c.OrderByObject = function(oid){
  var o = $c.$объекты[oid];
  return o.name.toLowerCase()+o['$проект'].name.toLowerCase();
  
};

$c.FormatDate = function(date){
  return dateFns.format(new Date(date), 'ytt dd, D MMMM YYYY', {locale: dateFns.locale_ru});
};
$c.FormatDate2 = function(date){
  return dateFns.format(new Date(date), 'D MMM', {locale: dateFns.locale_ru});
};

$c.TitlePlus = function(p, row){///для прихода
  var from = p['объект2/id'] ? $c.$объекты[p['объект2/id']] : p["@грузоотправители"][0];
  return $c.FormatDate(p['дата']) + (p['объект2/id'] ? ' перемещено из ' : ' закупка ') + ' ['+(from.name || from.title)+'] ➔ ['+ row['объект'].name +']' + ' ' + p['профиль/names'].join(' ');
  
};

$c.TitleDates = function(){
  var d = dateFns.addDays(dateFns.startOfMonth(new Date()), 19);
  if (dateFns.isFuture(d)) return [$c.FormatDate(dateFns.addMonths(d, -2)), $c.FormatDate(dateFns.addMonths(d, -1)), $c.FormatDate(d)]
  else return [$c.FormatDate(dateFns.addMonths(d, -1)), $c.FormatDate(d), $c.FormatDate(dateFns.addMonths(d, 1))];
};

$c.InitRow = function(row) {///детально движение
  //~ if(row._init) return;
  if (!row) return;
  row['объект'] = /*$c.$объекты &&*/ $c.$объекты[row['объект/id']];
  row['номенклатура'] = /*$c.$номенклатура &&*/ $c.$номенклатура[row['номенклатура/id']];
  if (row['объект2/id']) row['$объект2'] = $c.$объекты[row['объект2/id']];
  if (row['с объекта/id']) row['$с объекта'] = $c.$объекты[row['с объекта/id']];
  if (row['движение']) {
    row['приход'] = $c.re['приход'].test(row['движение']);
    row['расход'] = $c.re['расход'].test(row['движение']);
    row['списание'] = $c.re['списание'].test(row['движение']);
    row['инвентаризация'] = $c.re['инвентаризация'].test(row['движение']);
  }
  //~ row._init = !0;
  return row;
};

$c.ShowMoveTMC = function(row){
  if(!row) return;///нет движения
  $c.moveDetailTMC = row;
  $('#move-detail').modal('open');
  row['движение'] = undefined;
  //~ row['объект параметр/id'] = $c.param['объект'].id;
  $http.post(appRoutes.url_for('тмц/движение'), row).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
    var ka = $Контрагенты.$Data();
    row['движение'] = resp.data.map(function(r){
      //~ r['объект'] = $c.$объекты[r['объект/id']];
      //~ r['номенклатура'] = $c.$номенклатура[r['номенклатура/id']];
      if (!r['@грузоотправители'] && r['@грузоотправители/id']) r['@грузоотправители'] = r['@грузоотправители/id'].map(function(kid){ return kid ? ka[kid] : {}; });
      return r;
    });
    
  });
  
};

const IsCheckedNomen = function(nid){ return !!$c['крыжики номенклатуры'][nid] /*&& (!this || nid == this)*/ ; };
$c.ShowMoveBtn = function(oid){
  return Object.keys($c['крыжики номенклатуры']).some(IsCheckedNomen);
  
};

  $c.NewMove = function(oid){///позиции остатков в перемещение
    $c['перемещение'] = {'$с объекта': $c.$объекты[oid], 'перемещение': !0,};
    
    $c['перемещение']['@позиции тмц'] = $c.CheckedPos(oid);
    //~ console.log("NewMove", $c['перемещение']);
    if ($c['перемещение']['@позиции тмц'].length) $timeout(function(){ $scope.paramMove = {'перемещение': !0, 'объект': $c.$объекты[oid]}; });
    ///$rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', data, {'перемещение': !0});
    //~ data['статус'] = undefined;
    
  };
  $c.CloseFormMove = function(data){
    $scope.paramMove = undefined;
    
  };
  
  const FilterCheckedPos = function(row){
    //~ 
    ///!(uniq[row['объект/id']+':'+row['номенклатура/id']]++) &&
    var t = row['объект/id'] == this.oid
      && IsCheckedNomen(row['номенклатура/id']);
    //~ console.log("FilterCheckedPos", t);
    return t;
      ///Object.keys($c['крыжики номенклатуры']).some(IsCheckedNomen, row['номенклатура/id']) /*&& parseFloat(row['остаток']) > 0*/;
  };
  const SortCheckedPos = function(a, b){
    var an = $c.OrderByNomen(a['номенклатура/id']);
    var bn = $c.OrderByNomen(b['номенклатура/id']);
    if (an > bn) return 1;
    if (an < bn) return -1;
    return 0;
  };
  const MapCheckedPos = function(row){
      var n = row['номенклатура'].parents_title.slice();
      n.push(row['номенклатура'].title);
      return {'номенклатура/id': row['номенклатура/id'], 'номенклатура': n, 'номенклатура/не изменять': !0, 'количество': row['остаток'], 'остаток': row['остаток'], /*'количество/принято': row['остаток'],*/ '$тмц/заявка':{},};
  };
  
  $c.CheckedPos = function(oid){
    return $c.data.filter(FilterCheckedPos, {"oid": oid}).sort(SortCheckedPos).map(MapCheckedPos);///{nomen:  {'selectedItem': {'id': row['номенклатура/id']}}}
    
  };
  
  $c.NewSpis = function(oid){/// открыть крыжики в форме списания
    
    $c['списание'] = {'$объект': {id: oid}};
    $c['списание']['@позиции тмц'] = $c.CheckedPos(oid);
    if ($c['списание']['@позиции тмц'].length) $timeout(function(){ $scope.paramSpis = {'объект': {id: oid}}; });
    
  };
  $c.CloseFormSpis = function(data){
    $scope.paramSpis = undefined;
    
  };
  
  $c.Print = function(){
    var param = {
      'объект/id': $c['крыжик только объект'] || $c.param['объект'].id,
      'номенклатура/id': $c['фильтр номенклатуры по ИД'],
      'дата': $c['дата остатков'] || Util.DateISO(),
    };
    $c.printing = !0;
    /// вернет урл для скачивания
    $http.post(appRoutes.url_for('тмц/остатки на дату.docx'), param).then(function(resp){
      $c.printing = undefined;
      //~ console.log('Print', param, resp.data);
      if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border');
      if (resp.data.url) window.location.href = resp.data.url;///appRoutes.url_for('тмц/накладная.docx', $c.data.id);
    }, function(resp){
      $c.printing = undefined;
      //~ console.log('Ошибка печати или нет доступа', arguments);
      Materialize.toast("Ошибка печати или нет доступа: код "+resp.status, 5000, 'red-text text-darken-3 red lighten-3 border');
    });
  };
  
  ///календарь даты печати остатков
  $c.PickerDate = function(elem){ 
    if ($(elem).data('pickadate')) return;
    $(elem).data('value', Util.DateISO());
    
    $timeout(function(){
      $(elem).pickadate({ onSet: $c.SetDate });
      
    });
  };
  
  $c.DateFormat = function(date){
    return dateFns.format(date ? new Date(date) : new Date(), 'ytt dd, D MMMM YYYY', {locale: dateFns.locale_ru});
  };
  
  $c.SetDate = function(context){
    var s = this.component.item.select;
    if (!s) return;
    var set = [s.year, s.month+1, s.date].join('-');
    $c['дата остатков'] = set;
    //~ console.log('SetDate', set);
  };
};

/******************************************************/
var Data  = function($http, appRoutes, Util){
  var then = {}, Data = {}, DataByNomenId = {},
    Plus = {}, thenPlus = {} ///приходы
  ;
  var $this = {
    //~ Objects: function() {return objects;},
    "Load": function(param){
      var oid = (param['объект'] && param['объект'].id) || 0;
      if (!Data[oid]) Data[oid] = [];
      if (!then[oid]) then[oid] = $http.post(appRoutes.url_for('тмц/текущие остатки'), param).then(function(resp){
        Array.prototype.push.apply(Data[oid], resp.data);
        //~ console.log('ostat', angular.copy(param), param);
        return resp;
      });
      return then[oid]; /*return $this;*/
    },
    "Data": function(oid){
      if (Util.IsType(oid, 'object')) oid = (oid['объект'] && oid['объект'].id) || 0;
      return Data[oid];
    },
    "$DataByNomenId": function(oid){
      if (Util.IsType(oid, 'object')) oid = (oid['объект'] && oid['объект'].id) || 0;
      if (!DataByNomenId[oid]) DataByNomenId[oid] = Data[oid].reduce(function(result, item, index, array) {
        if (!result[item['номенклатура/id']]) result[item['номенклатура/id']] = [];
        result[item['номенклатура/id']].push(item);
        return result;
      }, {});
      return DataByNomenId[oid];
    },
    "Clear": function(param){
      var oid = (param['объект'] && param['объект'].id) || 0;
      if (Data[oid])  Data[oid].splice(0, Data[oid].length);
      if (then[oid]) delete then[oid];
      if (DataByNomenId[oid]) delete DataByNomenId[oid];
      if (Plus[oid]) delete Plus[oid];/// не массив Plus[oid].splice(0, Plus[oid].length);;
      if (thenPlus[oid]) delete thenPlus[oid];
    },
    "PlusLoad": function(oid){
      //~ if (!Plus[oid]) Plus[oid] = [];
      if (!thenPlus[oid]) thenPlus[oid] = $http.post(appRoutes.url_for('тмц/движение/приходы'), {'объект': {id: oid}}).then(function(resp){
        if (resp.data.error) return;
        //~ Array.prototype.push.apply(Plus[oid], resp.data);
        Plus[oid] = resp.data;///не массив
        return resp;
      });
      return thenPlus[oid]; /*return $this;*/
    },
    "PlusData": function(oid){
      //~ if (Util.IsType(oid, 'object')) oid = (oid['объект'] && oid['объект'].id) || 0;
      return Plus[oid];
    },
  };
  return $this;//.RefreshObjects();
  
};

/*=============================================================*/

module

.factory('$ТМЦТекущиеОстатки', Data)

.component('tmcOstatTable', {
  controllerAs: '$c',
  templateUrl: "tmc/ostat/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data:'<',

  },
  controller: Component
})

;

}());