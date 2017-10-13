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
  
  $ctrl.DataValueTotal = function(name, row_or_obj, nach) {// общая сумма по объектам / без row считает по всем строкам // nach - bool только начисления
    var sum = 0;
    if (row_or_obj && row_or_obj[name]) {
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val){
        if(!val) return 0;
        //~ if (!!nach && !row_or_obj['Начислено']) return;
        sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
      });
      //~ else if (!!nach && !row_or_obj['Начислено']) sum += 0;
      else sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма' /*&& !!nach && !!row_or_obj['Суточные/начислено']*/) sum +=  parseFloat(Util.numeric(row_or_obj['Суточные/сумма'])) || 0;
    } else {// по объекту
      $ctrl.data['данные'].filter($ctrl.dataFilter(row_or_obj)).map(function(row){
        if (!row[name]) return 0;
        if (angular.isArray(row[name])) row[name].map(function(val){
          if(!val) return 0;
          //~ if (!!nach && !row['Начислено']) return;
          sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        });
        //~ else if (!!nach && !row['Начислено']) sum += 0;
        else sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')
        if (name == 'Сумма' /*&& !!nach && !!row['Суточные/начислено']*/) sum +=  parseFloat(Util.numeric(row['Суточные/сумма'])) || 0;
      });
    }
    return sum;//.toLocaleString('ru-RU');
  };
  
  /*************Детально по профилю*************/
  $ctrl.ShowDetail = function(row){// показать по сотруднику модально детализацию
    $ctrl.showDetail = row;
    
    //~ if (!row['детально']) row['детально']=[];
    //~ row['детально'].length = 0;
    row['детально'] = undefined;
    $http.post(appRoutes.url_for('табель рабочего времени/отчет/детально'), {"профиль": row["профиль"], "месяц": row["месяц"],}).then(function(resp){
      //~ Array.prototype.push.apply(row['детально'], resp.data);
      row['детально'] = resp.data;
    });
    
    row['параметры расчетов'] = undefined;
    $timeout(function(){
      row['параметры расчетов'] = {"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}}; // параметры для компонента waltex/money/table+form
      //~ row['данные формы ДС'] = {'профиль/id': row["профиль"], 'категория/id': 569};
    });
    
    //~ row['баланс'] = undefined;
    //~ $http.post(appRoutes.url_for('движение ДС/баланс по профилю'), {"профиль": row["профиль"],})//"месяц": row["месяц"],
      //~ .then(function(resp){
      //~ row['баланс']  = resp.data;
    //~ });
    
  };
  $ctrl.ShowDetailOnSaveMoney = function(data){
    //~ console.log("ShowDetailOnSaveMoney", data);
    $scope.add_money = false;
  };
  /**Расчетный лист**/
  $ctrl['Закрытие расчета'] = function(item){
    console.log("Закрытие расчета", item);
    if($ctrl.showDetail) {
      $ctrl.showDetail['РасчетЗП'] = item['коммент'];
      var showDetail = $ctrl.showDetail;// передернуть-обновить
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
