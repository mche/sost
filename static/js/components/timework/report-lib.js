(function () {'use strict';
/*
  USAGE:
  new TimeWorkReportLib($ctrl, $scope, $timeout, $element, $http, $compile, appRoutes);
  без присвоения
*/
var moduleName = "TimeWorkReportLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util']);

var Lib = function(Util) {// factory
  
return function /*конструктор*/($ctrl, $scope, $timeout, $element, $http, $compile, appRoutes){
  
  $ctrl.InitMonth = function(){
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        //~ onClose: $ctrl.SetDate,
        onSet: $ctrl.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: true,// кнопка
        selectYears: true,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
  };
  
  $ctrl.SetDate = function (context) {
    var d = $(this._hidden).val();
    if($ctrl.param['месяц'] == d) return;
    $ctrl.param['месяц'] = d;
    $ctrl.days = undefined;
    
    $timeout(function(){
      if($ctrl.InitDays) $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  $ctrl.LoadProfiles = function(){
    
    return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//,'табель рабочего времени/профили'  data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data) $ctrl.allProfiles = resp.data;
      });

  };
  
  $ctrl.FilterTrue = function(row){ return true;};
  $ctrl.FilterCalcZP = function(row, idx){  return !!row['РасчетЗП']; };
  $ctrl.FilterProfile = function(row, idx){// фильтр по фрагменьу профиля
    var profile = $ctrl.RowProfile(row);
    var re = new RegExp($ctrl.filterProfile,"i");
    return re.test(profile.names.join(' '));
  };
  
  $ctrl.FilterProfiles = function(p){ return p.id == this["профиль"];};// фильтр по объекту профиля
  $ctrl.RowProfile = function(row){// к строке данных полноценный профиль
    if (row._profile) return row._profile;
    var profile = $ctrl.allProfiles.filter($ctrl.FilterProfiles, row).pop();
    if (!profile) profile = ['не найден?'];
    row._profile =  profile;
    
    return profile;
  };
  $ctrl.OrderByData = function(row){
    var profile = $ctrl.RowProfile(row);
    return profile.names.join();
  };
  
  $ctrl.InitRowOverTime = function(row){// переработка
    row['всего/переработка/часов'] = row['всего/переработка/смен'] = 0;
    row['объекты'].map(function(oid, idx){ row['всего/переработка/часов'] += parseFloat(row['переработка/часов'][idx] || 0); row['всего/переработка/смен'] += parseFloat(row['переработка/смен'][idx] || 0);});
    if (row['Переработка/начислено']) {
      row['Переработка/сумма'] = parseFloat(Util.numeric(row['Переработка/начислено'])).toLocaleString('ru-RU');
      row['Переработка/начислено'] = true;
    }
  };
  
  $ctrl.SumOverTime = function(row){
    var sum = 0;// = parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
    if (row['Переработка/ставка'])  sum += parseFloat(Util.numeric(row['Переработка/ставка'] || 0)) * parseFloat(Util.numeric(row['всего/переработка/часов']));
    row['Переработка/сумма'] = sum.toLocaleString('ru-RU');
    
  };
  $ctrl.SumSut = function(row) {//  сумма суточных
    var sum = 0;// = parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
    if (row['Суточные/ставка']) {//
      if(angular.isArray(row['Суточные/ставка'])) row['Суточные/ставка'].map(function(it, idx){ if(it) sum +=  parseFloat(Util.numeric(it)) * parseFloat(Util.numeric(row['всего смен'][idx]));  });
      else if (row['Суточные/ставка'])  sum += parseFloat(Util.numeric(row['Суточные/ставка'])) * parseFloat(Util.numeric(row['всего смен']));
    }
    row['Суточные/сумма'] = sum.toLocaleString('ru-RU');
  };
  
  $ctrl.SumOtp= function(row) {//  сумма отпускных
    //~ var sum = parseFloat(Util.numeric(row['Отпускные/сумма'] || 0));
    var sum = 0;
    if (row['Отпускные/ставка'] && row['отпускных дней']) sum += parseFloat(Util.numeric(row['Отпускные/ставка'])) * parseFloat(Util.numeric(row['отпускных дней']));
    row['Отпускные/сумма'] = sum.toLocaleString('ru-RU');
  };
  
  $ctrl.DataSumTotal = function(name, row_or_obj, ifField) {// общая сумма по объектам / без row_or_obj считает по всем строкам // ifField - если это поле как истина
    var sum = 0;
    if (row_or_obj && row_or_obj[name]) {// по профилю-строке
      //~ console.log("DataValueTotal row", row_or_obj, name, ifField);
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val, idx){
        if(!val || (name == 'Сумма' && row_or_obj['РасчетЗП'] && !row_or_obj['Начислено'][idx])) return 0;
        if (ifField !== undefined && !row_or_obj[ifField][idx]) return;
        sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
      });
      else if (ifField !== undefined && !row_or_obj[ifField]) sum += 0;
      else sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма' /*&& !!row_or_obj['Суточные/сумма']*/) {
        sum +=  parseFloat(Util.numeric(row_or_obj['Суточные/сумма'] || 0));
        sum +=  parseFloat(Util.numeric(row_or_obj['Отпускные/сумма'] || 0));
        sum +=  parseFloat(Util.numeric(row_or_obj['Переработка/сумма'] || 0));
      }
    } else {// по объекту
      $ctrl.data['данные'].filter($ctrl.FilterData)/*/.filter(function(row){  return row["всего часов"][0] === 0 ? false : true; *.отсечь двойников })*/.map(function(row){
        if (!row[name]) return;
        else if (angular.isArray(row[name])) row[name].map(function(val, idx){
          if(!val || (name == 'Сумма' && row['РасчетЗП'] && !row['Начислено'][idx])) return;
          else if (ifField !== undefined && !row[ifField][idx]) return;
          else if (row_or_obj && !($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] || row['объекты'][idx] == row_or_obj.id)) return;
          else sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        });
        else if (ifField !== undefined && !row[ifField]) sum += 0;
        else if (row_or_obj &&  !($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] ||  row['объекты'].some(function(oid){ return oid == row_or_obj.id; })) ) sum += 0;
        else sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')

        if (name == 'Сумма' /*&& !!row['Суточные/сумма']*/) {
          sum +=  parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
          sum +=  parseFloat(Util.numeric(row['Отпускные/сумма'] || 0));
          sum +=  parseFloat(Util.numeric(row['Переработка/сумма'] || 0));
        }
      });
    }
    return sum;//.toLocaleString('ru-RU');
  };
  
  $ctrl.ParamDetail = function(row){// параметры для компонента waltex/money/table+form
    return {"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "профили": [row._profile], "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}, "сумма": -row["РасчетЗП"], };
    
  };

  $ctrl.ShowDetailOnSaveMoney = function(data){
    //~ console.log("ShowDetailOnSaveMoney", data);
    /*$scope.add_money = undefined;
    $timeout(function(){
      $scope.add_money = true;
    });*/
    // обновить
    $ctrl['Закрытие расчета']();
  };
  /**Расчетный лист**/
  $ctrl['Закрытие расчета'] = function(item){
    //~ console.log("Закрытие расчета", item);
    if($ctrl.showDetail) {
      var row = $ctrl.showDetail;
      if (item) {
        if(row._profile.id == item['профиль']) row['РасчетЗП'] = item['коммент'];
        if(row._row2 && row._row2._profile.id == item['профиль']) row._row2['РасчетЗП'] = item['коммент'];
        
      }
      
      $ctrl.ShowDetail().then(function(){
        if(row['РасчетЗП']) row['параметры расчетов']["сумма"] = -parseFloat(Util.numeric(row['РасчетЗП']));//item ? -item['коммент'] : undefined;
        if(row._row2 && row._row2['РасчетЗП']) row['параметры расчетов2']["сумма"] = -parseFloat(Util.numeric(row._row2['РасчетЗП']));
        
      });
      //~ var showDetail = $ctrl.showDetail;
      //~ showDetail['параметры расчетов']["сумма"] = item ? -item['коммент'] : undefined;
      //~ row['параметры расчетов'] = undefined;// передернуть-обновить
      
      //~ return $timeout(function(){
        //~ row['параметры расчетов'] = $ctrl.ParamDetail(row);//showDetail;
        //~ if(row['РасчетЗП']) row['параметры расчетов']["сумма"] = -parseFloat(Util.numeric(row['РасчетЗП']));//item ? -item['коммент'] : undefined;
      //~ });
    }
    else $('#modal-detail').modal('close');
  };
  $ctrl.ToggleCalcZP = function(row){// показать расчетный лист
    var tr = $('#row'+row._index);
    //~ console.log("ToggleCalcZP", tr.children().length);
    tr.after($('<tr>').append($('<td>').attr({"colspan": tr.children().length})));// тупо пустая строка чтобы не сбивалась полосатость сток
    tr.after($('<tr>').append($('<td>').attr({"colspan": tr.children().length}).append($compile('<timework-calc data-param="row">')($scope))));
    
  };
  
};

//~ return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
