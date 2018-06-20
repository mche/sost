(function () {'use strict';
/*
  USAGE:
  new TimeWorkReportLib($ctrl, $scope, $element);
  без присвоения нового объекта
*/
var moduleName = "TimeWorkReportLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'appRoutes', 'ObjectMy', 'Util']);

var Lib = function($timeout, $http, /*$compile,*/ appRoutes, ObjectMyData, Util) {// factory
  
return function /*конструктор*/($ctrl, $scope, $element){
  
  
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
  
  $ctrl.LoadObjects = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
    return ObjectMyData["все объекты без доступа"]({'все объекты': true})
      .then(function(resp){
        $ctrl.data['объекты'] = resp.data;
        $ctrl.data['_объекты'] = $ctrl.data['объекты'].reduce(function(result, item, index, array) {  result[item.id] = item;  return result; }, {});
        //~ $ctrl.param['объект']
        //~ var all = {"name": 'Все объекты/подразделения',"id": null};
        //~ $ctrl.data['объекты'].unshift(all);//$ctrl.param['объект']
        //~ $ctrl.data['объекты'].push({"name": 'Сданные объекты', "id":0, "_class":'grey-text'});
        //~ if (resp.data && resp.data.length == 1) $ctrl.SelectObj( resp.data[0]);
      });
  };
  
  $ctrl.LoadBrigs = function(){// бригады
    return $http.get(appRoutes.url_for('табель рабочего времени/бригады'))
      .then(function(resp){
        $ctrl.data['бригады'] = resp.data;
        var all = {"name": 'Все бригады',"id": 0, "_class":"bold ",};
        $ctrl.data['бригады'].unshift(all);//$ctrl.param['бригада']
        $ctrl.data['_бригады'] = $ctrl.data['бригады'].reduce(function(result, item, index, array) {  result[item.id] = item; item._class=(item._class || '')+' blue-grey-text'; return result; }, {});
      });
  };

  $ctrl.SelectObj = function(obj){
    $ctrl.param['объект'] = undefined;
    $ctrl.param['бригада'] = undefined;
    $timeout(function(){
      $ctrl.param['объект'] = obj;
      $ctrl.LoadData();//.then(function(){});
    });
    
  };
  
  $ctrl.SelectBrig = function(obj){
    $ctrl.param['бригада'] = undefined;
    $ctrl.param['объект'] = undefined;
    $timeout(function(){
      $ctrl.param['бригада'] = obj;
      //~ $ctrl.LoadData();//.then(function(){});
    });
    
  };
  
  $ctrl.ToggleSelectObj = function(event, hide){// бригады тоже
    var select =  $('.select-dropdown', $(event.target).parent());
    if (!hide) {
      select.show();
      return;
    }
    $timeout(function(){
      select.hide();
    }, 300);
  };
  
  $ctrl.DataObjsOrBrigs = function() {// выдать список объектов или бригад
    if ($ctrl.param['общий список'] || $ctrl.param['объект']) return $ctrl.data['объекты'];
    //~ if () return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    if ($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return $ctrl.data['бригады'];
    
    return [];
    //~ if ($ctrl.param['объект']) return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    
  };
  
  $ctrl.FilterObj = function(obj, index){// 
    if($ctrl.param['общий список']) return index === 0;
    if($ctrl.param['общий список бригад']) return index === 0;
    if(!obj.id) return false;
    
    if ($ctrl.param['объект']) {
      if($ctrl.data['объекты'].indexOf($ctrl.param['объект']) ===0 && obj.id) return true;
      return $ctrl.param['объект'] === obj;//true;
    }
    if ($ctrl.param['бригада']) {
      if($ctrl.data['бригады'].indexOf($ctrl.param['бригада']) ===0 && obj.id) return true;
      return $ctrl.param['бригада'] === obj;//true;
      
    }
    
  };
  $ctrl.OrderByObj = function(obj) {
    return obj.name || obj.title;
    
  };
  
  /**счетчики*/
  $ctrl.CountObj = function(){
    return $ctrl.data['данные'] && $ctrl.data['данные'].filter($ctrl.FilterObjects);
  };
  $ctrl.CountBrig = function(){
    return $ctrl.data['данные'] && $ctrl.data['данные'].filter($ctrl.FilterBrigs);
  };
  $ctrl.CountFilter = function(filter, yes){
    var ob = $ctrl.CountObj();
    var br = $ctrl.CountBrig();
    var calc_yes = ob.filter(filter).length+br.filter(filter).length;
    if (yes) return calc_yes;
    return ob.length + br.length - calc_yes;
  };
  
  
  ///***куча фильтров***///
  $ctrl.FilterObjects = function(row, idx, obj){// 
    var id = (obj && obj.id) || $ctrl.param['объект'] && $ctrl.param['объект'].id;
    //~ if(!$ctrl.param['общий список'] && !id) return false;
    return (row['объекты/id'] || row['объекты'] || []).some(function(oid){ return $ctrl.param['общий список'] || oid == id; });
  };
  $ctrl.FilterBrigs = function(row, idx, obj){// бригады
    var id = (obj && obj.id) || $ctrl.param['бригада'] && $ctrl.param['бригада'].id;
    //~ if(!$ctrl.param['общий список бригад'] && !id) return false;
    var profile = $ctrl.RowProfile(row);
    //~ return (profile["бригады/id"] || []).some(function(_id){ return _id == id; });
    return !!profile && (profile["бригады/id"] || []).some(function(_id){ return $ctrl.param['общий список бригад'] /*|| ($ctrl.param['бригада'].id === 0 && obj && obj.id == id)*/ || _id == id;});
  };
  
  $ctrl.FilterTrue = function(row){ return true;};
  $ctrl.FilterCalcZP = function(row, idx){  return !!row['РасчетЗП']; };
  $ctrl.FilterProfile = function(row, idx){// фильтр по фрагменту профиля
    var profile = $ctrl.RowProfile(row);
    if (!profile) return false;
    var re = new RegExp($ctrl.param['фильтры']['профили'],"i");
    return re.test(profile.names.join(' '));
  };
  $ctrl.FilterOfis = function(row, idx){// фильтовать объекты Офис
    var re = /офис/i;
   return !!$ctrl.data['_объекты'] && row["объекты"].some(function(id){ return $ctrl.data['_объекты'][id] && re.test($ctrl.data['_объекты'][id].name); });
  };
  
  $ctrl.FilterProfiles = function(p){ return p.id == this["профиль"];};// фильтр по объекту профиля
  $ctrl.RowProfile = function(row){// к строке данных полноценный профиль
    if (row._profile) return row._profile;
    if (!$ctrl.allProfiles) return undefined;
    var profile = $ctrl.allProfiles.filter($ctrl.FilterProfiles, row).pop();
    if (!profile) profile = ['не найден?'];
    row._profile =  profile;
    
    return profile;
  };
  $ctrl.OrderByData = function(row){
    var profile = $ctrl.RowProfile(row);
    if(!profile) return '';
    return profile.names.join();
  };
  
  $ctrl.InitTable = function(){
    //~ Util.ScrollTable($('table.scrollable'), $element[0]);
    
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
  
  $ctrl.DataSumTotal = function(name, row_or_obj/*, ifField*/) {// общая сумма по объектам / без row_or_obj считает по всем строкам // ifField - если это поле как истина
    var sum = 0;
    if (row_or_obj && row_or_obj[name]) {// по профилю-строке
      //~ console.log("DataValueTotal row", row_or_obj, name, ifField);
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val, idx){
        //~ if(!val || (name == 'Сумма' /*&& row_or_obj['РасчетЗП']*/ && !row_or_obj['Начислено'][idx])) return;
        //~ if (ifField === undefined || !!row_or_obj[ifField][idx]) 
        if(val && !!row_or_obj['Начислено'][idx]) sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        if (row_or_obj['Доп. часы замстрой/начислено'] && row_or_obj['Доп. часы замстрой/начислено'][idx]) sum += parseFloat(Util.numeric(row_or_obj['Доп. часы замстрой/сумма'][idx] || 0));
      });
      //~ else if (ifField !== undefined && !row_or_obj[ifField]) sum += 0;
      else if (name != 'Сумма' || !!row_or_obj['Начислено']) sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма' /*&& !!row_or_obj['Суточные/сумма']*/) {
        if (row_or_obj['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Суточные/сумма'] || 0));
        if (row_or_obj['Отпускные/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Отпускные/сумма'] || 0));
        if (row_or_obj['Переработка/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Переработка/сумма'] || 0));
      }
    } else {// по объекту
      $ctrl.data['данные'].filter($ctrl.FilterData, row_or_obj)/*/.filter(function(row){  return row["всего часов"][0] === 0 ? false : true; *.отсечь двойников })*/.map(function(row){
        if (!row[name]) return;
        else if (angular.isArray(row[name])) row[name].map(function(val, idx){
          //~ if(!val || (name == 'Сумма' /*&& row['РасчетЗП']*/ && !row['Начислено'][idx])) return;
          //~ else if (ifField !== undefined && !row[ifField][idx]) return;
          if (row_or_obj && !($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] || row['объекты'][idx] == row_or_obj.id)) return;
          else if (val && !!row['Начислено'][idx]) sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
          else if (row['Доп. часы замстрой/начислено'] && row['Доп. часы замстрой/начислено'][idx]) sum += parseFloat(Util.numeric(row['Доп. часы замстрой/сумма'][idx] || 0));
        });
        //~ else if (ifField !== undefined && !row[ifField]) sum += 0;
        else if (row_or_obj &&  !($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'] ||  row['объекты'].some(function(oid){ return oid == row_or_obj.id; })) ) sum += 0;
        else if (name != 'Сумма' || !!row['Начислено']) sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')

        if (name == 'Сумма' /*&& !!row['Суточные/сумма']*/) {
          if (row['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
          if (row['Отпускные/начислено']) sum +=  parseFloat(Util.numeric(row['Отпускные/сумма'] || 0));
          if (row['Переработка/начислено']) sum +=  parseFloat(Util.numeric(row['Переработка/сумма'] || 0));
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
  
  $ctrl.FilterDopWork = function(obj, index){
    var row = this;
    return !!row['Доп. часы замстрой'][index];
    
  };
  
};

//~ return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
