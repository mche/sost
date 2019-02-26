(function () {'use strict';
/*
  обработка номенклатуры заявок ТМЦ и запросов на резерв остатков
  к модулю списка заявок ТМЦ
*/
var moduleName = "ТМЦ/заявки/номенклатура и резерв остатка";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', /*'DateBetween',*/ 'Номенклатура', 'TreeItem', 'ТМЦ текущие остатки', 'Объекты']);

var Component = function  ($scope, /*$rootScope,*/ $timeout, $http, $element, $q, appRoutes, Util, $Номенклатура, $ТМЦТекущиеОстатки, $Объекты) {
  var $c = this;
  var $s = $scope;
  $s.isNaN = isNaN;
  $s.parseFloat = parseFloat;
  $s.Util = Util;
  
  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    
    //~ var async = [];
    
    $Объекты["все объекты без доступа"]().then(function(resp){ $c.$Объекты = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});});
    
    $c['номенклатура']=[];/// для tree-item
     
    $Номенклатура.Load(0).then(function(data){
      Array.prototype.push.apply($c['номенклатура'], data);
      $c.$Номенклатура = $Номенклатура.$Data();
    });//$http.get(appRoutes.url_for('номенклатура/список', 0));
    
    $c['Остатки'] = [];
    $ТМЦТекущиеОстатки.Load($c.param).then(function(resp){
      Array.prototype.push.apply($c['Остатки'], resp.data);
      $c.$Остатки = $ТМЦТекущиеОстатки.$DataByNomenId($c.param['объект'].id);
      //~ console.log('$Остатки', $c.$Остатки );
    });
    
    //~ $q.all(async).then(function(){
      $c.ready = true;
    
      if ($c.ask['номенклатура/id']) $timeout(function(){
        $c.OnSelectNomen($c.ask['$номенклатура'], {"тмц/заявка": $c.ask});
      });
      
      $('.modal', $($element[0])).modal({
        //~ endingTop: '5%',
        //~ ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          //~ $c.modal_trigger = trigger;
        //~ },
      });
      
    //~ })
    
  };

                    var FilterNotNull = function(id){ return !!id; };
  $c.ValidNomen = function(ask){///вроде не исп
    var nomen = ask['$номенклатура'];
    var nomenOldLevels = (nomen.selectedItem && nomen.selectedItem.id && ((nomen.selectedItem.parents_id && nomen.selectedItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    var nomenNewLevels = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    return nomenOldLevels &&  (nomenOldLevels+nomenNewLevels) > 4;/// 4 уровня
  };
  
  ///фильтровать позиции остаков по родителю номенклатуры
  var FilterOstParentNomen = function(nid){
    var data = this;
    return data.id == nid || $c.$Номенклатура[nid].parents_id.some(function(pid){ return pid == data.id; });
  };
  /// дополнить объект в позицию остатков
  //~ var MapOstObject = function(o){
    //~ if (!o.$объект) o.$объект = $c.$Объекты[o['объект/id']];
  //~ };
  /// создать строку текущих остатков
  //~ var FilterOstExists = function(o){ return !!o['остаток']; };
  var MapOstRow = function(nid){
    var ret = {};
    ret['$номенклатура'] = $c.$Номенклатура[nid];
    ret['@остатки'] = $c.$Остатки[nid];///.filter(FilterOstExists);
    //~ ret['@остатки'].map(MapOstObject);///развернуть объект
    return ret;
  };
  /// показать тек остатки по родительской номенклатуре
  $c.OnSelectNomen = function(nom, param){/// остатки для обработки снабжения
    
    var z = param['тмц/заявка'];
     //~ console.log("OnSelectNomen", z['номенклатура/id'], z['$номенклатура'].id, nom.id);
    var zNid = z['номенклатура/id'];
    if (z['@тмц/резервы остатков'] && z['@тмц/резервы остатков'].length) return; ///уже запрошено
    //~ var old_z_nom = z['$номенклатура'].id;
    if (nom.id && !(nom.newItems && nom.newItems[0] && nom.newItems[0].title) ) {
      z['номенклатура/id'] = nom.id;
      //~ z['$номенклатура']['сохранить'] = false;
      z['@текущие остатки'] = Object.keys($c.$Остатки).filter(FilterOstParentNomen, nom).map(MapOstRow);
      //~
      //~ if (!z['$номенклатура'].id || z['$номенклатура'].id != nom.id) 
      if (!zNid || zNid != nom.id) $c.SaveNomen({"тмц/заявка/id":z.id, "номенклатура/id":nom.id,});
      return;
    }
    $c.SaveNomen({"тмц/заявка/id":z.id, "номенклатура/id":null,});///удалить связь
    z['номенклатура/id'] = undefined;
    //~ if (nom.newItems && nom.newItems[0] && nom.newItems[0].title) z['$номенклатура']['сохранить'] = true;
    z['@текущие остатки'] = undefined;
  };
  
  $c.OrderByCurrentOstNomen = function(row){///  строка  из @текущие остатки
    return row['$номенклатура'].parents_title.join(' ')+row['$номенклатура'].title;
  };
  
  $c.ClickOstNomen = function(row, ask){///строки остатков на номенклатуре
    ask['$номенклатура'] = undefined;
    ask['@текущие остатки'] = undefined;
    $timeout(function(){
      ask['$номенклатура'] = {"id": row['$номенклатура'].id,"selectedItem":{id: row['$номенклатура'].id}};
      /*if( row['$номенклатура'].id != ask['номенклатура/id'] )*/ $c.OnSelectNomen(ask['$номенклатура'], {"тмц/заявка": ask});
    });
    
  };
  
  $c.MapObject = function(oid){
    return $c.$Объекты[oid];
  };
  
  ///отменить запрос
  $c.ClickRemoveOst = function(row, ask){
    //~ console.log("ClickRemoveOst", row);
    $('#modal-confirm-remove').modal('open');
    $c.removeOstRow = undefined;
    $timeout(function(){ $c.removeOstRow = row; });
  };
  
  $c.ClickOstObject = function(ost, ask, row){///ost - остаток на объекте, row (не обяз)- строка остатков всех объектов
    //~ console.log("остаток на объекте", ost, "строка остатков всех объектов", row, "заявка", ask);
    if (!ost) ost = $c.removeOstRow;///это конфирм удаления
    ost['тмц/заявка/id'] = ask.id;
    ost['тмц/заявка/количество']=ask['количество'];///>ost['остаток'] 
    $http.post(appRoutes.url_for('тмц/снаб/запрос резерва остатка'), ost)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'left red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp');
        if (resp.data.success) {
          if (row) {
            Materialize.toast("Запрос остатка сохранен", 3000, 'left green-text text-darken-3 green lighten-3 fw500 border  animated zoomInUp');
            ask['количество/докупить'] = 0;///пока запрос отключить крыжик закупа
          }
          else {
            Materialize.toast("Запрос остатка удален", 3000, 'left green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp');
            ask['количество/докупить'] = undefined; ///включить крыжик закупа
          }
          //~ console.log("тмц/снаб/запрос резерва остатков", resp.data.success);
          
          var nomen = ask['$номенклатура'];
          ask['$номенклатура'] = undefined;
          ask['@текущие остатки'] = undefined;
          $timeout(function(){
            ask['@тмц/резервы остатков'] = resp.data.success['@тмц/резервы остатков'];
            if (row) ask['номенклатура'] = row['$номенклатура'].parents_title.slice().pushSelf(row['$номенклатура'].title);
            //~ ask['$номенклатура'] = row ? {"id": row['$номенклатура'].id,"selectedItem":{id: row['$номенклатура'].id}} : nomen;///;
            
          });
          //~ $c.ClickOstNomen(row, ask);
        }
      });
  };
  
  $c.SaveNomen = function(data){
    return $http.post(appRoutes.url_for('тмц/снаб/сохранить номенклатуру заявки'), data)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'left red-text text-darken-3 red lighten-3 fw500 border  animated zoomInUp');
        if (resp.data.success) {
          Materialize.toast("Сохранена номенклатура заявки", 3000, 'left green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp');
          console.log("Сохранилась номенклатура заявки", resp.data.success);
          
        }
      });
    
  };
  
  $c.ClassOstBtn = function(row){
    if (isNaN(parseFloat(row['количество/резерв']))) return 'grey-text';
    if (parseFloat(row['количество/резерв']) === 0) return 'red-text';
    return 'green-text';
    //~ {: , 'red': , 'green': !!row['количество/резерв']}
  };

};

  
/*=============================================================*/

module

.component('tmcAskNomenOst', {
  controllerAs: '$c',
  templateUrl: "tmc/ask/nomen-ost",
  //~ scope: {},
  bindings: {
    param: '<',
    ask: '<',///вся заявка

  },
  controller: Component
})

;

}());