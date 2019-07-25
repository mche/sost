(function () {'use strict';
/*
  Универсальная таблица позиций ТМЦ
*/

var moduleName = "ТМЦ таблица позиций";
try {angular.module(moduleName); return;} catch(e) { }
try {angular.module('Номенклатура');} catch(e) {  angular.module('Номенклатура', []).factory("$Номенклатура", function(){}); }///заглушка!
var module = angular.module(moduleName, ['Util', 'appRoutes', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, /*$q,*/ $timeout, $http, $element, appRoutes,/**/ Util, $Номенклатура) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $c.$onInit = function(){
    if(!$c.param) $c.param = {};
    $c.NomenData().then(function(){
      //~ $timeout(function(){  });
      $c.ready = true;
      //~ console.log("ТМЦ таблица позиций $onInit", $c.item);
    });
    
    
    //~ if($c.onAcceptChb) console.log("onAcceptChb", $c.onAcceptChb);
  };
  
  
  $c.InitTable = function(){
    $c.dataFiltered = $c.param['фильтр тмц'] ? $c.data.filter($c.param['фильтр тмц']) : $c.data;
    
  };
  
  $c.FilterData = function(row){
    var filter = $c.param['фильтр тмц']/* || $c.param['фильтр']*/;
    if(!filter) return !0;
    return filter(row);
    
  };
  
  $c.InitRow = function(row){
    //~ console.log("InitRow", row);
    if ($c.param['ТМЦ/крыжик позиций/событие'] && !row.hasOwnProperty('крыжик количества')) row['крыжик количества'] = !!row['количество/принято'];
    //~ if (row['наименование']) row.nomen
  };
  
  $c.FilterDataAccepted = function(row){///подсчет крыжиков принято
    return !!row['количество/принято'];
    
  };
  
  /*
  $c.OnAccept = function(row){/// принятие входящего количества
    var ev = $c.param['ТМЦ/крыжик позиций/событие'];
    if (!ev) return;
    if (!row['крыжик количества'])  row['количество/принято'] = null;
    else if (row['количество/принято'] === undefined || row['количество/принято'] === null) row['количество/принято'] = row['количество'];
    
    $rootScope.$broadcast(ev, row);
    
  };*/
  
  /// или редактировать номенклатуру
  $c.NomenClick = function(row){
    //~ console.log("NomenClick", row);
    
    if ($c.param['сохранять номенклатуру по наименованию'] && row['наименование']) {
      //~ row['номенклатура/id'] = undefined;
      row['номенклатура'] = undefined;
      var n = row['наименование'];
      row['наименование'] = undefined;///передернуть
      $timeout(function(){ row['наименование'] = n; });
      return;
    }
    $c.onNomenClick && row['номенклатура/id'] && $c.onNomenClick({"nomen": row['номенклатура/id']});
  };
  
  $c.CountClick = function(){
    $c.onCountClick && $c.onCountClick({item: $c.item});
    
  }
  
  /// перевод предварительного наименования в номенклатуру
  //~ $c.OnSelectItemNomen = function(item, row){
    //~ console.log("OnSelectItemNomen", item, row);
    
  //~ };
  
  const FilterNotNull = function(it){ return Object.prototype.toString.call(it) == "[object Object]" ? !!it.title : !!it; };
  $c.ValidNomen = function(nomen){///обязательно иметь корень
    //~ var nomen = row.nomen;
    if (!nomen) return false;
    var selItem = nomen.selectedItem;
    var childs = selItem.childs && selItem.childs.length;
    var finalItem = selItem && selItem.id && !childs;
    if (finalItem) return true; ///конечный элемент дерева пусть
    var newItems = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    if (!newItems) return false;/// нельзя не конечную позицию без новых
    var oldItems = (selItem && selItem.id && ((selItem.parents_id && selItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    //~ console.log("FilterValidPosNomen", oldItems, newItems, nomen);
    return oldItems && (oldItems+newItems) >= 4;/// 4 уровня
  };
  
  $c.SaveNomen = function(row){
    $http.post(appRoutes.url_for('тмц/склад/сохранить номенклатуру закупки'), {"id": row.id, "nomen": row.nomen})
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'fw500 red-text text-darken-3 red lighten-5 border animated zoomInUp slow');
        if (resp.data.success) {
          Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          console.log("SaveNomen", resp.data.success);
          resp.data.success.parents_title.push(resp.data.success.title);
          var n = row['наименование'];
          row['наименование'] = undefined;///передернуть
          row['номенклатура'] = undefined;
          $timeout(function(){
            //~ row['номенклатура'] = resp.data.success.parents_title;
            row['наименование'] = resp.data.success.parents_title;
            row['номенклатура/id'] = resp.data.success.id;
            //~ row['наименование'] = n;
          });
          $c.NomenData(true);///обновить номен
        }
        
      });
    
  };
  
  /// перевод предварительного наименования в номенклатуру
  $c.NomenData = function(refresh){
    if (!$c['@номенклатура']) $c['@номенклатура'] = [];
    $c['@номенклатура'].splice(0, $c['@номенклатура'].length);
    if (!$c.$Номенклатура ) $c.$Номенклатура = $Номенклатура;
    if (refresh) $Номенклатура.Refresh(0);
    return $Номенклатура.Load(0).then(function(data){
      Array.prototype.push.apply($c['@номенклатура'], $Номенклатура.Data());
    });
  };
  
  ///крыжик строки
  $c.ChangeChb = function(row, Func){
    row._save_chb = true;
    Func(row).then(function(){
      row._save_chb = false;
    });
  };
  
  /// крыжик первой колонки
  $c.ChangeChb1Col = function(){
    var chb = $c.param['крыжик 1колонка'];
    //~ console.log("ChangeChb1Col", angular.copy($c.item));
    $c.dataFiltered.map(function(row){
      row[chb.model] = $c['крыжик 1колонка все позиции'];
      
    });
    
    
  };
};

/*=============================================================*/

module

.component('tmcSnabTableTmc', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/table/tmc",
  //~ scope: {},
  bindings: {
    data: '<', ///массив
    item: '<', /// шапка
    param: '<',
    onNomenClick: '&',
    onCountClick: '&',
    //~ onConfirmRow: '&', ///крыжик
    //~ onAcceptChb: '&', // по крыжику принять 

  },
  controller: Component
})

;

}());