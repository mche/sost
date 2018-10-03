(function () {'use strict';
/*
  без транспорта
*/

try {angular.module('ТМЦ/простая форма снабжения');}
catch(e) {  angular.module('ТМЦ/простая форма снабжения', []);}// тупая заглушка
  
var moduleName = "ТМЦ список заявок";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween', 'ТМЦ/простая форма снабжения', 'Номенклатура', 'TreeItem', 'ТМЦ текущие остатки', 'Объекты']);//'ngSanitize',, 'dndLists'
//~ module.config(function($rootScopeProvider){
  //~ $rootScopeProvider.digestTtl(100);
  
//~ });

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, $Номенклатура, ТМЦТекущиеОстатки, $Объекты) {//TMCAskTableData
  var $ctrl = this;
  
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    var $ask;
    //~ console.log('Сохранена заявка ТМЦ', ask);
    if(ask._new) return $ctrl.Append(ask);// новая строка
    // старая строка
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    //~ console.log('Сохранена заявка ТМЦ', $ask);
    if($ask) angular.forEach(ask, function(val, key){$ask[key]=val;});
    //~ $ask._init = false;
    //~ $ctrl.InitAsk($ask);

  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    var $ask;
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    $ctrl.Delete($ask);
  });
  

  
  /*$scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.append) {
      $ctrl.Append(newVal.append);
      delete newVal.append;
      return;
    }
    if (newVal.remove) {
      $ctrl.Delete(newVal.remove);
      delete newVal.remove;
      return;
    }
  }, true);*/
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if (!$ctrl.param.where) $ctrl.param.where={"дата1":{"values":[]}, "наименование":{}};// фильтры
      if (!$ctrl.param) $ctrl.param = {};
      if (!$ctrl.param.theadClass) $ctrl.param.theadClass = 'orange lighten-3';
      if (!$ctrl.param.tbodyClass) $ctrl.param.tbodyClass = 'orange lighten-5';
      $scope.param = $ctrl.param;
      $ctrl['обратно сортировать'] =  !!$ctrl.param['список простых закупок'];
      
      if ($ctrl.param['обработать номенклатуру']) {
        
        $Объекты["все объекты без доступа"]().then(function(resp){ $ctrl.$Объекты = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});})
        
        $ctrl['номенклатура']=[];/// для tree-item
         
        $Номенклатура.Load(0).then(function(data){
          Array.prototype.push.apply($ctrl['номенклатура'], data);
          $ctrl.$Номенклатура = $Номенклатура.$Data();
          
          $ctrl.Show();
        });//$http.get(appRoutes.url_for('номенклатура/список', 0));
        
        $ctrl['Остатки'] = [];
        ТМЦТекущиеОстатки.Load($ctrl.param).then(function(resp){
          Array.prototype.push.apply($ctrl['Остатки'], resp.data);
          $ctrl.$Остатки = resp.data.reduce(function(result, item, index, array) {
            if (!result[item['номенклатура/id']]) result[item['номенклатура/id']] = [];
            result[item['номенклатура/id']].push(item);
            return result;
          }, {});
          //~ console.log('$Остатки', $ctrl.$Остатки, );
        });
          
      } else $ctrl.Show();
      
      //~ $ctrl.data = $ctrl.data.filter($ctrl.FilterData);
      
      //~ if($ctrl.data) $timeout(function(){ });
        
      //~ else  $ctrl.LoadData().then(function(){  $ctrl.Show(); });
    
    });
  };
  
  $ctrl.Show = function(){
    $ctrl.ready = true;
    
    $timeout(function(){
      $('.show-on-ready', $($element[0])).slideToggle( /*"slow"*/ );
      
      $('.modal', $($element[0])).modal({
          endingTop: '0%',
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $ctrl.modal_trigger = trigger;
          },
        });
        
        //~ $ctrl.tab = $ctrl.tabs[0]; 
        //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
        //~ $ctrl.tabsReady = true;
      });
    
  };
  
  /***$ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    //$http.post(appRoutes.url_for('тмц/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //
    return TMCAskTableData($ctrl.param)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };***/
  
  $ctrl.FilterData = function(it){
    //~ var tab = this || $ctrl.tab;
    //~ if(!tab) return false;
    //~ return tab.filter(it, tab);
    var filter = $ctrl.param['фильтр'];
    if(!filter) return !it._hide;
    return !it._hide  && filter(it);
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    return it["дата1"]+'/'+it.id;//["объект/id"];
  };
  
  $ctrl.ClickAsk = function(ask){// клик на строке
    //~ if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    //~ if(it["транспорт/заявки/id"]) return;
    $timeout(function(){
      if(!$ctrl.param['в закупку'] && !$ctrl.param['список простых закупок']) ask._edit = true;///angular.copy(ask);
      if(/*it['номенклатура/id']*/ $ctrl.param['обработать номенклатуру'] && !ask['$номенклатура'])  {
        ask['$номенклатура'] = {"id": ask['номенклатура/id'], "selectedItem":{id: ask['номенклатура/id']}, /*"topParent000":{id: 0},*/};
        if (ask['номенклатура/id']) $ctrl.OnSelectNomen(ask['$номенклатура'], {"тмц/заявка": ask});
      }
    });
    
    /*
    //~ $ctrl.param.edit = it;
    $timeout(function(){
      $rootScope.$broadcast('Редактировать заявку ТМЦ', it);
      //~ if (it['$простая обработка заявки']) it['$простая обработка заявки']._edit= !it['$простая обработка заявки'].edit;
    });// $rootScope.$on && $scope.$on
    */
  };
  
  $ctrl.FilterEasy= function(it){///this - тип строки строка 
    return it['строки тмц']==this;
  };
  
  $ctrl.InitRow = function(it){//необработанные позиции тмц + простая поставка
    //~ if(it['$дата1'] && angular.isString(it['$дата1'])) it['$дата1'] = JSON.parse(it['$дата1']);
    
    /***if (!it['$простая обработка заявки'])***/ it['$простая обработка заявки'] = {};
    var easy = it['$простая обработка заявки'];
    if (!easy['$номенклатура']) easy['$номенклатура'] = {"selectedItem":{id: it['номенклатура/id']}, /*"topParent000":{id:0}*/};
    easy['$тмц/заявка'] = angular.copy(it);
    
    
    
    it['заявка/количество/остаток'] = (parseFloat(Util.numeric(it["количество"])) - parseFloat(Util.numeric(it["тмц/количество"]) || 0));
    var rowsEasy = it['@тмц/строки простой поставки'] || [];
    rowsEasy.map(function(row){  it['заявка/количество/остаток'] -= parseFloat(Util.numeric(row['количество']) || 0);  });
    easy['$тмц/заявка']['количество'] = it['заявка/количество/остаток'];
    
    
    if (!easy['$строка тмц/поставщик']) easy['$строка тмц/поставщик'] = rowsEasy.filter($ctrl.FilterEasy, 'поставщик').pop() || {"количество":undefined,"коммент":undefined,};
    if (!easy['$строка тмц/поставщик']['количество'] && parseFloat(easy['$тмц/заявка']['количество'] || 0) > 0) easy['$строка тмц/поставщик']['количество'] = easy['$тмц/заявка']['количество'];///уже вычтены частичные поставки
    if (!easy['$строка тмц/с базы']) easy['$строка тмц/с базы'] =  rowsEasy.filter($ctrl.FilterEasy, 'с базы').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    if (!easy['$строка тмц/на базу']) easy['$строка тмц/на базу'] = rowsEasy.filter($ctrl.FilterEasy, 'на базу').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
  };
  
                                                                                var FilterNotNull = function(id){ return !!id; };
  $ctrl.ValidNomen = function(ask){
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
    var old_z_nom = z['номенклатура/id'];
    if (nom.id && !(nom.newItems && nom.newItems[0] && nom.newItems[0].title) ) {
      z['номенклатура/id'] = nom.id;
      //~ z['$номенклатура']['сохранить'] = false;
      z['@текущие остатки'] = Object.keys($ctrl.$Остатки).filter(FilterOstParentNomen, nom).map(MapOstRow);
      //~ console.log("OnSelectNomen", ost);
      if (old_z_nom != nom.id) $ctrl.SaveNomen({"тмц/заявка/id":z.id, "номенклатура/id":nom.id,});
      return;
    }
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
      $ctrl.OnSelectNomen(ask['$номенклатура'], {"тмц/заявка": ask});
    });
    
  };
  
  $ctrl.MapObject = function(oid){
    return $ctrl.$Объекты[oid];
  };
  
  $ctrl.ClickOstObject = function(ost, row, ask){///ost - остаток на объекте, row - строка остатков всех объектов
    console.log("остаток на объекте", ost, "строка остатков всех объектов", row, "заявка", ask);
    ost['тмц/заявка/id'] = ask.id;
    $http.post(appRoutes.url_for('тмц/снаб/запрос остатков'), ost)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500');
        if (resp.data.success) {
          console.log("тмц/снаб/запрос остатков", resp.data.success);
          $ctrl.ClickOstNomen(row, ask);
        }
      });
  };
  
  $ctrl.SaveNomen = function(data){
    return $http.post(appRoutes.url_for('тмц/снаб/сохранить номенклатуру заявки'), data)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500');
        if (resp.data.success) {
          console.log("Сохранилась номенклатура заявки", resp.data.success);
          
        }
      });
    
  };
  
  
  /**** постановка/снятие позиции в обработку ****/
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    $rootScope.$broadcast('Добавить/убрать позицию ТМЦ в заявку снабжения', it);
  };
  
  $ctrl.CheckedEasy = function(it, bLabel){// bLabel boolean click label
    //~ console.log("CheckedEasy", it);
    //~ $ctrl['$простая обработка заявки'] = undefined;
    //~ if (!it['простая обработка'])  $timeout(function(){ $ctrl['$простая обработка заявки'] = it['$простая обработка заявки']; });
    //~ if(bLabel) it['простая обработка'] = !it['простая обработка'];
    
  };
  
  
  $ctrl.Delete = function(it){
    //~ var it = $ctrl.param.delete;
    //~ delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    delete it._new;
    //~ n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(it);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    
  };

  
  $ctrl.CancelWhere = function(name){
    if(!$ctrl.param.where[name].ready) return;
    $ctrl.param.where[name].ready = 0;
    //~ $ctrl.LoadData();//$ctrl.param.where
    if ($ctrl.onWhere) $ctrl.onWhere();
  };
  
  $ctrl.SendWhere = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.where['сумма'].sign = abs;
    //~ }
    $ctrl.param.where[name].ready = 1;
    //~ $ctrl.LoadData();//$ctrl.param.where
    if ($ctrl.onWhere) $ctrl.onWhere();
  };

  
};

/******************************************************/
/***var Data  = function($http, appRoutes){
  var  $this = {
    Load: function(param){ return $http.post(appRoutes.url_for('тмц/список заявок'), param); },
  };
  return $this;
  
};***/


/*=============================================================*/

module
//~ .factory("TMCAskTableData", Data)
.component('tmcAskTable', {
  templateUrl: "tmc/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',
    onWhere: '&', ///фильтрация записей $ctrl.param.where

  },
  controller: Component
})

;

}());