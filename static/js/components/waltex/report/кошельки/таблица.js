(function () {'use strict';
/*
*/

var moduleName = "Таблица поступлений/расходов по кошелькам";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [/*'Util', 'appRoutes'*/]);// 'ReportTableRow'

var Component = function  ($scope, $timeout, $http, $q, $element, appRoutes, Util, $Список) {
  var $c = this;
  $scope.Math = Math;
  $scope.parseFloat = parseFloat;
  
  $c.$onInit = function(){
    $c.LoadData().then(function(loader){
      $c.ready = true;
    });
    
  };
  
  const RowData = function(row, wid){/// 2 - ид кошелька
    var sum = parseFloat(Util.numeric(row['сумма']));
    var sign = Math.sign(sum)+'';
    if (!$c.data['записи'][sign][wid]) $c.data['записи'][sign][wid] = [];
    $c.data['записи'][sign][wid].push(row);
    if ($c.data['суммы'][sign][wid] === undefined) $c.data['суммы'][sign][wid] = 0;
    $c.data['суммы'][sign][wid] += sum;
  };
  const SomeNotWallet = function(id){
    return id == this.id;
  };
  $c.LoadData = function(){
    if (!$c.data) $c.data = [];
    var loader = new $Список(appRoutes.url_for('деньги/таблица/по кошелькам'), $c, $scope, $element);
    return loader.Load({"проект/id": $c.param['проект'].id, "дата": $c.param['дата']}).then(function(){
      //~ if (!$c.$data) $c.$data = {};
      //~ loader.$Data($c.$data);
      var data = loader.Data();
      $c.data['кошельки'] = data[0].filter(function(w){ return !data[3].some(SomeNotWallet, w); });///сортировано по кошелькам
      $c.data['записи'] = {"1":{}, "-1":{}};
      $c.data['суммы'] = {"1":{}, "-1":{}};
      data[1].map(function(row){/// прямые платежи сортировано дата, id в обратном
        RowData(row, row['кошелек/id']);
        //~ var wid2 = row['кошелек2/id'];
        /*if (wid2) {///swap
          var row2 = angular.copy(row);
          wid = row2['кошелек/id'];
          row2['кошелек/id'] = row2['кошелек2/id'];
          row2['кошелек2/id'] = wid;
          wid = row2['кошелек'];
          row2['кошелек'] = row2['кошелек2'];
          row2['кошелек2'] = row['проект']+': '+wid;
          sign = Math.sign(-1*sum)+'';
          if (!$c.data['записи'][sign][wid2]) $c.data['записи'][sign][wid2] = [];
          $c.data['записи'][sign][wid2].push(row2);
          $c.data['записи'][sign]['сумма'] += -1*sum;
        }*/
      });
      data[2].map(function(row){/// внутренние перемещения сортировано дата, id в обратном
        RowData(row, row['кошельки/id'][0][1]);
        row['кошелек2'] = row['кошельки'][1][0]+':'+row['кошельки'][1][1];
      });
      return loader;
    });
    
  };
  
};

/*=============================================================*/

module

.component('moneyReportWallets', {
  controllerAs: '$c',
  templateUrl: "money/report/wallets",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());