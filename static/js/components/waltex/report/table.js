(function () {'use strict';
/*
*/

var moduleName = "ReportTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);// 'ReportTableRow'

var Component = function  ($scope, $timeout, $http, $q, $element, appRoutes) {
  var $ctrl = this;
  $scope.parseInt = parseInt;
  
  $ctrl.$onInit = function(){
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      $timeout(function(){$('.modal', $($element[0])).modal();});
    });
    
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
  
  $ctrl.IsVertTable = function(){
    return $ctrl.data['колонки'][0].title == 'Приход';
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
    $timeout(function(){tr.expand = false;});
    
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
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $ctrl.param['категория'] = tr['категория'];
    if (tr.sign) $ctrl.param.sign = tr.sign;
    if (tr['код интервала']) $ctrl.param['код интервала'] = tr['код интервала'];
    
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
        tr.expand = true;
        
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
  
  $ctrl.ShowItem = function(it){
    $ctrl.paramFormItem = undefined;
    $('#show-item').modal('open');
    //~ ($ctrl.param.move && $ctrl.param.move == 2)
    $timeout(function() {
      //~ console.log(it);
      $ctrl.paramFormItem = {"проект": $ctrl.param['проект'], "id": it.id, "кошелек2": it['кошелек2'], "без сохранения": true};
    });
    /*
    if (it['позиция']) {
      $ctrl.currentItem = it['позиция'];
      $('#show-item').modal('open');
      return;
    }
    
    if ($ctrl.cancelerHttp) ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    
    
    $http.get(appRoutes.url_for('строка движения ДС', it.id), {"timeout": $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        
        $ctrl.currentItem = resp.data;
        it['позиция'] = resp.data;
        $('#show-item').modal('open');
          
        
      });
    */
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