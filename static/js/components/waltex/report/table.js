(function () {'use strict';
/*
*/

var moduleName = "ReportTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes']);// 'ReportTableRow'

var Component = function  ($scope, $timeout, $http, $q, $element, appRoutes, Util) {
  var $c = this;
  $scope.parseInt = parseInt;
  $scope.Util = Util;
  
  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    if (!$c.param.urlFor) $c.param.urlFor = {};
    $c.LoadData().then(function(){
      $c.ready = true;
      $timeout(function(){$('.modal', $($element[0])).modal();});
    });
    
  };
  
  $c.LoadData = function(){
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.urlFor($c.param.urlFor['данные отчета ДС'] || 'данные отчета ДС'), $c.param, {"timeout": $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        
        if(resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.data = resp.data;
        
      });
    
  };
  
  $c.RowsFilter = function(tr){
    //~ console.log("RowsFilter"/*!tr['колонки'].hasOwnProperty('-1')*/);
    if (!$c.chbNonEmptyRows) return true;
    return $c.IsVertTable() &&  tr['колонки'] && !!(tr['колонки'][1] ||  tr['колонки'][-1]);
  };
  
  $c.FilterSign = function(it){return it.hasOwnProperty('sign'); };
  $c.IsVertTable = function(){
    if($c.data.hasOwnProperty('это вертикальная таблица')) return $c.data['это вертикальная таблица'];
    $c.data['это вертикальная таблица'] = !!($c.data['колонки'] && $c.data['колонки'].filter($c.FilterSign).length);//  [0] && $c.data['колонки'][0].title == 'Приход';
    return $c.data['это вертикальная таблица'];
  };
  
  $c.TitleFormat = function(t){
    if (angular.isArray(t)) {
      if ($c.param['проект'] && $c.param['проект'].id) return t[0][1];
      //~ console.log("TitleFormat", tr.title[0]);
      return t[0].join(': ');
    }
    return t.replace(/ря(\s+\d+)$/i, 'рь$1')
      .replace(/ля(\s+\d+)$/i, 'ль$1')
      .replace(/марта(\s+\d+)$/i, 'март$1')
      .replace(/мая(\s+\d+)$/i, 'май$1')
      .replace(/марта(\s+\d+)$/i, 'март$1')
      .replace(/июня(\s+\d+)$/i, 'июнь$1')
      .replace(/августа(\s+\d+)$/i, 'август$1')
  ;/// месяца в месяц
  };
  
  //~ $c.CumOstatok = function(tr){
    //~ if (tr['категория'] != 3 || tr._cumOstatok) return;
    //~ var cumOstatok = $c.cumOstatok || parseFloat($c.data['сальдо']['начало'] && $c.data['сальдо']['начало'].replace(/\s+/g, '')) || 0;
    //~ cumOstatok +=  parseFloat(tr['всего'].replace(/\s+/g, ''));
    //~ console.log("cumOstatok: ", cumOstatok);
    //~ $c.cumOstatok = cumOstatok;
    //~ tr._cumOstatok = cumOstatok;
  //~ };
  
  $c.ToggleRow = function(tr, idx) {// приход/расход строка
    idx = idx || $c.data['строки'].indexOf(tr);
    
    if (!tr.child_rows) return $c.LoadRow(tr, idx);
    
    if  (tr.expand === false) {//expand
      angular.forEach(tr.child_rows, function(val){val.show = true;});
      $timeout(function(){tr.expand = true;});
      return;
    }
    // collapse
    $c.CollapseChilds(tr);
    $timeout(function(){tr.expand = false;});
    
  };
  
  $c.CollapseChilds = function(tr){
    if (!(tr.child_rows && tr.child_rows.length)) return;
    angular.forEach(tr.child_rows, function(val){
      $c.CollapseChilds(val);
      val.show = false;
      val.expand = false;
    });
  };
  
  $c.LoadRow = function(tr, idx) {
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    $c.param['категория'] = tr['категория'];
    if (tr.sign) $c.param.sign = tr.sign;
    if (tr['код интервала']) $c.param['код интервала'] = tr['код интервала'];
    if (tr['кошелек/id']) $c.param.key =tr['кошелек/id'];
    if (tr['кошелек2/id']) $c.param.key =tr['кошелек2/id'];
    if (tr['профиль/id']) $c.param.key =tr['профиль/id'];
    if (tr.hasOwnProperty('контрагент/id')) $c.param.key =tr['контрагент/id'];
    if (tr.hasOwnProperty('объект/id')) $c.param.key =tr['объект/id'];
    
    return $http.post(appRoutes.urlFor($c.param.urlFor['строка отчета ДС'] || 'строка отчета ДС'), $c.param, {"timeout": $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        
        if(resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        
        $c.data['строки'].splice(idx+1, 0, ...resp.data);///spliceArray
        tr.child_rows = resp.data;
        tr.expand = true;
        
      }, function(err){
        console.log('Ошибка загрузки строки', err);
        Materialize.toast('Ошибка загрузки данных: '.err.status, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        
      });
    
  };
  
  $c.TrStyle = function(tr){
    if (tr.show === false) return {"display": 'none'};
    return {"display": 'table-row'};
    
  };
  
  $c.TitleStyle = function(tr){
    var level = tr.level || 0;
    level++;
    return {"padding-left": level+'rem'};
    
  };
  
  //~ $c.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  $c.MoneySplit = function(m){
    if (!m) return [];
    return Util.money(m).split(/[.,]/);
  };
  
  $c.PlusMinusClass = function(val, flag){// flag - true для общего остатка
    //~ console.log("PlusMinusClass", val);
    var a = [];
    val = parseFloat(val);
    if (val > 0 && !flag) a.push('green-text text-darken-4');
    if (val < 0 && !flag) a.push('orange-text text-darken-4');
    if (val > 0 && flag) a.push('green darken-3 white-text');
    if (val < 0 && flag) a.push('orange darken-3 white-text');
    return a;
  };
  
  $c.ShowItem = function(it){
    //~ console.log("ShowItem", it);
    if(it['профиль/id']) return;// начисления по табелю не показывать
    $c.paramFormItem = undefined;
    $('#show-item').modal('open');
    //~ ($c.param.move && $c.param.move == 2)
    $timeout(function() {
      //~ console.log(it);
      $c.paramFormItem = {"проект": $c.param['проект'], "id": it.id, "без сохранения": true};// "контрагент00000": it['контрагент'], "кошелек2-000000000": it['кошелек2'],
    });
    /*
    if (it['позиция']) {
      $c.currentItem = it['позиция'];
      $('#show-item').modal('open');
      return;
    }
    
    if ($c.cancelerHttp) ctrl.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    
    
    $http.get(appRoutes.url_for('строка движения ДС', it.id), {"timeout": $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        
        if(resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        
        $c.currentItem = resp.data;
        it['позиция'] = resp.data;
        $('#show-item').modal('open');
          
        
      });
    */
  };
  
  $c.ToXLS = function(){
    //~ 
    return $http.post(appRoutes.urlFor($c.param.urlFor['данные отчета ДС'] || 'данные отчета ДС'), {"data":$c.data, "param":$c.param,}/*, {"timeout": $c.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        
        if(resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (resp.data.file) {
          let url = appRoutes.urlFor('временный файл', resp.data.file+'?filename='+(resp.data.filename || ''));
          //~ if (resp.data.filename)  url = ur;
          //~ if (vm.payPDF) return vm.iframeFile = {"src": url+'?inline=1', "content_type":'application/pdf' };
          window.location.href = url;/// а это get-запрос
        }
        //~ console.log("ToXLS", resp.data);
        
      });
  };
  
  
};

/*=============================================================*/

module

.component('reportTable', {
  controllerAs: '$c',
  templateUrl: "report/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());