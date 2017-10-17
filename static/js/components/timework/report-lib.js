(function () {'use strict';
/*
  
*/
var moduleName = "TimeWorkReportLib";


var module = angular.module(moduleName, ['Util']);

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
        if (!row[name]) return 0;
        if (angular.isArray(row[name])) row[name].map(function(val, idx){
          if(!val) return 0;
          if (ifField !== undefined && !row[ifField][idx]) return;
          sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        });
        else if (ifField !== undefined && !row[ifField]) sum += 0;
        else sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')
        if (name == 'Сумма' && !!row['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row['Суточные/сумма'])) || 0;
      });
    }
    return sum;//.toLocaleString('ru-RU');
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
      if (item) $ctrl.showDetail['РасчетЗП'] = item['коммент'];
      var showDetail = $ctrl.showDetail;// передернуть-обновить
      showDetail['параметры расчетов']["сумма"] = item ? -item['коммент'] : undefined;
      $ctrl.showDetail = {};
      $timeout(function(){
        $ctrl.showDetail = showDetail;
      });
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
