(function () {'use strict';
/*
*/

var moduleName = "ReportTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'ReportTableRow']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $q, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
    
    //~ });
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();;
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('данные отчета ДС'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.data = resp.data;
        
      });
    
  };
  
  $ctrl.ToggleRow = function(tr, idx) {// приход/расход строка
    idx = idx || $ctrl.data['строки'].indexOf(tr);
    
    if (!tr.child_rows) return $ctrl.LoadRow(tr, idx);
    
    if  (tr.expand === false) {//expand
      angular.forEach(tr.child_rows, function(val){val.show = true;});
      $timeout(function(){tr.expand = true;});
      return;
    }
    // collapse
    $ctrl.CollapseChilds(tr);
    //~ var childs = angular.copy(tr.child_rows);
    //~ while (childs && childs.length) {
      //~ var child = childs.shift();
      //~ child.show = false;
      //~ var subchilds = child.child_rows;
      //~ if (subchilds && subchilds.length) Array.prototype.unshift.apply(childs, subchilds);
    //~ }
    $timeout(function(){tr.expand = false;});
      
      
      //~ var deleteCount = tr.child_rows.length;
      //~ if (deleteCount) $ctrl.data['строки'].splice(idx+1, deleteCount);
      //~ tr._child_rows = tr.child_rows;
      //~ delete tr.child_rows;
      //~ return;
    //~ } 
    //~ else if (tr._child_rows) {// expand
      //~ $ctrl.data['строки'].spliceArray(idx+1, tr._child_rows);
      //~ tr.child_rows = tr._child_rows;
      //~ delete tr._child_rows;
      //~ return;
    //~ }
    
    
    
    //~ console.log(idx);
    
  };
  
  $ctrl.CollapseChilds = function(tr){
    if (!(tr.child_rows && tr.child_rows.length)) return;
    angular.forEach(tr.child_rows, function(val){
      $ctrl.CollapseChilds(val);
      val.show = false;
      val.expand = false;
    });
  };
  
  $ctrl.LoadRow = function(tr, idx) {
    if ($ctrl.cancelerHttp) ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $ctrl.param['категория'] = tr['категория'];
    $ctrl.param.sign = tr.sign;
    
    return $http.post(appRoutes.url_for('строка отчета ДС'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        
        $ctrl.data['строки'].spliceArray(idx+1, resp.data);
        tr.child_rows = resp.data;
        
      });
    
  }
  
  $ctrl.TrStyle = function(tr){
    if (tr.show === false) return {"display": 'none'};
    return {"display": 'table-row'};
    
  };
  
  $ctrl.TitleStyle = function(tr){
    var level = tr.level || 0;
    level++;
    return {"padding-left": level+'rem'};
    
  };
  
  
};

/*=============================================================*/

module

.component('reportTable', {
  templateUrl: "report/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());