(function () {'use strict';
/*
  Таблица инвентаризаций
*/

var moduleName = "ТМЦ список инвентаризаций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'ТМЦ таблица позиций', 'Номенклатура', 'TMCTableLib']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, $q, $timeout, $element, /*$http,*/ appRoutes, Util, $Номенклатура, $TMCTableLib, $Список) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  $scope.extend = angular.extend;
  
  new $TMCTableLib($c, $scope, $element);

  $c.Ready = function(){
    $c['обратно сортировать'] = true;
    $c.ready = true;
  };
  
  $c.$onInit = function(){
    
    if(!$c.param) $c.param = {};
    //~ if(!$c.param['фильтр тмц']) $c.param['фильтр тмц'] = function(){ return !0;};
    
    var async = [];
    
    //~ if ($c.data.Load) async.push($c.data.Load($c.param).then(function(){
      //~ $c.$data = $c.data;
      //~ $c.data = $c.$data.Data();///не копия массива
    //~ }));
    async.push($c.LoadData());
    
    async.push($Номенклатура.Load().then(function(data){
        //~ $c.$номенклатура = /*data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {})*/ $Номенклатура.$Data();
        $c['номенклатура'] = $Номенклатура.Data();
      }));
    $q.all(async).then(function(){
      $c.Ready();
    
      $timeout(function(){
        //~ $('.show-on-ready', $element[0]).slideDown();
        $('.modal', $($element[0])).modal();///{"dismissible0000": false,}
      });
      
    });
  };
  
  //~ $c.FilterData = function(item){
    //~ var filter = $c.param['фильтр'];
    //~ if(!filter) return !item._hide;
    //~ return filter(item);
    
  //~ };
  
  //~ $c.OrderByData = function(item){
    //~ return 1;///item['дата1'];
  //~ };
  
  var MapTMC = function(row){
    var nomen = this;
    if (!row['$номенклатура']) row['$номенклатура'] = nomen[row['номенклатура/id']];
    
  };
  $c.InitRow = function(item){
    item['@позиции тмц'].map(MapTMC,  $Номенклатура.$Data());
  };
  
  const Edit = function(item){
    $rootScope.$broadcast($c.param.broadcastEdit || 'Редактировать инвентаризацию ТМЦ', item);
  };
  
  $c.Edit = function(item){
    //~ if ($c.onEdit) $c.onEdit({item:item});
    //~ if ($c.param.where['тмц/номенклатура'].ready) return Materialize.toast("", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
    var data = [];/// в этот массив загрузится одна позиция
    if ($c.param.where && $c.param.where['тмц/номенклатура'] && $c.param.where['тмц/номенклатура'].ready ) $c.LoadItem(item, data).then(function(){ Edit(data[0]); });
    else Edit(item);
  };
  
  $c.LoadItem = function(item, data){/// загрузить для редактирования (фильтр мог убрать позиции)
    var loader = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций')/*, $c, $scope, $element*/);
    return loader.Load({"объект": $c.param['объект'], "id": item.id}).then(function(){
      loader.Data(data);
    });
    
  };
  
};
/*********************************************/

///получение данных

/************************************************/
module

//~ .factory('$ТМЦинвентаризации', $ТМЦинвентаризации)

.component('tmcSkladInvTable', {
  controllerAs: '$c',
  templateUrl: "tmc/sklad/inv/table",
  //~ scope: {},
  bindings: {
    data: '<', //массив
    param: '<',
    onEdit: '&',

  },
  controller: Component
})

;

}());