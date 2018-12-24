(function () {'use strict';
/*
  USAGE:
  new TimeWorkReportLib($c, $scope, $element);
  без присвоения нового объекта
*/
var moduleName = "TimeWorkReportLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'appRoutes', 'Объекты', 'Util']);

var Lib = function($timeout, $http, $window, /*$compile,*/ appRoutes, $Объекты, Util) {// factory
  
return function /*конструктор*/($c, $scope, $element){
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $c.InitMonth = function(){
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        //~ onClose: $c.SetDate,
        onSet: $c.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: true,// кнопка
        selectYears: true,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
  };
  
  $c.SetDate = function (context) {
    var d = $(this._hidden).val();
    if($c.param['месяц'] == d) return;
    $c.param['месяц'] = d;
    $c.days = undefined;
    
    $timeout(function(){
      if($c.InitDays) $c.InitDays();
      $c.LoadData();
    });
  };
  
  $c.LoadProfiles = function(){
    
    return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//,'табель рабочего времени/профили'  data, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data) $c.allProfiles = resp.data;
      });

  };
  
  $c.LoadObjects = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
    return $Объекты["все объекты без доступа"]({'все объекты': true})
      .then(function(resp){
        $c.data['объекты'] = resp.data;
        $c.data.$объекты = $c.data['объекты'].reduce(function(result, item, index, array) {  result[item.id] = item;  return result; }, {});
        //~ $c.param['объект']
        //~ var all = {"name": 'Все объекты/подразделения',"id": null};
        //~ $c.data['объекты'].unshift(all);//$c.param['объект']
        //~ $c.data['объекты'].push({"name": 'Сданные объекты', "id":0, "_class":'grey-text'});
        //~ if (resp.data && resp.data.length == 1) $c.SelectObj( resp.data[0]);
      });
  };
  
  $c.LoadBrigs = function(){// бригады
    return $http.get(appRoutes.url_for('табель рабочего времени/бригады'))
      .then(function(resp){
        $c.data['бригады'] = resp.data;
        var all = {"name": 'Все бригады',"id": 0, "_class":"bold ",};
        $c.data['бригады'].unshift(all);//$c.param['бригада']
        $c.data.$бригады = $c.data['бригады'].reduce(function(result, item, index, array) {  result[item.id] = item; item._class=(item._class || '')+' blue-grey-text'; return result; }, {});
      });
  };

  $c.SelectObj = function(obj){
    $c.param['объект'] = undefined;
    $c.param['бригада'] = undefined;
    $timeout(function(){
      $c.param['объект'] = obj;
      $c.LoadData();//.then(function(){});
    });
    
  };
  
  $c.SelectBrig = function(obj){
    $c.param['бригада'] = undefined;
    $c.param['объект'] = undefined;
    $timeout(function(){
      $c.param['бригада'] = obj;
      //~ $c.LoadData();//.then(function(){});
    });
    
  };
  
  $c.ToggleSelectObj = function(event, hide){// бригады тоже
    var select =  $('.select-dropdown', $(event.target).parent());
    if (!hide) {
      select.show();
      return;
    }
    $timeout(function(){
      select.hide();
    }, 300);
  };
  
  //~ var c1 = 0;
  $c.DataObjsOrBrigs = function() {// выдать список объектов или бригад
    //~ console.log("DataObjsOrBrigs", c1++);
    if ($c.param['общий список'] || $c.param['объект']) return $c.data['объекты'].filter($c.FilterObj);
    //~ if () return [$c.data['объекты'].indexOf($c.param['объект'])];
    if ($c.param['общий список бригад'] || $c.param['бригада']) return $c.data['бригады'].filter($c.FilterObj);
    
    return [];
    //~ if ($c.param['объект']) return [$c.data['объекты'].indexOf($c.param['объект'])];
    
  };
  
  //~ var cnt = 0;
  $c.FilterObj = function(obj, index){// 
    //~ console.log("FilterObj", cnt++);
    if($c.param['общий список']) return index === 0;
    if($c.param['общий список бригад']) return index === 0;
    if(!obj.id) return false;
    
    if ($c.param['объект']) {
      if($c.data['объекты'].indexOf($c.param['объект']) ===0 && obj.id) return true;
      return $c.param['объект'] === obj;//true;
    }
    if ($c.param['бригада']) {
      if($c.data['бригады'].indexOf($c.param['бригада']) ===0 && obj.id) return true;
      return $c.param['бригада'] === obj;//true;
      
    }
    
  };
  $c.OrderByObj = function(obj) {
    return obj.name || obj.title;
    
  };
  
  /**счетчики*/
  $c.CountObj = function(){
    return $c.data['данные'] && $c.data['данные'].filter($c.FilterObjects);
  };
  $c.CountBrig = function(){
    return $c.data['данные'] && $c.data['данные'].filter($c.FilterBrigs);
  };
  $c.CountFilter = function(filter, yes){
    var ob = $c.CountObj();
    var br = $c.CountBrig();
    var calc_yes = ob.filter(filter).length+br.filter(filter).length;
    if (yes) return calc_yes;
    return ob.length + br.length - calc_yes;
  };
  
  //~ var currRadio;
  $c.ChangeRadioFilter = function(event){
    $c.RefreshShow();
    
    if (event){
      if ($c.param['фильтры'][event.target.name] === undefined) return;
      if (event.target.value == $c.param['фильтры'][event.target.name].toString()) $c.param['фильтры'][event.target.name] = undefined;
    }
    
      //~ console.log('ChangeRadioFilter', event.target);///$(event.target).data('checked') event.target.checked.toString()
    
  };
  
/*  $c.RefreshTable = function(delay){
    if($c.refreshTable) $timeout.cancel($c.refreshTable);
    //~ else $('table', $element[0]).removeClass('zoomOutDown fast').addClass('zoomOutDown fast');
    $c.refreshTable = $timeout(function(){ delete $c.refreshTable; }, delay || 0);
    
  };*/
  
  $c.RefreshTableS = function(showRefresh){///можно обновлять с визуализацией (showRefresh) или скрыто(без showRefresh)!
    if(showRefresh) $timeout.cancel(showRefresh);
    //~ $c.refreshReady = !1;///для сумм
    return $timeout(function(){///общее глобальное обновление
      $c.DataObjsOrBrigs().map(function(obj){
        $c.InitTable(obj);
        
      });
      //~ $c.refreshReady = !0;///для сумм
    });
    
  };
  
  $c.RefreshShow = function(){///обновить с визуальн
    $c.refreshTable = $c.RefreshTableS($c.refreshTable).then(function() { $c.refreshTable = undefined; });
  };
  
  
  ///***куча фильтров***///
  $c.FilterObjects = function(row, idx, obj){// 
    var id = (obj && obj.id) || $c.param['объект'] && $c.param['объект'].id;
    //~ if(!$c.param['общий список'] && !id) return false;
    return (row['объекты/id'] || row['объекты'] || []).some(function(oid){ return $c.param['общий список'] || oid == id; });
  };
  $c.FilterBrigs = function(row, idx, obj){// бригады
    var id = (obj && obj.id) || $c.param['бригада'] && $c.param['бригада'].id;
    //~ if(!$c.param['общий список бригад'] && !id) return false;
    var profile = $c.RowProfile(row);
    //~ return (profile["бригады/id"] || []).some(function(_id){ return _id == id; });
    return !!profile && (profile["бригады/id"] || []).some(function(_id){ return $c.param['общий список бригад'] /*|| ($c.param['бригада'].id === 0 && obj && obj.id == id)*/ || _id == id;});
  };
  
  $c.FilterTrue = function(row){ return true;};
  $c.FilterCalcZP = function(row, idx){  return parseFloat(row['РасчетЗП/флажок']) >= 0; };
  $c.FilterProfile = function(row, idx){// фильтр по фрагменту профиля
    var profile = $c.RowProfile(row);
    if (!profile) return false;
    var re = new RegExp($c.param['фильтры']['профили'],"i");
    return re.test(profile.names.join(' '));
  };
  var re_ofis = /офис/i;
  $c.FilterOfis = function(row, idx){// фильтовать объекты Офис
   return !!$c.data.$объекты && row["объекты"].some(function(id){ return $c.data.$объекты[id] && re_ofis.test($c.data.$объекты[id].name); });
  };
  
  $c.FilterProfiles = function(p){ return p.id == this["профиль"];};// фильтр по объекту профиля
  $c.RowProfile = function(row){// к строке данных полноценный профиль
    if (row._profile) return row._profile;
    if (!$c.allProfiles) return undefined;
    var profile = $c.allProfiles.filter($c.FilterProfiles, row).pop();
    if (!profile) profile = ['не найден?'];
    row._profile =  profile;
    
    return profile;
  };
  $c.OrderByData = function(row){
    var profile = $c.RowProfile(row);
    if(!profile) return '';
    return profile.names.join();
  };
  
  $c.InitTable = function(obj){
    //~ Util.ScrollTable($('table.scrollable'), $element[0]);
    //~ console.log("InitTable", obj);
    //~ $scope.obj = obj;
    //~ $scope.data = 
    obj['данные'] = $c.data['данные'].filter($c.FilterData, obj);
    //~ return $c.data['данные'].filter($c.FilterData, obj);
    //~ return $scope.data;
    return obj['данные'];
  };
  
  $c.InitRowOverTime = function(row){// переработка
    row['всего/переработка/часов'] = row['всего/переработка/смен'] = 0;
    row['объекты'].map(function(oid, idx){ row['всего/переработка/часов'] += parseFloat(row['переработка/часов'][idx] || 0); row['всего/переработка/смен'] += parseFloat(row['переработка/смен'][idx] || 0);});
    if (row['Переработка/начислено']) {
      row['Переработка/сумма'] = parseFloat(Util.numeric(row['Переработка/начислено'])).toLocaleString('ru-RU');
      row['Переработка/начислено'] = true;
    }
  };
  
  $c.SumOverTime = function(row){
    var sum = 0;// = parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
    if (row['Переработка/ставка'])  sum += Math.round(parseFloat(Util.numeric(row['Переработка/ставка'] || 0)) * parseFloat(Util.numeric(row['всего/переработка/часов'])));
    row['Переработка/сумма'] = sum.toLocaleString('ru-RU');
    return sum;
  };
  $c.SumSut = function(row) {//  сумма суточных
    var sum = 0;// = parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
    if (row['Суточные/ставка']) {//
      if(angular.isArray(row['Суточные/ставка'])) row['Суточные/ставка'].map(function(it, idx){ if(it) sum += Math.round(parseFloat(Util.numeric(it)) * parseFloat(Util.numeric(/*row['всего смен'][idx]*/ row['Суточные'][idx])));  });
      else sum += Math.round(parseFloat(Util.numeric(row['Суточные/ставка'])) * parseFloat(Util.numeric(/*row['всего смен']*/ row['Суточные'])));
    }
    row['Суточные/сумма'] = sum.toLocaleString('ru-RU');
    return sum;
  };
  
  $c.SumOtp= function(row) {//  сумма отпускных
    //~ var sum = parseFloat(Util.numeric(row['Отпускные/сумма'] || 0));
    var sum = 0;
    if (row['Отпускные/ставка'] && row['отпускных дней']) sum += Math.round(parseFloat(Util.numeric(row['Отпускные/ставка'])) * parseFloat(Util.numeric(row['отпускных дней'])));
    row['Отпускные/сумма'] = sum.toLocaleString('ru-RU');
    return sum;
  };
  
  $c.DataSumTotal = function(name, row_or_obj/*, ifField*/) {// общая сумма по объектам / без row_or_obj считает по всем строкам // ifField - если это поле как истина
    var sum = 0;
    
    if (row_or_obj && row_or_obj[name]) {// по профилю-строке
      //~ console.log("DataValueTotal row", row_or_obj, name, ifField);
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val, idx){
        //~ if(!val || (name == 'Сумма' /*&& row_or_obj['РасчетЗП']*/ && !row_or_obj['Начислено'][idx])) return;
        //~ if (ifField === undefined || !!row_or_obj[ifField][idx]) 
        if(val && (!!row_or_obj['Начислено'][idx] || name=="всего часов" || name=="всего смен") ) sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        if (row_or_obj['Доп. часы замстрой/начислено'] && row_or_obj['Доп. часы замстрой/начислено'][idx]) sum += parseFloat(Util.numeric(row_or_obj['Доп. часы замстрой/сумма'][idx] || 0));
      });
      //~ else if (ifField !== undefined && !row_or_obj[ifField]) sum += 0;
      else if (name != 'Сумма' || !!row_or_obj['Начислено']) sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма' /*&& !!row_or_obj['Суточные/сумма']*/) {
        if (row_or_obj['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Суточные/сумма'] || 0));
        if (row_or_obj['Отпускные/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Отпускные/сумма'] || 0));
        if (row_or_obj['Переработка/начислено']) sum +=  parseFloat(Util.numeric(row_or_obj['Переработка/сумма'] || 0));
      }
    } else {// все профили
      (row_or_obj['данные'] || $c.data['данные'].filter($c.FilterData, row_or_obj))/*/.filter(function(row){  return row["всего часов"][0] === 0 ? false : true; *.отсечь двойников })*/.map(function(row){
        if (!row[name]) return;
        else if (angular.isArray(row[name])) row[name].map(function(val, idx){
          //~ if(!val || (name == 'Сумма' /*&& row['РасчетЗП']*/ && !row['Начислено'][idx])) return;
          //~ else if (ifField !== undefined && !row[ifField][idx]) return;
          if (row_or_obj && !($c.param['общий список'] || $c.param['бригада'] || $c.param['общий список бригад'] || row['объекты'][idx] == row_or_obj.id)) return;
          else if (val && (!!row['Начислено'][idx] || name=='Сумма' || name=="всего часов" || name=="всего смен")) sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
          if ( name=='Сумма' && row['Доп. часы замстрой/начислено'] && row['Доп. часы замстрой/начислено'][idx]) sum += parseFloat(Util.numeric(row['Доп. часы замстрой/сумма'][idx] || 0));
        });
        //~ else if (ifField !== undefined && !row[ifField]) sum += 0;
        else if (row_or_obj &&  !($c.param['общий список'] || $c.param['бригада'] || $c.param['общий список бригад'] ||  row['объекты'].some(function(oid){ return oid == row_or_obj.id; })) ) return;
        else if ( (name=='Сумма' || name=="всего часов" || name=="всего смен")) sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')
        else if (name == 'РасчетЗП' && parseFloat(row['РасчетЗП/флажок']) >= 0) sum += parseFloat(Util.numeric(row[name])) || 0;

        if (name == 'Сумма' /*&& !!row['Суточные/сумма']*/) {
          if (row['Суточные/начислено']) sum +=  parseFloat(Util.numeric(row['Суточные/сумма'] || 0));
          if (row['Отпускные/начислено']) sum +=  parseFloat(Util.numeric(row['Отпускные/сумма'] || 0));
          if (row['Переработка/начислено']) sum +=  parseFloat(Util.numeric(row['Переработка/сумма'] || 0));
        }
      });
    }
    return sum;//.toLocaleString('ru-RU');
  };
  
  $c.ParamDetail = function(row){// параметры для компонента waltex/money/table+form
    return {"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "профили": [row._profile], "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, "дата":{"values":[], "ready": false},}, "move":{"id": 3}, "сумма": -row["РасчетЗП"], "дата": Util.dateISO(0), };
    
  };

  $c.ShowDetailOnSaveMoney = function(data){
    //~ console.log("ShowDetailOnSaveMoney", data);
    /*$scope.add_money = undefined;
    $timeout(function(){
      $scope.add_money = true;
    });*/
    // обновить
    $c['Закрытие расчета']();
  };
  /**Расчетный лист**/
  $c['Закрытие расчета'] = function(item){
    //~ console.log("Закрытие расчета", item);
    if($c.showDetail) {
      var row = $c.showDetail;
      if (item) {
        if(row._profile.id == item['профиль']) row['РасчетЗП'] = row['РасчетЗП/флажок'] = item['коммент'];
        if(row._row2 && row._row2._profile.id == item['профиль']) row._row2['РасчетЗП'] = row._row2['РасчетЗП/флажок']  = item['коммент'];
        
      }
      
      $c.ShowDetail().then(function(){
        if(row['РасчетЗП']) row['параметры расчетов']["сумма"] = -parseFloat(Util.numeric(row['РасчетЗП']));//item ? -item['коммент'] : undefined;
        if(row._row2 && row._row2['РасчетЗП']) row['параметры расчетов2']["сумма"] = -parseFloat(Util.numeric(row._row2['РасчетЗП']));
        
      });
      
      //~ if ($c.param['фильтры']['расчет ЗП'] !== undefined) 
      $c.RefreshTableS();/// скрыто обновить
      //~ var showDetail = $c.showDetail;
      //~ showDetail['параметры расчетов']["сумма"] = item ? -item['коммент'] : undefined;
      //~ row['параметры расчетов'] = undefined;// передернуть-обновить
      
      //~ return $timeout(function(){
        //~ row['параметры расчетов'] = $c.ParamDetail(row);//showDetail;
        //~ if(row['РасчетЗП']) row['параметры расчетов']["сумма"] = -parseFloat(Util.numeric(row['РасчетЗП']));//item ? -item['коммент'] : undefined;
      //~ });
    }
    else $('#modal-detail').modal('close');
  };
  
  $c.CloseModalDetail = function(){
    //~ console.log('CloseModalDetail');
    
  };
  
  $c.FilterDopWork = function(obj, index){
    var row = this;
    return !!row['Доп. часы замстрой'][index];
    
  };
  
  $c.Print = function(){///печать квитков
    $window.location.href = appRoutes.url_for('табель/квитки расчет', undefined, {"month": dateFns.format($c.param['месяц'], 'YYYY-MM'),});
    
  };
  
  $c.ClassRadioLabelFilter = function(){
    return 'hover-shadow3d before-yellow-lighten-4 brown-text-darken-3 checked-after-brown-darken-3 ';
    
  };
  
  /***фильтровать по ФИО***/
  //~ var changeProfileFilter;
  /*$c.ChangeProfileFilter = function(event){
    if (event && event.target && !$(event.target).val()) $c.RefreshTable(0);
    ///без val - вводит буквы
    //~ if (changeProfileFilter) $timeout.cancel(changeProfileFilter);
    //~ changeProfileFilter = $timeout(function() { $c.RefreshTable(val === undefined ? 500 : 0); }, val === undefined ? 500 : 0);
    
 };*/
 
  $c.KeyDownProfileFilter = function(event){
    var val = $c.param['фильтры']['профили'];
    if(val && event.key == 'Enter') return $c.RefreshShow();
    if (val !== undefined ) $timeout(function(){
      if (val.length && !$(event.target).val() ) $c.RefreshShow();
    });
  };
  
  return Lib;
};

//~ return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
