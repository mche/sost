(function () {'use strict';
/*
  Форма табеля рабочего времени
*/

var moduleName = "TimeWorkForm";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'appRoutes', 'Util', 'SVGCache', 'Объекты']);

var Component = function($scope, $window, $element, $timeout, $http, $q, appRoutes, TimeWorkFormData, Util){
  var $c = this;
  $scope.dateFns = dateFns;
  
  $c.$onInit = function(){
    if(!$c.param) $c.param = {};
    if(!$c.param['месяц']) $c.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ console.log("$onInit ", $c.param);
    $c.data = {};
    
    //~ $c.LoadObjects().then
    $timeout(function(){
      $c.ready=true;
      
      $c.InitMonth();
      $timeout(function(){
        $('.modal', $($element[0])).modal({"dismissible": false,});
        
      });
        
      });
    
    $c.LoadNewProfiles();
    
  };
  
  $c.LoadData = function(){
    if (!$c.param['объект'] || !$c.param['месяц']) return;
    var data = {"объект": $c.param['объект'], "месяц": $c.param['месяц']};
    
    $c.data['значения'] = undefined;
    $c.data['сотрудники'] = undefined;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/данные'), data, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        angular.forEach(resp.data, function(val, key){$c.data[key] = val;});
      });
    
  };
  
  $c.InitMonth = function(){
    
    $c.InitDays();
    
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        //~ clear: '',
        onClose: $c.SetDate,
        //~ onSet: $c.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: 'OK',// кнопка
        selectYears: true,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
    
  };
  
  var datepicker;
  $c.SetDate = function (context) {//
    var d = $(this._hidden).val();
    if($c.param['месяц'] == d) return;
    $c.param['месяц'] = d;
    $c.days = undefined;
    
    $timeout(function(){
      $c.InitDays();
      $c.LoadData();
    });
  };
  
  $c.InitDays = function(){
    $c.days = dateFns.eachDay(dateFns.startOfMonth($c.param['месяц']), dateFns.endOfMonth($c.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
  };
  $c.FormatThDay = function(d){
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $c.IsSunSat = function(d){
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  
  $c.OnSelectObj = function(obj){// компонент object-select
    $c.param['объект'] = undefined;
    $timeout(function(){
      $c.param['объект'] = obj;
      $c.LoadData();
    });
  };
  $c.InitRow = function(profile){
    $c.Total(profile.id);
    profile['табель закрыт'] = (profile['Начислено'] && profile['Начислено']['коммент']) || profile['месяц табеля/закрыт'];
    profile._titleKTU = profile.names.join(' ') + ' - КТУ' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    profile._titleComment = profile.names.join(' ') + ' - Примечание' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    profile._titleSut = profile.names.join(' ') + ' - Суточные' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    profile._titleDopHours = profile.names.join(' ') + ' - Доп. часы' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    profile._titleTotalHours = profile.names.join(' ') + ' - Всего часов' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    profile._titleTotalSmen = profile.names.join(' ') + ' - Всего смен' + (profile['табель закрыт'] ? " (табель закрыт)" : $c.Total(profile.id, true) ? '' : ' (нет часов)');
    //~ profile['Суточные'] = {};
  };
    
  $c.InitCell = function(profile, d){// init
    var df = dateFns.format(d, 'YYYY-MM-DD');
    if (!$c.data['значения']) $c.data['значения']={};
    if (!$c.data['значения'][profile.id]) $c.data['значения'][profile.id]={};
    if (!$c.data['значения'][profile.id][df]) $c.data['значения'][profile.id][df] = {"профиль":profile.id, "объект":$c.param['объект'].id, "дата":df};
    var data = $c.data['значения'][profile.id][df];
    data._d = d;
    data._profile = profile;
    var title = profile['табель закрыт'] ? "Табель закрыт " : dateFns.isFuture(d) ? "Редактирование заблокировано для будущих дат " : "";
    data._title =  title + profile.names.join(' ') + " " + (dateFns.isToday(d) ? "сегодня" : dateFns.format(d, 'dddd DD.MM.YYYY', {locale: dateFns.locale_ru}));
    if( /^\d/.test(data['значение']) ) data['значение'] = parseFloat(data['значение']).toLocaleString('ru-RU');
    data['_значение'] = data['значение'];
    return data;
  };
  

  $c.FocusInput = function(data, event) {
    //~ if (dateFns.isFuture(data._d)) return;
    //~ var data = $c.InitCell(profile, d);InitCell
    var input = $(event.target);
    //~ if (event.target['список активирован']) {
      //~ input.autocomplete().toggleAll();
      //~ return;
    //~ }
    
    //~ if (!listHours) listHours = $scope.inputSelect.map(function(item){ return {"value":item.title, "data": item};});
    
    //~ if(!event.target['список активирован']) 
    input.autocomplete({
      lookup: TimeWorkFormData.hours(),
      appendTo: input.parent(),
      "список":{top: true},
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (data['значение'] == suggestion.data.value) return $('<strong>').html(suggestion.value).get(0).outerHTML;
        return suggestion.value;
      },
      topChild: function(currentValue, ac){ if (data['значение']) return $('<div>').append($('<div>').append($('<a class="btn-flat00 black-text" href="javascript:">Примечание</a>').on('click', function(ev){
        $timeout(function() {
          data._editDescr = angular.copy(data);// ячейка
          //~ data._editDescr._val = data['значение'];
          //~ data['значение'] = undefined;
        });
        ac.hide();
      }))).append($('<div>').append($('<a class="btn-flat000 red-text" href="javascript:">Очистить</a>').on('click', function(ev){
        $timeout(function() {
          data['значение']='';
          data['коммент']=undefined;
          $c.Save(data);
        });
        ac.hide();
      })));},
      onSelect: function (suggestion) {
        /*if(suggestion.data.title == 'Примечание') {
          
          return;
        }*/
        data['значение'] = suggestion.data.value;
        $timeout(function() {
          data._edit = true;
          $c.Total(data["профиль"]);
        });
        $c.Save(data);
        
      },
      
    });
    //~ event.target['список активирован'] = true;
    input.autocomplete().toggleAll();
  };
  //~ var text2numRE = /[^\d,\.]/g;
  var spaceRE = /(^\s+|\s+$)/g;
  $c.ChangeCell = function(cell, event){///event - форсировать сохранение когда blur из ячеки
    if (event && !$c.saveCellTimeout) return;
    if ($c.saveCellTimeout) $timeout.cancel($c.saveCellTimeout);
    
    $c.saveCellTimeout = $timeout(function(){
      cell['значение'] = (cell['значение']+'').replace(spaceRE, '');
      //~ else console.log(cell['значение']);
      //~ var val = cell['значение'];
      //~ if (/^\d/.test(cell['значение'])) cell['значение'] = parseFloat(Util.numeric(cell['значение']));//.toLocaleString('ru-RU');//cell['значение'].replace ? cell['значение'].replace(text2numRE, '').replace(/,/, '.') : cell['значение']);
      
      $c.Save(cell).then(function(){
        $c.saveCellTimeout = undefined;
        $c.Total(cell['профиль']);
      });
    }, event ? 0 : 1000);
    
  };
  
  $c.Total = function(pid, flag){// ид профиля
    var data = $c.data['значения'][pid];
    if (!data) return undefined;
    if (flag) return data._total;
    data._total = 0;
    data._nodelete = 0;
    data['всего смен'] = 0;
    angular.forEach(data, function(val, day){
      if (val['значение']) {
        data._nodelete = true;
        var v = parseFloat(Util.numeric(val['значение']));
        if(/\d+-\d+-\d+/.test(day) && v) {// только дни с цифрами!
          data._total += v;
          data['всего смен']++;
        }
      }
    });
    return data._total;
  };
  
  $c.DisabledCell = function(cell) {// запретить изменения
    var d = cell._d;
    if (cell._profile['табель закрыт']) return true;
    if (dateFns.isToday(d) ) return false;
    if (dateFns.isPast(d) && (cell._edit || !cell['значение'])) return false;
    //~ return !(dateFns.isToday(d) || !dateFns.isFuture(d) || (dateFns.isPast(d) && cell._edit));
    if (dateFns.isFuture(d)) return true;
    
    return false; ///!!!!!
  };
  /*--------------------------------------------------------------------------------*/
  $c.Save = function(data){// click list item
    if(!data || data['значение'] === undefined) return;
    if(data['значение'] == '') data['коммет']=undefined;
    var hour = /^\d/.test(data['значение']);
    if (hour) data['значение'] = parseFloat(Util.numeric(data['значение']));//.toLocaleString('ru-RU');//cell['значение'].replace ? cell['значение'].replace(text2numRE, '').replace(/,/, '.') : cell['значение']);
    
    //~ {"профиль": profile.id, "дата":df, "объект":$c.param['объект'].id, "значение":suggestion.data.value}
    console.log("Сохранить ", data);
    
    $c.error = undefined;
    
    return $http.post(appRoutes.url_for('табель рабочего времени/сохранить'), data)//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data.error) {
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
          //~ data['значение'] = undefined;
          data['значение'] = data['_значение'];
          //~ data['коммет']=undefined;
        }
        else if (resp.data.success) {
          angular.forEach(resp.data.success, function(val, key){data[key] = val;});
          if(hour) data['значение'] = parseFloat(resp.data.success['значение']).toLocaleString('ru-RU');
          data['_значение'] = data['значение'];
          Materialize.toast('Сохранено успешно', 1000, 'green-text text-darken-3 green lighten-3 fw500 border animated flash-one-000 zoomInUp');
        }
        else if (resp.data.remove) {
          data['_значение'] = undefined;
          Materialize.toast('Удалено успешно', 1000, 'green-text text-darken-3 green lighten-3 fw500 border animated flash-one-000 zoomInUp');
        }
        else if (resp.data.intersection) {
          $scope.intersection = resp.data.intersection;
          $scope.intersection._data = data;
          $('#modal-confirm-intersection').modal('open');
          
          
        }
      });
  };
  
  $c.CancelIntersection = function(intersection){
    intersection._data['значение'] = intersection._data['_значение'];
    
  };
  
  $c.AcceptIntersection = function(intersection){
    intersection._data['подтвердил пересечение'] = true;
    $('#modal-confirm-intersection').modal('close');
    $c.Save(intersection._data).then(function(){ /*intersection._data['подтвердил пересечение'] = undefined;*/ });
  };
  
  $c.HideProfile = function(profile, idx){/* сохранить значение 'не показывать' в дате первого числа этого месяца*/
    $c.data['сотрудники'].splice(idx, 1);
    //~ $c.lookupProfiles.push(profile);
    var newProfiles = $c.newProfiles;
    $c.newProfiles = undefined;
    $timeout(function(){$c.newProfiles = newProfiles; });
    
    var data = $c.data['значения'][profile.id][dateFns.format($c.param['месяц'], 'YYYY-MM')+'-01'];
    data["значение"] = '_не показывать_';
    
    $c.Save(data);
    
  };
  /*
  $c.ToggleDescr = function(data){
    //~ console.log("DblclickInput", data);
    //~ var data  = $c.InitCell(profile, d);
    $timeout(function(){data._dblclick = !data._dblclick && angular.copy(data);});
  };*/
  
  $c.SaveDesrc = function(data) {// коммент ячейки
    var save = data._editDescr;
    data._editDescr = undefined;
    //~ save['значение'] = '';
    //~ data['коммент'] = save['коммент'];
    $c.Save(save).then(function(){
      data['коммент'] = save['коммент'];
      //~ data['значение'] = save._val;
    });
  };
  /**************** суточ **********/
  
  $c.ChbSut = function(sut, profile){
    //~ console.log("ChbSut", val);
    if (!profile['Суточные']) profile['Суточные'] = {};
    profile['Суточные']['коммент'] = sut ? $c.data['значения'][profile.id]['всего смен'] : null;
    $c.SaveRowValue(profile, 'Суточные');
    
  };
  
  /*------------------------------КТУ--------------------------*/
  $c.FocusKTU = function(profile, name, event){
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
        $c.SaveRowValue(profile, name, suggestion.data.value);
      },
      
    });
    //~ event.target['список активирован'] = true;
    input.autocomplete().toggleAll();
    
  };
  /*универсально сохранять значения для строк-профиле: Доп.часы КТУ1 КТУ2 Примечание*/
  $c.SaveRowValue = function(profile, name, value){// value из autocomplete списка
    if ($c.editTimeout) $timeout.cancel($c.editTimeout);
    $c.editTimeout = $timeout(function(){
      if (!profile[name]) profile[name] = {};
      if ( value === undefined ) value = profile[name]['коммент'];
      if (!value) value = null;
      var data = profile[name];
      data["профиль"]=profile.id;
      data["объект"] = $c.param['объект'].id;
      data["дата"] = dateFns.format($c.param['месяц'], 'YYYY-MM')+'-01';
      data["значение"] = name;
      data["коммент"]= value;
      $c.Save(data).then(function(){
        $c.editTimeout = undefined;
      });
    }, name == 'Примечание' ? 3000 : 1000);
    
  };
  $c.Disabled = function(profile, name){
    if (name == 'КТУ1' && $c.param['замстрой']) return true;
    if (profile['табель закрыт']) return true;
    if (name == 'Доп. часы замстрой') return false;
    if (name == 'Суточные') return false;
    return !$c.Total(profile.id, true);
    
  };
  /*----------------------------конец КТУ------------------------------*/
  
  
  
  /*--------------------------------------------------------*/
  $c.FilterProfile = function(val){return this.id == val.id;};
  $c.InitNewProfile = function(){
    
    var searchtField = $('input#new-profile', $($element[0]));
    
    var lookup = $c.newProfiles.filter(function(profile){
          return !$c.data['сотрудники'].filter($c.FilterProfile, profile).pop();
        }).map(function(profile){ return {"value":profile.names.join(' '), "data": profile};});
    //~ $c.lookupProfiles = lookup;
        
    searchtField.autocomplete({
      "lookup": lookup,
      "appendTo": searchtField.parent(),
      "formatResult": function (suggestion, currentValue) {//arguments[3] объект Комплит
        var ret = arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (suggestion.data.disable)  return $(ret).addClass('red-text').append($('<span class="red-text middle">').html(' (уволен) ')).get(0).outerHTML;
        return ret;
      },
      "onSelect": function (suggestion) {
        searchtField.val('');
        $timeout(function(){
          lookup.splice(lookup.indexOf(suggestion), 1);
          $c.data['сотрудники'].push(suggestion.data);
        });
        
        var df = dateFns.format($c.param['месяц'], 'YYYY-MM')+'-01';
        if (!$c.data['значения'][suggestion.data.id]) $c.data['значения'][suggestion.data.id] = {};
        if (!$c.data['значения'][suggestion.data.id][df]) $c.data['значения'][suggestion.data.id][df] = {};
        var data = $c.data['значения'][suggestion.data.id][df];
        data["профиль"] = suggestion.data.id;
        data["объект"] = $c.param['объект'].id;
        data["дата"] = df;
        data["значение"] = '_добавлен_';// сохранить привязку к списку через пустую строку
        $c.Save( data ).then(function(){ data["значение"] = ''; });
        
      },
      noSuggestionNotice: $('<div>Нет такого сотрудника. Позвонить по тел. 258-00-92 отдел кадров Елена Сергеевна </div>'),
      showNoSuggestionNotice: true,
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
  };
  
  $c.LoadNewProfiles = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//, data, {timeout: $c.cancelerHttp.promise})
    if (!$c.newProfiles) $c.newProfiles = [];
    return TimeWorkFormData.LoadNewProfiles()
      .then(function(resp){
        $c.newProfiles.length = 0;
        //~ if (resp.data) $c.newProfiles = resp.data.filter(function(item){ return !item.disable; });
        ///показать уволенных тоже, они могут опять работать
         if (resp.data) Array.prototype.push.apply($c.newProfiles, resp.data);
        
      });
    
  };
  
  $c.Print = function(){
    $window.open(appRoutes.url_for('табель/квитки начислено', undefined, {"month": dateFns.format($c.param['месяц'], 'YYYY-MM'), "object000":$c.param['объект'] && $c.param['объект'].id}), '_blank');
    
  };
  
  $c.OpenTabel = function(){
    var data = {"объект": $c.param['объект'], "месяц": $c.param['месяц']};
    
    $c.data = {};
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/открыть месяц'), data, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        angular.forEach(resp.data, function(val, key){$c.data[key] = val;});
      });
    
  };
};


