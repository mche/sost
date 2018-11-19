(function () {'use strict';
/*
  ответ на  запрос по резерву остатков
  к модулю списка заявок ТМЦ
*/
var moduleName = "ТМЦ/заявки/ответ по резерву остатка";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', /*'DateBetween',*/ 'Номенклатура', 'ТМЦ текущие остатки', 'Объекты']);

var Component = function  ($scope, /*$rootScope,*/ $timeout, $http, $element, $q, appRoutes, Util, $Номенклатура, $ТМЦТекущиеОстатки, $Объекты) {
  var $c = this;
  $scope.isNaN = isNaN;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
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
      //~ console.log('$Остатки', $c.$Остатки, );
    });
    
    //~ $q.all(async).then(function(){
      $c.ready = true;
      
    //~ })
    
  };

  $c.ChangeConfirmChb = function(row, chb){/// chb - объект созданный для чекбокса в разметке
    row['количество/резерв'] = parseFloat(Util.numeric(row['количество/резерв']));
    //~ if (/*isNaN(parseFloat(row['количество/резерв'])) || */chb.val == false) {
      //~ delete row['количество/резерв'];
      //~ $timeout(function(){
        //~ row['количество/резерв'] = row['количество'];
        
      //~ });
      //~ chb.val = false;
      //~ return;
    //~ }
    
    $http.post(appRoutes.urlFor('тмц/склад/подтвердить резерв остатка'), row)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'left red-text text-darken-3 red lighten-3 fw500 border animated flash-one');
        if (resp.data.success) {
          Materialize.toast("Подтверждение остатка сохранено", 3000, 'left green-text text-darken-3 green lighten-3 fw500 border animated flash-one');
          if (chb.val == false) row['количество/резерв'] = row['количество'];
        }
        
      });
    
    //~ console.log("ChangeConfirmChb", row);
  };

};

  
/*=============================================================*/

module

.component('tmcAskOstConfirm', {
  controllerAs: '$c',
  templateUrl: "tmc/ask/ost-confirm",
  //~ scope: {},
  bindings: {
    param: '<',
    ask: '<',///вся заявка

  },
  controller: Component
})

;

}());