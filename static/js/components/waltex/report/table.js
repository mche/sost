(function () {'use strict';
/*
*/

var moduleName = "ReportTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes']);// 'ReportTableRow'

var Component = function  ($scope, $timeout, $http, $q, $element, appRoutes, Util) {
  var $ctrl = this;
  $scope.parseInt = parseInt;
  $scope.Util = Util;
  
  $ctrl.$onInit = function(){
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      $timeout(function(){$('.modal', $($element[0])).modal();});
    });
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
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
  
  $ctrl.FilterSign = function(it){return it.hasOwnProperty('sign')};
  $ctrl.IsVertTable = function(){
    if($ctrl.data.hasOwnProperty('это вертикальная таблица')) return $ctrl.data['это вертикальная таблица'];
    $ctrl.data['это вертикальная таблица'] = $ctrl.data['колонки'] && $ctrl.data['колонки'].filter($ctrl.FilterSign).length;//  [0] && $ctrl.data['колонки'][0].title == 'Приход';
    return $ctrl.data['это вертикальная таблица'];
  };
  
  $ctrl.TitleFormat = function(tr){
    if (angular.isArray(tr.title)) {
      if ($ctrl.param['проект'] && $ctrl.param['проект'].id) return tr.title[0][1];
      //~ console.log("TitleFormat", tr.title[0]);
      return tr.title[0].join(': ');
    }
    return tr.title;
  };
  
  //~ $ctrl.CumOstatok = function(tr){
    //~ if (tr['категория'] != 3 || tr._cumOstatok) return;
    //~ var cumOstatok = $ctrl.cumOstatok || parseFloat($ctrl.data['сальдо']['начало'] && $ctrl.data['сальдо']['начало'].replace(/\s+/g, '')) || 0;
    //~ cumOstatok +=  parseFloat(tr['всего'].replace(/\s+/g, ''));
    //~ console.log("cumOstatok: ", cumOstatok);
    //~ $ctrl.cumOstatok = cumOstatok;
    //~ tr._cumOstatok = cumOstatok;
  //~ };
  
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
    if (tr['кошелек/id']) $ctrl.param.key =tr['кошелек/id'];
    if (tr['профиль/id']) $ctrl.param.key =tr['профиль/id'];
    if (tr.hasOwnProperty('контрагент/id')) $ctrl.param.key =tr['контрагент/id'];
    if (tr.hasOwnProperty('объект/id')) $ctrl.param.key =tr['объект/id'];
    
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
  
  //~ $ctrl.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $ctrl.PlusMinusClass = function(val, flag){// flag - true для общего остатка
    //~ console.log("PlusMinusClass", val);
    var a = [];
    val = parseFloat(val);
    if (val > 0 && !flag) a.push('green-text text-darken-4');
    if (val < 0 && !flag) a.push('orange-text text-darken-4');
    if (val > 0 && flag) a.push('green darken-3 white-text');
    if (val < 0 && flag) a.push('orange darken-3 white-text');
    return a;
  }
  
  $ctrl.ShowItem = function(it){
    //~ console.log("ShowItem", it);
    if(it['профиль/id']) return;// начисления по табелю не показывать
    $ctrl.paramFormItem = undefined;
    $('#show-item').modal('open');
    //~ ($ctrl.param.move && $ctrl.param.move == 2)
    $timeout(function() {
      //~ console.log(it);
      $ctrl.paramFormItem = {"проект": $ctrl.param['проект'], "id": it.id, "без сохранения": true};// "контрагент00000": it['контрагент'], "кошелек2-000000000": it['кошелек2'],
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