var Data = function($http, appRoutes){

   var hours = [
    {"title": '24 час.', "value": '24'},
    {"title": '23,5 час.', "value": '23,5'},
    {"title": '23 час.', "value": '23'},
    {"title": '22,5 час.', "value": '22,5'},
    {"title": '22 час.', "value": '22'},
    {"title": '21,5 час.', "value": '21,5'},
    {"title": '21 час', "value": '21'},
    {"title": '20,5 час.', "value": '20,5'},
    {"title": '20 час.', "value": '20'},
    {"title": '19,5 час.', "value": '19,5'},
    {"title": '19 час.', "value": '19'},
    {"title": '18,5 час.', "value": '18,5'},
    {"title": '18 час.', "value": '18'},
    {"title": '17,5 час.', "value": '17,5'},
    {"title": '17 час.', "value": '17'},
    {"title": '16,5 час.', "value": '16,5'},
    {"title": '16 час.', "value": '16'},
    {"title": '15,5 час.', "value": '15,5'},
    {"title": '15 час.', "value": '15'},
    {"title": '14,5 час.', "value": '14,5'},
    {"title": '14 час.', "value": '14'},
    {"title": '13,5 час.', "value": '13,5'},
    {"title": '13 час.', "value": '13'},
    {"title": '12,5 час.', "value": '12,5'},
    {"title": '12 час.', "value": '12'},
    {"title": '11,5 час.', "value": '11,5'},
    {"title": '11 час.', "value": '11'},
    {"title": '10,5 час.', "value": '10,5'},
    {"title": '10 час.', "value": '10'},
    {"title": '9,5 час.', "value": '9,5'},
    {"title": '9 час.', "value": '9'},
    {"title": '8,5 час.', "value": '8,5'},
    {"title": '8 час.', "value": '8'},
    {"title": '7,5 час.', "value": '7,5'},
    {"title": '7 час.', "value": '7'},
    {"title": '6,5 час.', "value": '6,5'},
    {"title": '6 час.', "value": '6'},
    {"title": '5,5 час.', "value": '5,5'},
    {"title": '5 час.', "value": '5'},
    {"title": '4,5 час.', "value": '4,5'},
    {"title": '4 час.', "value": '4'},
    {"title": '3,5 час.', "value": '3,5'},
    {"title": '3 час.', "value": '3'},
    {"title": '2,5 час.', "value": '2,5'},
    {"title": '2 час.', "value": '2'},
    {"title": '1,5 час.', "value": '1,5'},
    {"title": '1 час', "value": '1'},
    {"title": '0,5 час.', "value": '0,5'},
    {"title": 'Прогул', "value": 'П'},
    {"title": 'Не был', "value": 'Н'},
    {"title": 'Больничный', "value": 'Б'},
    {"title": 'Отпуск', "value": 'О'},
    {"title": 'Путевой лист', "value": 'ПЛ'},
    //~ {"title": 'Примечание', "value": null},
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
  controllerAs: '$c',
  templateUrl: "time/work/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());