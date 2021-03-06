(function () {'use strict';
/*
*/

var moduleName = "Форма раздачи конвертов ЗП";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'WalletItem',  /* 'Объект или адрес',*/]);//'ngSanitize',, 'dndLists'

var C = function  ($scope, $http, $timeout, $element, $q, appRoutes, Util, $WalletData) {
  var $c = this;
  $scope.Util = Util;
  $scope.parseFloat = parseFloat;
  //~ $scope.dateFns = dateFns;

  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    if (!$c.param['месяц']) $c.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    
    $timeout(function(){
      $('input[name="месяц"]', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        onSet: $c.SetMonth,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: 'OK',// кнопка
        selectYears: true,
      });
      $('.modal', $($element[0])).modal({"dismissible": false,});
    });
    
    $WalletData.Load();
    
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
        
        $c.Total();
        
      });
      
      
    
  };
  
  $c.InitTable = function(){///фильтровать тут
    
    //~ $c.PickerDate();
    
    
    return $c.data;
    
  };
  
  $c.PickerDate = function(elem, row){
    //~ elem = elem || $('.datepicker', $($element[0]));
    //~ return 
    if ($(elem).data('pickadate')) return;
    $(elem).data('value', row['дата1']);
    
    $timeout(function(){
      $(elem).pickadate({ onSet: $c.SetDate });
      
    });
    
  };
  
  $c.OrderByData = function(row){
    return row.names.join(' ');
    
  };
  
  $c.DateFormat = function(date){
    if (!date) return;
    return dateFns.format(date ? new Date(date) : new Date(), 'ytt dd, D MMMM YYYY', {locale: dateFns.locale_ru});
    
  }
  
  $c.InitRow = function(row, index){
    row['кошелек'] = {"id": row['кошелек/id']};
    row['начислено'] = parseFloat(Util.numeric(row['начислено'])).toLocaleString('ru-RU');
    row['доп'] = Math.abs(parseFloat(Util.numeric(row['доп'] || 0))).toLocaleString('ru-RU');
    row['расчет ЗП округл_'] = parseFloat(Util.numeric(row['расчет ЗП округл']));
    row['расчет ЗП округл'] = row['расчет ЗП округл_'].toLocaleString('ru-RU');
    
    if (row['@движение денег']) row['@движение денег'].map(function(m, idx){ $c.InitMoney(row, m, idx); });
    row.dateFormat = $c.DateFormat(row['дата1']);
    
   


  };
  
  $c.InitMoney = function(row, m, index){
    m.dateFormat = $c.DateFormat(m['дата']);
    m.names = row.names;
    var s = Math.abs(parseFloat(Util.numeric(m['сумма'])));
    m['сумма'] = s.toLocaleString('ru-RU');
    if (!row.id && m['запись зп через месяц'] &&  (Math.round(s/50)*50 == row['расчет ЗП округл_'])) {
      row.id=m.id;
      row['крыжик сохранено'] = !!row.id;
      row['дата1']=m['дата'];
      row['расчет ЗП округл_'] = s;
      row['расчет ЗП округл'] = row['расчет ЗП округл_'].toLocaleString('ru-RU');
      row['кошелек'] = {"id": m['кошелек/id']};
      row['примечание'] = m['примечание'];
      m['скрыть'] = !0;
      
    }
    
    
  };
  
  $c.SetDate = function(context){
    //~ console.log("SetDate", this);
    var s = this.component.item.select;
    if (!s) return;
    var pid = this.component.$node.data('pid');
    var row = $c.$data[pid];
    var set = [s.year, s.month+1, s.date].join('-');
    var prev = row['дата1'];
    row['дата1'] = set;
    row.dateFormat = $c.DateFormat(set);
    
    if ( prev != set && row.id ) $timeout(function(){
        //~ row['крыжик сохранено'] = !1;
      $c.OpenConfirmSave(row);
    });
      

    
  };
  
  $c.Valid = function(row){
    return !!(row['расчет ЗП округл'] && row['дата1']
      && row['кошелек'] && row['кошелек'].id);
    
    
  };
  
  $c.SelectWallet = function(item, row){
    //~ console.log('SelectWallet', arguments);
    if (row.id && item && item.id) $timeout(function(){
      //~ row['крыжик сохранено'] = !1;
      $c.OpenConfirmSave(row);
    });
    
  };
  
  $c.Save = function(row){
    if (!row.remove && !$c.Valid(row)) return;
    var save = {};
    if (row.remove) save.remove = row.remove;
    else ['id', 'pid', 'дата1', 'кошелек', 'расчет ЗП округл', 'примечание'].map(function(key){ save[key] = row[key]; })
    row._save = !0;
    //~ $c._saving = !0;
    return $http.post(appRoutes.url_for("зп/конверт/сохранить"), save/*, {"timeout": $c.cancelerHttp.promise}*/) 
      .then(function(resp){
        row._save = undefined;
        
        if (resp.data.error) {
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-4 red lighten-3 fw500 border animated zoomInUp');
          $c._saving = undefined;
        }
        else if (resp.data.remove) {
          Materialize.toast('Удалена запись движения ДС', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          row.id=undefined;
          row.remove = undefined;
          //~ $c._saving = undefined;
          //~ var idx = $c.data.indexOf(row);
          
        }
        else if (resp.data.success) {
          Materialize.toast('Сохранена запись движения ДС', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          row.id = resp.data.id || resp.data.success.id;
          
          $c.data.map(function(r, index){
            if (!r.id /*&& !r['кошелек'].id*/) r['кошелек'] = undefined;
          });///map
          
          $timeout(function(){
            $c.data.map(function(r, index){
              if (!r.id /*&& !r['кошелек']*/) {
                r['кошелек'] = {"id": row['кошелек'].id};
                
                var elem = $('#row'+r.pid+' .datepicker').first();
                if (!elem.data('pickadate')) {
                //~ if (!r['дата1']) {
                  r['дата1'] = row['дата1'];
                  r.dateFormat = $c.DateFormat(row['дата1']);
                  elem.val(r.dateFormat);
                  
                }
                
              }
              
            });
          });
        }
        if (row['@движение денег']) $c.Total();///если основная строка

      });
    
  };
  
  $c.ChangeChbSave = function(row){
    //~ console.log('ChangeChbSave', row['крыжик сохранено'], row);
    
    if (!row['крыжик сохранено'] && row.id) {
      $c.OpenConfirmRemove(row);
    }
    else {
      $c.OpenConfirmSave(row);
    }
    //~ $c.Save(row);
    
  };
  
  $c.ChangeComment = function(row){
    if (!row.id) return;
    if ($.changeComment) $timeout.cancel($.changeComment);
    $.changeComment = $timeout(function(){ $c.OpenConfirmSave(row); }, 500);
  };

  $c.OpenConfirmRemove = function(row){
    $c.removeMoney = row;
    $('#delete-confirm').modal('open');
    
  };
  
  $c.OpenConfirmSave = function(row){
    $c.saveMoney = row;
    $('#save-confirm').modal('open');
    
  };
  
  $c.ConfirmRemove = function(m){
    m.remove=m.id;
    var row = $c.$data[m.pid];
    $c.Save(m).then(function(){
      if (row && m !== row) row['@движение денег'].splice(row['@движение денег'].indexOf(m), 1);
      
    });
  };
  
  $c.ConfirmSave = function(row){
    $c.Save(row).then(function(){
      //~ if (row.hasOwnProperty('крыжик сохранено')) row['крыжик сохранено'] = !row['крыжик сохранено'];
      
    });
  };
  
  $c.ConfirmCancel = function(row){
    if (row.hasOwnProperty('крыжик сохранено')) row['крыжик сохранено'] = !row['крыжик сохранено'];
    if (row.remove) row.remove = undefined;
  };
  

  
  $c.Total  = function(){
    $c['сумма всех расчетов']=0;
    $c['сумма всех расчетов/позиций']=0;
    $c['сумма расчетов в ДС']=0;
    $c['сумма расчетов в ДС/позиций']=0;
    
    $timeout(function(){
      $c.data.map(function(row){
        $c['сумма всех расчетов'] += row['расчет ЗП округл_'];
        $c['сумма всех расчетов/позиций'] +=  1;
        if (row.id) {
          $c['сумма расчетов в ДС'] += row['расчет ЗП округл_'];
          $c['сумма расчетов в ДС/позиций'] += 1;
        }
        
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