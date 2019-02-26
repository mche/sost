(function () {'use strict';
/*
  общие методы для списка ТМЦ с позициями
  USAGE:
  var parentCtrl = new $TMCTableLib($c, $scope, $element);
*/
var moduleName = "TMCTableLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes', 'Util',*/ ]);

var Lib = function($timeout /*$compile,*/ ) {// factory
  
return function /*конструктор*/($c, $scope, $element){
  $scope.$element = $element;
  $scope.angular = angular;
  
  this.LoadData = function(param){
    const Loader = $c.data.Load || $c.$data && $c.$data.Load;
    if (!Loader) return console.log("Нет $c.data.Load || $c.$data && $c.$data.Load");
    //~ const Where = $c.data.Where || $c.$data && $c.$data.Where;///сохраненые фильтры
    //~ debugger;

    var p = {
      'объект': {"id": $c.param['объект'].id},
      "where": angular.copy(param && param.where) || {},
    };
    if ($c.$data) $c.$data.Clear();
    $c.refreshTable = !0;
    //~ if (Util.IsType($c.data, 'array')) $c.data.splice(0, $c.data.length);
    return Loader(p)
      .then(function(){
        $c.refreshTable = undefined;
        if (!$c.$data) $c.$data = $c.data;///это Util.$Список
        $c.data = $c.$data.Data();///не копия массива
        $c.param.where = $c.$data.Where();// фильтры
        //~ console.log("Loader where", $c.param.where);
      });
    
  };
  
  this.LoadDataAppend = function(param){
    var p = {
      'объект': {"id": $c.param['объект'].id},
      "where": angular.copy(param && param.where) || {},
      "offset": $c.data.length,
      "append": !0,
    };
    $c.cancelerHttp = !0;
    return $c.$data.Load(p)
      .then(function(){
        $c.cancelerHttp = undefined;
        $c.InitTable();
      });
  };
  
  this.InitTable = function(){
    $c.dataFiltered = $c.data.filter($c.FilterData);
    
  };
  
  this.RefreshTable = function(){
    $c.refreshTable = !0;
    $timeout(function(){
      $c.refreshTable = undefined;
    });
    
  };
  
  this.FilterData = function(item){
    var filter = $c.param['фильтр'];
    if(!filter) return !item._hide;
    return filter(item);
  };
  
  this. OrderByData = function(item){
    if (item._new) return '';
    return item['дата1'];
    
    
  };
  
  ///фильтры
  this.OpenModalFilter = function(modalID, name, val){
    if (!$c.param.where) $c.param.where = {};///костыль
    //~ var val1 = $c.param.where[name];
    if ($c.param.where[name] && val) val.ready = $c.param.where[name].ready;
    var prev = $c.param.where[name];
    $c.param.where[name] = undefined;
    $timeout(function(){
      $c.param.where[name] = val || prev;
      $(modalID, $($element[0])).modal('open');
      //~ console.log("OpenModalFilter", $(modalID));
    });
    
  };
  
  this.CancelWhere = function(name){
    if(!$c.param.where || !$c.param.where[name] || !$c.param.where[name].ready) return;
    $c.param.where[name].ready = 0;
    $c.ready = false;
    $c.LoadData($c.param).then(function(){ $c.Ready(); });
  };
  
  this.SendWhere = function(name){
    if (!$c.param.where) $c.param.where = {};///костыль
    $c.param.where[name].ready = 1;
    $c.ready = false;
    $c.LoadData($c.param).then(function(){ $c.Ready(); });
    
  };
  
  this.PosNomenClick = function(nid){/// проброс клика tmc-snab-table-tmc
    //~ console.log("PosOnNomenClick", arguments);
    $c.OpenModalFilter('#modal-nomen', 'тмц/номенклатура', {id: nid});
  };
  
  this.ClickDate = function(modalID, name, val){
    if (!$c.param.where) $c.param.where = {};///костыль
    $c.param.where[name] = $c.param.where[name] || {values: []};
    $c.param.where[name].values[0]=val;
    $c.OpenModalFilter(modalID, name); 
  };

  
  angular.extend($c, this);


  //~ return Lib;
  return this;
};

};
  
/**********************************************************************/
module

.factory('$TMCTableLib', Lib)
;

}());
