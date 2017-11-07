(function () {'use strict';
/*
  
*/
var moduleName = "TimeWorkReportLib";


var module = angular.module(moduleName, ['Util', 'SVGCache']);

var Lib = function(Util) {
  
function Constr($ctrl, $scope, $timeout, $element, $http, $compile, appRoutes){
  
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
  $ctrl.FilterProfiles = function(p){ return p.id == this["профиль"];};
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
  
  $ctrl.DataValueTotal = function(name, row_or_obj, ifField) {// общая сумма по объектам / без row_or_obj считает по всем строкам // ifField - если это поле как истина
    var sum = 0;
    if (row_or_obj && row_or_obj[name]) {
      //~ console.log("DataValueTotal row", row_or_obj, name, ifField);
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val, idx){
        if(!val) return 0;
        if (ifField !== undefined && !row_or_obj[ifField][idx]) return;
        sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
      });
      else if (ifField !== undefined && !row_or_obj[ifField]) sum += 0;
      else sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма' && !!row_or_obj['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Суточные/сумма'])) || 0;
    } else {// по объекту
      $ctrl.data['данные'].filter($ctrl.dataFilter(row_or_obj)).map(function(row){
        if (!row[name]) return;
        else if (angular.isArray(row[name])) row[name].map(function(val, idx){
          if(!val) return;
          else if (ifField !== undefined && !row[ifField][idx]) return;
          else if (!($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] || row['объекты'][idx] == row_or_obj.id)) return;
          else sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        });
        else if (ifField !== undefined && !row[ifField]) sum += 0;
        else if (!($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] ||  row['объекты'].some(function(oid){ return oid == row_or_obj.id; })) ) sum += 0;
        else sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')

        if (name == 'Сумма' && !!row['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row['Суточные/сумма'])) || 0;
      });
    }
    return sum;//.toLocaleString('ru-RU');
  };
  
  $ctrl.ParamDetail = function(row){// параметры для компонента waltex/money/table+form
    return {"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}, "сумма": -row["РасчетЗП"], };
    
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
  
}

return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
