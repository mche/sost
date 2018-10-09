(function () {'use strict';
/*
  доп обработка номенклатуры заявок ТМЦ и запросов на резерв остатков
  к модулю списка заявок ТМЦ
*/
var moduleName = "TmcAskTableNomenOstLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

var Lib = function($timeout, /*$http, $compile, appRoutes, Util*/ ) {// factory
  
return function /*конструктор*/($ctrl, $scope, $element){

                    var FilterNotNull = function(id){ return !!id; };
  $ctrl.ValidNomen = function(ask){///вроде не исп
    var nomen = ask['$номенклатура'];
    var nomenOldLevels = (nomen.selectedItem && nomen.selectedItem.id && ((nomen.selectedItem.parents_id && nomen.selectedItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    var nomenNewLevels = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    return nomenOldLevels &&  (nomenOldLevels+nomenNewLevels) > 4;/// 4 уровня
  };
  
  ///фильтровать позиции остаков по родителю номенклатуры
  var FilterOstParentNomen = function(nid){
    var data = this;
    return data.id == nid || $ctrl.$Номенклатура[nid].parents_id.some(function(pid){ return pid == data.id });
  };
  /// дополнить объект в позицию остатков
  //~ var MapOstObject = function(o){
    //~ if (!o.$объект) o.$объект = $ctrl.$Объекты[o['объект/id']];
  //~ };
  /// создать строку текущих остатков
  //~ var FilterOstExists = function(o){ return !!o['остаток']; };
  var MapOstRow = function(nid){
    var ret = {};
    ret['$номенклатура'] = $ctrl.$Номенклатура[nid];
    ret['@остатки'] = $ctrl.$Остатки[nid];///.filter(FilterOstExists);
    //~ ret['@остатки'].map(MapOstObject);///развернуть объект
    return ret;
  };
  /// показать тек остатки по родительской номенклатуре
  $ctrl.OnSelectNomen = function(nom, param){/// остатки для обработки снабжения
    var z = param['тмц/заявка'];
    if (z['@тмц/резервы остатков'] && z['@тмц/резервы остатков'].length) return; ///уже запрошено
    //~ var old_z_nom = z['$номенклатура'].id;
    if (nom.id && !(nom.newItems && nom.newItems[0] && nom.newItems[0].title) ) {
      z['номенклатура/id'] = nom.id;
      //~ z['$номенклатура']['сохранить'] = false;
      z['@текущие остатки'] = Object.keys($ctrl.$Остатки).filter(FilterOstParentNomen, nom).map(MapOstRow);
      //~ console.log("OnSelectNomen", ost);
      if (z['$номенклатура'].id != nom.id) $ctrl.SaveNomen({"тмц/заявка/id":z.id, "номенклатура/id":nom.id,});
      return;
    }
    $ctrl.SaveNomen({"тмц/заявка/id":z.id, "номенклатура/id":null,});///удалить связь
    z['номенклатура/id'] = undefined;
    //~ if (nom.newItems && nom.newItems[0] && nom.newItems[0].title) z['$номенклатура']['сохранить'] = true;
    z['@текущие остатки'] = undefined;
  };
  
  $ctrl.OrderByCurrentOstNomen = function(row){///  строка  из @текущие остатки
    return row['$номенклатура'].parents_title.join(' ')+row['$номенклатура'].title;
  };
  
  $ctrl.ClickOstNomen = function(row, ask){///строки остатков на номенклатуре
    ask['$номенклатура'] = undefined;
    ask['@текущие остатки'] = undefined;
    $timeout(function(){
      ask['$номенклатура'] = {"id": row['$номенклатура'].id,"selectedItem":{id: row['$номенклатура'].id}};
      /*if( row['$номенклатура'].id != ask['номенклатура/id'] )*/ $ctrl.OnSelectNomen(ask['$номенклатура'], {"тмц/заявка": ask});
    });
    
  };
  
  $ctrl.MapObject = function(oid){
    return $ctrl.$Объекты[oid];
  };
  
  $ctrl.ClickOstObject = function(ost, ask, row){///ost - остаток на объекте, row (не обяз)- строка остатков всех объектов
    //~ console.log("остаток на объекте", ost, "строка остатков всех объектов", row, "заявка", ask);
    ost['тмц/заявка/id'] = ask.id;
    ost['тмц/заявка/количество']=ask['количество'];///>ost['остаток'] 
    $http.post(appRoutes.url_for('тмц/снаб/запрос резерва остатка'), ost)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'card red-text text-darken-3 red lighten-3 fw500 border');
        if (resp.data.success) {
          if (row) Materialize.toast("Запрос сохранен", 3000, 'card green-text text-darken-3 green lighten-3 fw500 border');
          else Materialize.toast("Запрос удален", 3000, 'card green-text text-darken-3 green lighten-3 fw500 border');
          console.log("тмц/снаб/запрос резерва остатков", resp.data.success);
          var nomen = ask['$номенклатура'];
          ask['$номенклатура'] = undefined;
          ask['@текущие остатки'] = undefined;
          $timeout(function(){
            ask['@тмц/резервы остатков'] = resp.data.success['@тмц/резервы остатков'];
            if (row) ask['номенклатура'] = row['$номенклатура'].parents_title.slice().pushSelf(row['$номенклатура'].title)
            //~ ask['$номенклатура'] = row ? {"id": row['$номенклатура'].id,"selectedItem":{id: row['$номенклатура'].id}} : nomen;///;
            
          });
          //~ $ctrl.ClickOstNomen(row, ask);
        }
      });
  };
  
  $ctrl.SaveNomen = function(data){
    return $http.post(appRoutes.url_for('тмц/снаб/сохранить номенклатуру заявки'), data)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'card red-text text-darken-3 red lighten-3 fw500 border');
        if (resp.data.success) {
          Materialize.toast("Сохранено", 3000, 'card green-text text-darken-3 green lighten-3 fw500 border');
          console.log("Сохранилась номенклатура заявки", resp.data.success);
          
        }
      });
    
  };


return Lib;
};
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());