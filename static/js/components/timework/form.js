(function () {'use strict';
/*
  Форма табеля рабочего времени
*/

var moduleName = "TimeWorkForm";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'ObjectMy']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, TimeWorkFormData){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ console.log("$onInit ", $ctrl.param);
    $ctrl.data = {};
    
    //~ $ctrl.LoadObjects().then
    $timeout(function(){
        $ctrl.ready=true;
        
        $ctrl.InitMonth();
        
      });
    
    $ctrl.LoadNewProfiles();
    
  };
  
  $ctrl.LoadData = function(){
    if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    $ctrl.data['значения'] = undefined;
    $ctrl.data['сотрудники'] = undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/данные'), data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
      });
    
  };
  
  $ctrl.InitMonth = function(){
    
    $ctrl.InitDays();
    
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        //~ clear: '',
        onClose: $ctrl.SetDate,
        //~ onSet: $ctrl.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: 'OK',// кнопка
        selectYears: true,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
    
  };
  
  var datepicker;
  $ctrl.SetDate = function (context) {//
    var d = $(this._hidden).val();
    if($ctrl.param['месяц'] == d) return;
    $ctrl.param['месяц'] = d;
    $ctrl.days = undefined;
    
    $timeout(function(){
      $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  $ctrl.InitDays = function(){
    $ctrl.days = dateFns.eachDay(dateFns.startOfMonth($ctrl.param['месяц']), dateFns.endOfMonth($ctrl.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
    
  };
  
  $ctrl.FormatThDay = function(d){
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  
  $ctrl.IsSunSat = function(d){
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  $ctrl.OnSelectObj = function(obj){// компонент object-my
    $ctrl.param['объект'] = undefined;
    $timeout(function(){
      $ctrl.param['объект'] = obj;
      $ctrl.LoadData();
    });
  };
  $ctrl.InitRow = function(profile){
    $ctrl.Total(profile.id);
    profile._titleKTU = profile.names.join(' ') + ' КТУ' + ((profile['Начислено'] && profile['Начислено']['коммент']) ? " (табель закрыт)" : $ctrl.Total(profile.id, true) ? '' : ' (нет часов)');
  };
    
  $ctrl.InitCell = function(profile, d){// init
    var df = dateFns.format(d, 'YYYY-MM-DD');
    if (!$ctrl.data['значения']) $ctrl.data['значения']={};
    if (!$ctrl.data['значения'][profile.id]) $ctrl.data['значения'][profile.id]={};
    if (!$ctrl.data['значения'][profile.id][df]) $ctrl.data['значения'][profile.id][df] = {"профиль":profile.id, "объект":$ctrl.param['объект'].id, "дата":df};
    var data = $ctrl.data['значения'][profile.id][df];
    data._d = d;
    data._profile = profile;
    var title = (profile['Начислено'] && profile['Начислено']['коммент']) ? "Табель закрыт " : dateFns.isFuture(d) ? "Редактирование заблокировано для будущих дат " : "";
    data._title =  title + profile.names.join(' ') + " " + (dateFns.isToday(d) ? "сегодня" : dateFns.format(d, 'dddd DD.MM.YYYY', {locale: dateFns.locale_ru}));
    return data;
  };
  

  $ctrl.FocusInput = function(data, event) {
    //~ if (dateFns.isFuture(data._d)) return;
    //~ var data = $ctrl.InitCell(profile, d);InitCell
    var input = $(event.target);
    //~ if (event.target['список активирован']) {
      //~ input.autocomplete().toggleAll();
      //~ return;
    //~ }
    
    //~ if (!listHours) listHours = $scope.inputSelect.map(function(item){ return {"value":item.title, "data": item};});
    
    if(!event.target['список активирован']) input.autocomplete({
      lookup: TimeWorkFormData.hours(),
      appendTo: input.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (data['значение'] == suggestion.data.value) return $('<strong>').html(suggestion.value).get(0).outerHTML;
        return suggestion.value;
      },
      onSelect: function (suggestion) {
        data['значение'] = suggestion.data.value;
        $timeout(function() {
          data._edit = true;
          $ctrl.Total(data["профиль"]);
        });
        $ctrl.Save(data);
        
      },
      
    });
    event.target['список активирован'] = true;
    input.autocomplete().toggleAll();
  };
  var text2numRE = /[^\d,\.]/g;
  var spaceRE = /(^\s+|\s+$)/g;
  var saveCellTimeout = undefined;
  $ctrl.ChangeCell = function(cell, event){
    if (saveCellTimeout) $timeout.cancel(saveCellTimeout);
    
    //~ if(cell['значение'] == '') {// для очистки ячейки
      //~ cell['значение'] = null;
    
    saveCellTimeout = $timeout(function(){
      if(cell['значение'].replace) cell['значение'] = cell['значение'].replace(spaceRE, '');
      else console.log(cell['значение']);
      if (/\d/.test(cell['значение'])) cell['значение'] = parseFloat(cell['значение'].replace ? cell['значение'].replace(text2numRE, '').replace(/,/, '.') : cell['значение']);
      
      $ctrl.Save(cell).then(function(){
        saveCellTimeout = undefined;
        $ctrl.Total(cell['профиль']);
      });
    }, 100);
    
  }
  
  $ctrl.Total = function(pid, flag){// ид профиля
    var data = $ctrl.data['значения'][pid];
    if (!data) return;
    if (flag) return data._total;
    data._total = 0;
    data._cnt = 0;
    data['всего смен'] = 0;
    angular.forEach(data, function(val, key){
      if (val['значение']) {
        var v = parseFloat(val['значение']);
        data._total += v || 0;
        data._cnt++;
        if(v) data['всего смен']++;
      }
    });
    return data._total;
  };
  
  $ctrl.DisabledCell = function(cell) {// запретить изменения
    var d = cell._d;
    if (cell._profile['Начислено'] && cell._profile['Начислено']['коммент']) return true;
    if (dateFns.isToday(d) ) return false;
    if (dateFns.isPast(d) && (cell._edit || !cell['значение'])) return false;
    //~ return !(dateFns.isToday(d) || !dateFns.isFuture(d) || (dateFns.isPast(d) && cell._edit));
    if (dateFns.isFuture(d)) return true;
    
    return false; ///!!!!!
  };
  /*--------------------------------------------------------------------------------*/
  $ctrl.Save = function(data){// click list item
    if(!data || data['значение'] === undefined) return;
    
    //~ {"профиль": profile.id, "дата":df, "объект":$ctrl.param['объект'].id, "значение":suggestion.data.value}
    console.log("Сохранить ", data);
    
    $ctrl.error = undefined;
    
    return $http.post(appRoutes.url_for('табель рабочего времени/сохранить'), data)//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data.error) $ctrl.error = resp.data.error;
        else if (resp.data.success) angular.forEach(resp.data.success, function(val, key){data[key] = val;});
      });
  };
  
  $ctrl.HideProfile = function(profile, idx){/* сохранить значение 'не показывать' в дате первого числа этого месяца*/
    $ctrl.data['сотрудники'].splice(idx, 1);
    //~ $ctrl.lookupProfiles.push(profile);
    var newProfiles = $ctrl.newProfiles;
    $ctrl.newProfiles = undefined;
    $timeout(function(){$ctrl.newProfiles = newProfiles});
    
    var data = $ctrl.data['значения'][profile.id][dateFns.format($ctrl.param['месяц'], 'YYYY-MM')+'-01'];
    data["значение"] = '_не показывать_';
    
    $ctrl.Save(data);
    
  };
  
  $ctrl.DblclickInput = function(data){
    console.log("DblclickInput", data);
    //~ var data  = $ctrl.InitCell(profile, d);
    $timeout(function(){data._dblclick = !data._dblclick && angular.copy(data);});
  };
  
  $ctrl.SaveDesrc = function(data) {// коммент по дате
    data['коммент'] = data._dblclick['коммент'];
    data._dblclick = undefined;
    $ctrl.Save(data);
  };
  
  /*------------------------------КТУ--------------------------*/
  $ctrl.FocusKTU = function(profile, name, event){
    var input = $(event.target);
    //~ if (event.target['список активирован']) {
      //~ input.autocomplete().toggleAll();
      //~ return;
    //~ }
    
    input.autocomplete({
      lookup: TimeWorkFormData.ktu(),
      appendTo: input.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (profile[name] && profile[name]['коммент'] == suggestion.data.value) return $('<strong>').html(suggestion.value).get(0).outerHTML;
        return suggestion.value;
      },
      onSelect: function (suggestion) {
        $ctrl.SaveRowValue(profile, name, suggestion.data.value);
      },
      
    });
    //~ event.target['список активирован'] = true;
    input.autocomplete().toggleAll();
    
  };
  /*универсально сохранять значения для строк-профиле: КТУ1 КТУ2 Примечание*/
  var editTimeout = undefined;
  $ctrl.SaveRowValue = function(profile, name, value){// value из autocomplete списка
    if (editTimeout) $timeout.cancel(editTimeout);
    editTimeout = $timeout(function(){
      editTimeout = undefined;
      if ( value === undefined ) value = profile[name]['коммент'];
      if (!value) value = null;
      if (!profile[name]) profile[name] = {};
      var data = profile[name];
      data["профиль"]=profile.id;
      data["объект"] = $ctrl.param['объект'].id;
      data["дата"] = dateFns.format($ctrl.param['месяц'], 'YYYY-MM')+'-01';
      data["значение"] = name;
      data["коммент"]= value;
      $ctrl.Save(data);
    }, 2000);
    
  };
  $ctrl.DisabledKTU = function(profile, name){
    if (name == 'КТУ1' && $ctrl.param['замстрой']) return true;
    if (profile['Начислено'] && profile['Начислено']['коммент']) return true;
    return !$ctrl.Total(profile.id, true);
    
  };
  /*----------------------------конец КТУ------------------------------*/
  
  
  
  /*--------------------------------------------------------*/
  $ctrl.FilterProfile = function(val){return this.id == val.id;};
  $ctrl.InitNewProfile = function(){
    
    var searchtField = $('input#new-profile', $($element[0]));
    
    var lookup = $ctrl.newProfiles.filter(function(profile){
          return !$ctrl.data['сотрудники'].filter($ctrl.FilterProfile, profile).pop();
        }).map(function(profile){ return {"value":profile.names.join(' '), "data": profile};});
    //~ $ctrl.lookupProfiles = lookup;
        
    searchtField.autocomplete({
      "lookup": lookup,
      "appendTo": searchtField.parent(),
      "formatResult": function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      "onSelect": function (suggestion) {
        searchtField.val('');
        $timeout(function(){
          lookup.splice(lookup.indexOf(suggestion), 1);
          $ctrl.data['сотрудники'].push(suggestion.data);
        });
        
        var df = dateFns.format($ctrl.param['месяц'], 'YYYY-MM')+'-01';
        if (!$ctrl.data['значения'][suggestion.data.id]) $ctrl.data['значения'][suggestion.data.id] = {};
        if (!$ctrl.data['значения'][suggestion.data.id][df]) $ctrl.data['значения'][suggestion.data.id][df] = {};
        var data = $ctrl.data['значения'][suggestion.data.id][df];
        data["профиль"] = suggestion.data.id;
        data["объект"] = $ctrl.param['объект'].id;
        data["дата"] = df;
        data["значение"] = '_добавлен_';// сохранить привязку к списку через пустую строку
        $ctrl.Save( data ).then(function(){ data["значение"] = ''; });
        
      },
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
  };
  
  $ctrl.LoadNewProfiles = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//, data, {timeout: $ctrl.cancelerHttp.promise})
    return TimeWorkFormData.LoadNewProfiles()
      .then(function(resp){
        if (resp.data) $ctrl.newProfiles = resp.data;
      });
    
  };
};


var Data = function($http, appRoutes){

   var hours = [
    {"title": '24 час.', "value": '24'},
    {"title": '23,5 час.', "value": '23.5'},
    {"title": '23 час.', "value": '23'},
    {"title": '22,5 час.', "value": '22.5'},
    {"title": '22 час.', "value": '22'},
    {"title": '21,5 час.', "value": '21.5'},
    {"title": '21 час', "value": '21'},
    {"title": '20,5 час.', "value": '20.5'},
    {"title": '20 час.', "value": '20'},
    {"title": '19,5 час.', "value": '19.5'},
    {"title": '19 час.', "value": '19'},
    {"title": '18,5 час.', "value": '18.5'},
    {"title": '18 час.', "value": '18'},
    {"title": '17,5 час.', "value": '17.5'},
    {"title": '17 час.', "value": '17'},
    {"title": '16,5 час.', "value": '16.5'},
    {"title": '16 час.', "value": '16'},
    {"title": '15,5 час.', "value": '15.5'},
    {"title": '15 час.', "value": '15'},
    {"title": '14,5 час.', "value": '14.5'},
    {"title": '14 час.', "value": '14'},
    {"title": '13,5 час.', "value": '13.5'},
    {"title": '13 час.', "value": '13'},
    {"title": '12,5 час.', "value": '12.5'},
    {"title": '12 час.', "value": '12'},
    {"title": '11,5 час.', "value": '11.5'},
    {"title": '11 час.', "value": '11'},
    {"title": '10,5 час.', "value": '10.5'},
    {"title": '10 час.', "value": '10'},
    {"title": '9,5 час.', "value": '9.5'},
    {"title": '9 час.', "value": '9'},
    {"title": '8,5 час.', "value": '8.5'},
    {"title": '8 час.', "value": '8'},
    {"title": '7,5 час.', "value": '7.5'},
    {"title": '7 час.', "value": '7'},
    {"title": '6,5 час.', "value": '6.5'},
    {"title": '6 час.', "value": '6'},
    {"title": '5,5 час.', "value": '5.5'},
    {"title": '5 час.', "value": '5'},
    {"title": '4,5 час.', "value": '4.5'},
    {"title": '4 час.', "value": '4'},
    {"title": '3,5 час.', "value": '3.5'},
    {"title": '3 час.', "value": '3'},
    {"title": '2,5 час.', "value": '2.5'},
    {"title": '2 час.', "value": '2'},
    {"title": '1,5 час.', "value": '1.5'},
    {"title": '1 час', "value": '1'},
    {"title": '0,5 час.', "value": '0.5'},
    {"title": 'Прогул', "value": 'П'},
    {"title": 'Не был', "value": 'Н'},
    {"title": 'Больничный', "value": 'Б'},
    {"title": 'Отпуск', "value": 'О'},
  ].map(function(item){ return {"value":item.title, "data": item};});
  
  var ktu = [
    {"title":'1,1', "value":'1.1'},
    {"title":'1,2', "value":'1.2'},
    {"title":'1,3', "value":'1.3'},
    {"title":'1,4', "value":'1.4'},
    {"title":'1,5', "value":'1.5'},
    {"title":'0,5', "value":'0.5'},
    {"title":'0,6', "value":'0.6'},
    {"title":'0,7', "value":'0.7'},
    {"title":'0,8', "value":'0.8'},
    {"title":'0,9', "value":'0.9'},
  ].map(function(item){ return {"value":item.title, "data": item};});

  var profiles = $http.get(appRoutes.url_for('табель рабочего времени/профили'));
  
  return {
    hours: function(){
      return hours;
    },
    ktu: function(){
      return ktu;
    },
    LoadNewProfiles: function() {return profiles;}
  };
  
};

/*==========================================================*/
module

.factory(moduleName+"Data", Data)

.component('timeWorkForm', {
  templateUrl: "time/work/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());