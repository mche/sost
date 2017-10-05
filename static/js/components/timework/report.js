(function () {'use strict';
/*
*/
var moduleName = "TimeWorkReport";

//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'loadTemplateCache', 'appRoutes', 'WaltexMoney', 'ObjectMy', 'Util', 'TimeWorkPayForm']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/report.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

//~ var text2numRE = /[^\d,\.]/g;
//~ var text2numRE = /\s+|[^\d\.,]+[\d\.,]*/g;
  
//~ var Comp = (function(){/// пробы наследования var Comp !соотв! function Comp (...)
  //~ angular.module('OO')._.inherits(Comp, angular.module('Components')['комп1']);

var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,       appRoutes, ObjectMyData, Util) {  //function Comp
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($ctrl);// [2].concat(args)
  //~ console.log("ctrl obj ", $ctrl);
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    var async = [];
    async.push($ctrl.LoadProfiles());
    async.push($ctrl.LoadObjects());
    async.push($ctrl.LoadBrigs());
    $q.all(async).then(function(){
      $ctrl.ready= true;
      
      $timeout(function() {
        //~ $('.tabs', $($element[0])).tabs();
        //~ $ctrl.tabsReady = true;
        $('.modal', $($element[0])).modal({"dismissible": false,});
        $ctrl.InitDays();
        $('select', $($element[0])).material_select();
      });
    });
    
    
    
  };
  
  $ctrl.LoadProfiles = function(){
    
    return $http.get(appRoutes.url_for('табель рабочего времени/профили'))//,'табель рабочего времени/профили'  data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        if (resp.data) $ctrl.allProfiles = resp.data;
        
      });
    
  };
  
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
  
  var datepicker;
  $ctrl.SetDate = function (context) {
    var d = $(this._hidden).val();
    if($ctrl.param['месяц'] == d) return;
    $ctrl.param['месяц'] = d;
    $ctrl.days = undefined;
    
    $timeout(function(){
      $ctrl.InitDays();
      $ctrl.LoadData();
    });
  };
  
  
  $ctrl.LoadObjects = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
    return ObjectMyData.Load({'все объекты': true})
      .then(function(resp){
        $ctrl.data['объекты'] = resp.data;
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
        var all = {"name": 'Все бригады',"id": null};
        $ctrl.data['бригады'].unshift(all);//$ctrl.param['бригада']
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
      $ctrl.LoadData();//.then(function(){});
    });
    
  };
  
  $ctrl.LoadData = function(){
    $ctrl.data['данные'] = undefined;
    if(!$ctrl.param['объект'] && !$ctrl.param['общий список'] && !$ctrl.param['бригада'] && !$ctrl.param['общий список бригад']) return;//$q.defer().resolve();
    //~ $ctrl['костыль для крыжика выплаты'] = undefined;
    //~ if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    //~ var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        //~ angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
        $ctrl.data['данные'] = resp.data;
        $ctrl.data['данные/профили']=undefined; // для фильтации по одному ФИО
        //~ if (!$ctrl.autocompleteSelectProfile) $ctrl.autocompleteSelectProfile = [];
        //~ $ctrl.autocompleteSelectProfile.length = 0;
        //~ $ctrl.filterProfile=undefined;
      });
    
  };
  
  $ctrl.DataObjsOrBrigs = function() {// выдать список объектов или бригад
    if ($ctrl.param['общий список'] || $ctrl.param['объект']) return $ctrl.data['объекты'];
    //~ if () return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    if ($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return $ctrl.data['бригады'];
    
    return [];
    //~ if ($ctrl.param['объект']) return [$ctrl.data['объекты'].indexOf($ctrl.param['объект'])];
    
  };
  
  $ctrl.objFilter = function(obj, index){// 
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
  
  var filter_true = function(row){return true;};
  /*логика фильтрации строк*/
  $ctrl.dataFilter = function(obj) {// вернуть фильтующую функцию для объекта/бригады
    //~ console.log("dataFilter", obj);
    if($ctrl.filterProfile) {
      var re = new RegExp($ctrl.filterProfile,"i");
      if($ctrl.param['общий список'] || $ctrl.param['объект']) return function(row, idx){
        var profile = $ctrl.RowProfile(row);
        return re.test(profile.names.join(' ')) && ($ctrl.param['общий список'] || row["объект"] == obj.id);
      };
      if($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return function(row, idx){
        var profile = $ctrl.RowProfile(row);
        if(!profile["бригада"]) return false;
        return re.test(profile.names.join(' ')) && profile["бригада"].some(function(name){ return ($ctrl.param['общий список бригад'] && !!name) || name == obj.name;});
      };
      
    }
    if($ctrl.param['общий список']) return filter_true;
    if($ctrl.param['общий список бригад']) return function(row, idx){
      var profile = $ctrl.RowProfile(row);
      if(!profile["бригада"]) return false;
      return profile["бригада"].some(function(name){ return !!name;});// в общем списке чтобы была бригада
    };
    if($ctrl.param['объект']) return function(row, idx){ return row["объект"] == obj.id; };
    if($ctrl.param['бригада']) return function(row, idx){
      var profile = $ctrl.RowProfile(row);
      if(!profile["бригада"]) return false;
      return profile["бригада"].some(function(name){ return name == obj.name;});
    };
  };
  $ctrl.OrderByData = function(row){
    //~ console.log("OrderByData super ", $ctrl.constructor.__super__);
    var profile = $ctrl.RowProfile(row);
    //~ console.log("OrderByData", row);
    return profile.names.join();
  };
  /**/
  $ctrl.FilterProfiles = function(p){ return p.id == this["профиль"];};
  $ctrl.RowProfile = function(row){// к строке данных полноценный профиль
    if (row._profile) return row._profile;
    var profile = $ctrl.allProfiles.filter($ctrl.FilterProfiles, row).pop();
    if (!profile) profile = ['не найден?'];
    row._profile =  profile;
    
    return profile;
  };
  
  $ctrl.InitRow = function(row, index){
    row._index = index;
    var profile = $ctrl.RowProfile(row);
    var fio = profile.names.join(' ');
    if (!$ctrl.data['данные/профили']) $ctrl.data['данные/профили'] = {};
    if(!$ctrl.data['данные/профили'][fio]) $ctrl.data['данные/профили'][fio] = profile;
    
    row._object = $ctrl.Obj(row);
    row['месяц'] = $ctrl.param['месяц'];
    row['пересчитать сумму'] = true;
    
    /*перевести цифры начисления в true!!!! для крыжика*/
    if (row['Начислено'] && !angular.isArray(row['Начислено'])) {
      row['Сумма'] = row['Начислено'];
      row['Начислено'] = true;
    }
    else if (row['Начислено'] && angular.isArray(row['Начислено'])) row['Начислено'].map(function(val, idx){
      if(val) {
        row['Сумма'][idx] = row['Начислено'][idx];
        row['Начислено'][idx] = true;
        }
      
    });
    
    if (row['Сумма'] && !angular.isArray(row['Сумма'])) row['Сумма'] = parseFloat(Util.numeric(row['Сумма'])).toLocaleString('ru-RU');//row['Сумма'].replace(text2numRE, '').replace(/,/, '.')
    else if (row['Сумма'] && angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx){
      if(!val) return;
      row['Сумма'][idx] = parseFloat(Util.numeric(val)).toLocaleString('ru-RU');//val.replace(text2numRE, '').replace(/,/, '.')
      //~ else row['Сумма'][idx] = val.toLocaleString('ru-RU');
    });
    //~ else /*нет суммы*/  $ctrl.DataSumIf(row); будет в шаблоне
    
    if (angular.isArray(row['Суточные']))  row['показать суточные'] = row['Суточные'].some(function(it){ return !!it; });
    else row['показать суточные'] = !!row['Суточные'];
    row['стиль строки объекта'] = {"height": '2rem', "padding": '0.25rem 0rem'};
    //~ if(!row['Суточные/смены']) row['Суточные/смены'] = $ctrl.DataValueTotal('всего смен', row, 'Суточные').toLocaleString('ru-RU');
    
    if (row['Суточные/начислено']) {
      row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
      row['Суточные/начислено'] = true;
      
    }
    
    if(row['показать суточные'] && !row['Суточные/сумма']) $ctrl.SumSut(row);
    //~ if(!row['Сумма']) row['Сумма'] = $ctrl.DataSum(row);
    
  };
  
  $ctrl.Obj = function(row){// полноценные объекты
    
    if(row["объект"]) return [$ctrl.FindObj(row["объект"])];
    
    if(row["объекты"]) return row["объекты"].map(function(oid){
      return $ctrl.FindObj(oid);
    });
    
  };
  $ctrl.FilterObj = function(obj){ return obj.id == this; };
  $ctrl.FindObj = function(oid){// найти объект по ИДу
    return $ctrl.data['объекты'].filter($ctrl.FilterObj, oid).pop()
     || $ctrl.data['бригады'].filter($ctrl.FilterObj, oid).pop();
  };
  
  $ctrl.ConfirmValue = function (row, name, idx) {// подтвердить крыжик перед сохранением
    $ctrl['modal-confirm-checkbox'] = undefined;
    $timeout(function(){
      $ctrl['modal-confirm-checkbox'] = {"row":row, "name":name, "idx": idx};
      if (name == "Суточные/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Суточные/сумма'];
      } 
      else if (idx === undefined) {
        $ctrl['modal-confirm-checkbox'].sum = row['Сумма'];
      }
      else {
        $ctrl['modal-confirm-checkbox'].sum = row['Сумма'][idx];
      }
      $('#modal-confirm-checkbox').modal('open');
      //~ $timeout(function(){$ctrl['modal-confirm-checkbox'].ready = true;});
    });
  };
  $ctrl.ConfirmValueOK = function () {// подтвердил крыжик 
    $ctrl.SaveValue($ctrl['modal-confirm-checkbox'].row, $ctrl['modal-confirm-checkbox'].name, $ctrl['modal-confirm-checkbox'].idx); // row, name, idx
  };
  $ctrl.ConfirmValueNOT = function() {// вернуть состояние крыжика
    var confirm = $ctrl['modal-confirm-checkbox'];
    var idx= confirm.idx;
    $timeout(function(){
      if (confirm.name =='Суточные/начислено') confirm.row['Суточные/начислено'] = confirm.row['Суточные/начислено'] === true ? null : true;
      else if ( idx === undefined) confirm.row['Начислено'] = confirm.row['Начислено'] === true ? null : true;
      else confirm.row['Начислено'][idx] = confirm.row['Начислено'][idx] === true ? null : true;
    });
    $('#modal-confirm-checkbox').modal('close');
  };
  var saveValueTimeout;
  var numFields = ["Ставка","КТУ2", "Сумма", "Суточные/сумма"]; //  влияют на сумму (часы тут не меняются)
  $ctrl.SaveValue = function(row, name, idx, data){//сохранить разные значения
    if (saveValueTimeout) $timeout.cancel(saveValueTimeout);
    
    
    var num = numFields.some(function(n){ return n == name;});
    
    row['дата'] = dateFns.format($ctrl.param['месяц'], 'YYYY-MM')+'-01';
    row['значение'] = name;
    
    if (num) {// к числу
      
      if(angular.isArray(row[name])) row['коммент'] = row[name].map(function(val){
        if(!val) return val;
        val += '';
        //~ console.log("text2numRE", val);
        return parseFloat(Util.numeric(val));//val.replace(text2numRE, '').replace(/,/, '.')
      });
      else if (row[name]) row['коммент'] = parseFloat(Util.numeric(row[name]));//row[name].replace(text2numRE, '').replace(/,/, '.')
      else row['коммент'] = row[name];
      //~ if (idx !== undefined) {
        //~ row['коммент'][idx] = parseFloat(row[name][idx].replace(text2numRE, '').replace(/,/, '.'));
      //~ }
      
    } else {// Примечание и Начислено
      row['коммент'] = row[name];
    }
    
    var copy_row;
    if (data) {
      copy_row = angular.copy(row);
      Object.keys(data).map(function(key){ copy_row[key] = data[key]; });
    }
    if (name == 'Сумма') {
      
      row['пересчитать сумму'] = false;
      
      if (idx !== undefined) {
        if(!copy_row) copy_row = angular.copy(row);
        copy_row['объект'] = row['объекты'][idx];
        copy_row['коммент'] = row['коммент'][idx];
      }
      
    } else if (name == 'Начислено' ) {
      
      if (idx !== undefined) {
        if(!copy_row) copy_row = angular.copy(row);
        copy_row['объект'] = row['объекты'][idx];
        copy_row['коммент'] = row['Начислено'][idx] ? row['Сумма'][idx] : null;
      }
      else row['коммент'] = row['Начислено'] ? row['Сумма'] : null;
      
    } else if (name == 'Суточные/начислено' ) {
      if(!copy_row) copy_row = angular.copy(row);
      copy_row['объект'] = 0;
      copy_row['коммент'] = row['Суточные/начислено'] ? row['Суточные/сумма'] : null;
    }
    
    saveValueTimeout = $timeout(function(){
      saveValueTimeout = undefined;
       //~ console.log("Сохранить значение", row, event);
      $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), copy_row || row)
        .then(function(resp){
          //~ if (num && name != 'Сумма') delete row['Сумма'];
          console.log(resp.data);
          
          if (name == 'Сумма') {
            if (idx === undefined) row['пересчитать сумму'] =  !row['коммент'];
            else row['пересчитать сумму'] = !row['коммент'][idx];
          }
          else if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
            row['пересчитать сумму'] = false;
            if (idx === undefined) row['Сумма'] = null;
            else row['Сумма'][idx] = null;
            $ctrl.SaveValue(row, 'Сумма', idx);
            
          }
          else if(name == 'Суточные/ставка') $ctrl.SumSut(row); // пересчитать сумму суточных
          
        });
      
    }, name == 'Начислено' ? 0 : 1000);
  };
  
  $ctrl.DataSumIf = function(row){// сумма денег (инициализирует _sum для row)

    if (!row['пересчитать сумму']) return true;
    if (angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx) {
      if( !val ) //{ === null
        var sum = $ctrl.DataSumIdx(row, idx);
        if(sum) row['Сумма'][idx] = sum.toLocaleString('ru-RU');
    });
    else if (!row['Сумма']) {
      var sum = $ctrl.DataSumIdx(row);
      if(sum) row['Сумма'] = sum.toLocaleString('ru-RU');
      
    }
    
    return true;
  };  

  $ctrl.DataSumIdx = function(row, idx){// сумма денег по объекту или
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    var ktu = (idx === undefined) ? parseFloat(Util.numeric(row['КТУ2'])) : parseFloat(Util.numeric(row['КТУ2'][idx]));
    var st = (idx === undefined) ? parseFloat(Util.numeric(row['Ставка'])) : parseFloat(Util.numeric(row['Ставка'][idx]));
    var count =  (idx === undefined) ? parseFloat(row[cname]) : parseFloat(row[cname][idx]);
    return Math.floor(count * ktu * st);
  };
  
  $ctrl.SumSut = function(row) {//  сумма суточных
    var sum = 0;
    if(angular.isArray(row['Суточные/ставка'])) row['Суточные/ставка'].map(function(it, idx){ if(it) sum +=  parseFloat(Util.numeric(it)) * parseFloat(Util.numeric(row['всего смен'][idx]));  });
    else  sum += parseFloat(Util.numeric(row['Суточные/ставка'])) * parseFloat(Util.numeric(row['всего смен']));
    row['Суточные/сумма'] = sum.toLocaleString('ru-RU');
    
  };

  $ctrl.DataValueTotal = function(name, row_or_obj) {// общая сумма по объектам / без row считает по всем строкам
    var sum = 0;
    if (row_or_obj && row_or_obj[name]) {
      if(angular.isArray(row_or_obj[name])) row_or_obj[name].map(function(val){
        if(!val) return 0;
         sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
      });
      else sum += parseFloat(Util.numeric(row_or_obj[name])) || 0;
      if (name == 'Сумма') sum +=  + parseFloat(Util.numeric(row_or_obj['Суточные/сумма'])) || 0;
    } else {// по объекту
      $ctrl.data['данные'].filter($ctrl.dataFilter(row_or_obj)).map(function(row){
        if (!row[name]) return 0;
        if (!angular.isArray(row[name])) sum += parseFloat(Util.numeric(row[name])) || 0;//row[name].replace(text2numRE, '').replace(/,/, '.')
        else row[name].map(function(val){
          if(!val) return 0;
          sum += parseFloat(Util.numeric(val)) || 0;//val.replace(text2numRE, '').replace(/,/, '.')
        });
        if (name == 'Сумма') sum +=  + parseFloat(Util.numeric(row['Суточные/сумма'])) || 0;
      });
    }
    return sum;//.toLocaleString('ru-RU');
  };
  
  /*************Детальная таблица по профилю*************/
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
  
  $ctrl.InitDays = function(){// для детальной табл
    $ctrl.days = dateFns.eachDay(dateFns.startOfMonth($ctrl.param['месяц']), dateFns.endOfMonth($ctrl.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
  };
  $ctrl.FormatThDay = function(d){// для детальной табл
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $ctrl.IsSunSat = function(d){// для детальной табл
    var wd = dateFns.format(d, 'd');
    return wd === 0 || wd == 6;
  };
  
  $ctrl.InitDetailRow = function(oid, row){
    row._object = $ctrl.FindObj(oid);
    row._total = 0;
    row._cnt = 0;
    angular.forEach(row, function(val, d){
      if (val['значение']) {
        var v = parseFloat(Util.numeric(val['значение']));//val['значение'].replace(text2numRE, '').replace(/,/, '.')
        //~ console.log("row._total+", row._total, v, val['значение']);
        row._total += v || 0;
        if(v) row._cnt++;
      }
    });
    
  };
  $ctrl.InitDetailCell = function(row, d){// для детальной табл
    var df = dateFns.format(d, 'YYYY-MM-DD');
    var data = row[df] || {};
    data._d = d;
    //~ data._title = dateFns.isFuture(d) ? "Редактирование заблокировано для будущих дат" : profile.names.join(' ') + " " + (dateFns.isToday(d) ? "сегодня" : dateFns.format(d, 'dddd DD.MM.YYYY', {locale: dateFns.locale_ru}));
    return data;
  };
  $ctrl.TotalDetail = function(name){
    var total = 0;
    if($ctrl.showDetail)  angular.forEach($ctrl.showDetail['детально'], function(row){
      total += row[name];
      
    });
    
    return total;
  };
  $ctrl.ShowDetailOnSaveMoney = function(data){
    //~ console.log("ShowDetailOnSaveMoney", data);
    $scope.add_money = false;
  };
  
  $ctrl.Print = function(){
    $window.location.href = appRoutes.url_for('табель/печать квитков', undefined, {"month": dateFns.format($ctrl.param['месяц'], 'YYYY-MM'), "object":$ctrl.param['объект'] && $ctrl.param['объект'].id});
    
  };
  /**Расчетный лист**/
  $ctrl['Закрытие расчета'] = function(item){
    console.log("Закрытие расчета", item);
    if($ctrl.showDetail) $ctrl.showDetail['РасчетЗП'] = item['коммент'];
  };
  $ctrl.ToggleCalcZP = function(row){// показать расчетный лист
    var tr = $('#row'+row._index);
    //~ console.log("ToggleCalcZP", tr.children().length);
    tr.after($('<tr>').append($('<td>').attr({"colspan": tr.children().length})));// тупо пустая строка чтобы не сбивалась полосатость сток
    tr.after($('<tr>').append($('<td>').attr({"colspan": tr.children().length}).append($compile('<timework-calc data-param="row">')($scope))));
    
  };
  
};
//~ return Comp;
//~ })();

//----------------------------------------------------------------

var CompCalc = function($scope, $http, $q, $timeout, $element){
  
  
};

/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeWorkReport', {
  templateUrl: "time/work/report",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

.component('timeworkCalc', {//расч лист
  templateUrl: "time/work/calc",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: CompCalc
})

;

}());