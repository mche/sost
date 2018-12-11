(function () {'use strict';
/*
*/

var moduleName = "Форма раздачи конвертов ЗП";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'WalletItem',  /* 'Объект или адрес',*/]);//'ngSanitize',, 'dndLists'

var C = function  ($scope, $http, $timeout, $element, appRoutes, Util) {
  var $c = this;
  $scope.Util = Util;
  $scope.parseFloat = parseFloat;

  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    if (!$c.param['месяц']) $c.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        onSet: $c.SetMonth,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: 'OK',// кнопка
        selectYears: true,
      });
    });
    
    if (!$c.data) $c.LoadData().then(function(){
      $c.Ready();
      
    });
    else $c.Ready();
    
  };
  
  $c.Ready = function(){
    $c.ready = !0;
    
    
  };
  
  $c.SetMonth = function(context){
    var d = $(this._hidden).val();
    //~ console.log("SetMonth", d);
    if($c.param['месяц'] == d) return;
    $c.param['месяц'] = d;
    $c.ready = !1;
    
    $c.LoadData().then(function(){
      $c.Ready();
      
    });
    
    
  };
  
  var Reduce = function (result, item, index, array) {  result[item.pid] = item; return result; };
  $c.LoadData = function(){
    
    if (!$c.data) $c.data = [];
    if (!$c.$data) $c.$data = {};
    $c.data.splice(0, $c.data.length);
    Object.keys($c.$data).map(function(key){ delete $c.$data[key]; });
    
    $c.cancelerHttp = !0;
    return $http.post(appRoutes.url_for("зп/конверты/данные"), $c.param/*, {"timeout": $c.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        $c.cancelerHttp = undefined;
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-4 red lighten-3 fw500 border animated zoomInUp slow');;
        Array.prototype.push.apply($c.data, resp.data);
        resp.data.reduce(Reduce, $c.$data);
      });
    
  };
  
  $c.InitTable = function(){///фильтровать тут
    
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
            onSet: $c.SetDate,
            //~ format: 'mmmm yyyy',
            //~ selectYears: true,
          });
      
    });
    
    return $c.data;
    
  };
  
  $c.OrderByData = function(row){
    return row.names.join(' ');
    
  };
  
  $c.InitRow = function(row, index){
    row['кошелек'] = {"id": row['кошелек/id']};
    row['начислено'] = parseFloat(Util.numeric(row['начислено'])).toLocaleString('ru-RU');
    row['доп'] = Math.abs(parseFloat(Util.numeric(row['доп'] || 0))).toLocaleString('ru-RU');
    row['расчет ЗП округл_'] = parseFloat(Util.numeric(row['расчет ЗП округл']));
    row['расчет ЗП округл'] = row['расчет ЗП округл_'].toLocaleString('ru-RU');
    if (row['@движение денег']) row['@движение денег'].map(function(m, idx){ $c.InitMoney(row, m, idx); });
    $timeout(function(){
      $('.datepicker', $('#row'+index)).pickadate({// все настройки в файле русификации ru_RU.js
            onSet: $c.SetDate,
            //~ format: 'mmmm yyyy',
            //~ selectYears: true,
          });
      
    });
  };
  
  /*$c.InitDatePicker = function(event, row){
      $(event.target).pickadate({// все настройки в файле русификации ru_RU.js
            onSet: $c.SetDate,
            //~ format: 'mmmm yyyy',
            //~ selectYears: true,
          });
    
  };*/
  
  $c.InitMoney = function(row, m, index){
    var s = Math.abs(parseFloat(Util.numeric(m['сумма'])));
    m['сумма'] = s.toLocaleString('ru-RU');
    if (!row.id && (Math.round(s/50)*50 == row['расчет ЗП округл_'])) {
      row.id=m.id
      row['дата1']=m['дата'];
      row['кошелек'] = {"id": m['кошелек/id']};
      row['примечание'] = m['примечание'];
      m['скрыть'] = !0;
    }
    
    
  };
  
  $c.SetDate = function(context){
    var s = this.component.item.select;
    var pid = this.component.$node.data('pid');
    $timeout(function(){ $c.$data[pid]['дата1'] = [s.year, s.month+1, s.date].join('-'); });
  };
  
  $c.Valid = function(row){
    return !!(row['расчет ЗП округл'] && row['дата1']
      && row['кошелек'].id);
    
    
  };
  
  $c.SelectWallet = function(item, wallet){
    
  };
  
  $c.Save = function(row){
    if (!$c.Valid(row)) return;
    row._save = !0;
    return $http.post(appRoutes.url_for("зп/конверт/сохранить"), row/*, {"timeout": $c.cancelerHttp.promise}*/) 
      .then(function(resp){
        row._save = undefined;
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-4 red lighten-3 fw500 border animated zoomInUp');
        Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
        row.id = resp.data.id || resp.data.success.id;
        
        $c.data.map(function(r){
          if (!r.id /*&& !r['кошелек'].id*/) r['кошелек'] = undefined;
          if (!r.id && !r['дата1']) r['дата1'] = !1;
        });
        $timeout(function(){
          $c.data.map(function(r, index){
            if (!r.id && !r['кошелек']) r['кошелек'] = {"id": row['кошелек'].id};
            if (!r.id && !r['дата1']) {
              r['дата1'] = row['дата1'];
              $timeout(function(){
                $('#row'+index+' input[name="дата1"].datepicker').pickadate({// все настройки в файле русификации ru_RU.js
                  onSet: $c.SetDate,
                  //~ format: 'mmmm yyyy',
                  //~ selectYears: true,
                });
              });
            }
          });
        });

      });
    
  };

};


/*=============================================================*/

module

.component('zpPackForm', {
  controllerAs: '$c',
  templateUrl: "zp/pack-form",
  //~ scope: {},
  bindings: {
    data: '<',
    param: '<',

  },
  controller: C
})

;

}());