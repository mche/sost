(function () {'use strict';
/*
*/
var moduleName = "TimeWorkReport";

//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'TemplateCache', 'appRoutes', 'WaltexMoney', 'ObjectMy', 'Util',  'TimeWorkPayForm', 'TimeWorkReportLib']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    TemplateCache.split(appRoutes.url_for('assets', 'timework/report.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

//~ var text2numRE = /[^\d,\.]/g;
//~ var text2numRE = /\s+|[^\d\.,]+[\d\.,]*/g;
  
//~ var Comp = (function(){/// пробы наследования var Comp !соотв! function Comp (...)
  //~ angular.module('OO')._.inherits(Comp, angular.module('Components')['комп1']);

var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,   TimeWorkReportLib,    appRoutes, ObjectMyData, Util) {  //function Comp
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($ctrl);// [2].concat(args)
  //~ console.log("ctrl obj ", $ctrl);
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  new TimeWorkReportLib($ctrl, $scope, $timeout, $element, $http, $compile, appRoutes);
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    var async = [];
    //~ async.push();
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
        
        $ctrl.param['общий список'] = true;
        $ctrl.LoadData();
      });
    });
    
    
    
  };  
  
  $ctrl.LoadObjects = function(){
    //~ return $http.get(appRoutes.url_for('табель рабочего времени/объекты'))
    return ObjectMyData["все объекты без доступа"]({'все объекты': true})
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
  
  //~ var success_data = ;
  $ctrl.LoadData = function(){
    if (!$ctrl.data['данные']) $ctrl.data['данные'] = [];
    $ctrl.data['данные'].length = 0;
    if(!$ctrl.param['объект'] && !$ctrl.param['общий список'] && !$ctrl.param['бригада'] && !$ctrl.param['общий список бригад']) return;//$q.defer().resolve();
    //~ $ctrl['костыль для крыжика выплаты'] = undefined;
    //~ if (!$ctrl.param['объект'] || !$ctrl.param['месяц']) return;
    //~ var data = {"объект": $ctrl.param['объект'], "месяц": $ctrl.param['месяц']};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})//appRoutes.url_for('табель рабочего времени/отчет/данные')
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        //~ angular.forEach(resp.data, function(val, key){$ctrl.data[key] = val;});
        Array.prototype.push.apply($ctrl.data['данные'], resp.data);
        $ctrl.data['данные/профили']=undefined; // для фильтации по одному ФИО
        //~ if (!$ctrl.autocompleteSelectProfile) $ctrl.autocompleteSelectProfile = [];
        //~ $ctrl.autocompleteSelectProfile.length = 0;
        //~ $ctrl.filterProfile=undefined;
      },
        //~ function(resp){// fail
          //~ $ctrl.cancelerHttp.resolve();
          //~ $ctrl.cancelerHttp = $q.defer();
          //~ return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})//
            //~ .then(success_data);
        //~ }
      
      );
    
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
  
  //~ $ctrl.FilterRowObjects = function(row, idx){// вызов со вторым параметром ид объекта
    //~ var objId = this;
    //~ return row['объекты'].some(function(oid){ return oid == objId; });
  //~ };
  $ctrl.FilterITR = function(row, idx){// только ИТР
    var profile = $ctrl.RowProfile(row);
    return !!profile['ИТР?'];
  };
  $ctrl.FilterNotNach =  function(row, idx){// без начисления
    return row['Начислено'].some(function(n){ return !n; })
      || (row['Суточные/смены'] && !row['Суточные/начислено'])
      || (row['отпускных дней'] && !row['Отпускные/начислено'])
    ;
  };
  /*логика фильтрации строк*/
  $ctrl.dataFilter = function(obj) {// вернуть фильтующую функцию для объекта/бригады
    //~ console.log("dataFilter", obj);
    if($ctrl.filterProfile) {
      var re = new RegExp($ctrl.filterProfile,"i");
      if($ctrl.param['общий список'] || $ctrl.param['объект']) return function(row, idx){
        //~ if (row["всего часов"][0] === 0) return false; // отсечь двойников
        var profile = $ctrl.RowProfile(row);
        return re.test(profile.names.join(' ')) && ($ctrl.param['общий список'] || row["объекты"].some(function(oid){ return oid == obj.id; }));
      };
      if($ctrl.param['общий список бригад'] || $ctrl.param['бригада']) return function(row, idx){
        //~ if (row["всего часов"][0] === 0) return false; // отсечь двойников
        var profile = $ctrl.RowProfile(row);
        if(!profile["бригада"]) return false;
        return re.test(profile.names.join(' ')) && profile["бригада"].some(function(name){ return ($ctrl.param['общий список бригад'] && !!name) || name == obj.name;});
      };
    }
    if ($ctrl['фильровать ИТР']) return $ctrl.FilterITR;// предполагается общий список
    if ($ctrl['фильровать без расчета ЗП']) return $ctrl.FilterCalcZP;
    if ($ctrl['фильровать без начислений']) return $ctrl.FilterNotNach;
    if($ctrl.param['общий список']) return $ctrl.FilterTrue;
    if($ctrl.param['общий список бригад']) return function(row, idx){
      //~ if (row["всего часов"][0] === 0) return false; // отсечь двойников
      var profile = $ctrl.RowProfile(row);
      if(!profile["бригада"]) return false;
      return profile["бригада"].some(function(name){ return !!name;});// в общем списке чтобы была бригада
    };
    if($ctrl.param['объект']) return function(row, idx){
      if (row["всего часов"][0] === 0) return false; // отсечь двойников
      return row["объекты"].some(function(oid){ return oid == obj.id;});
    };
    if($ctrl.param['бригада']) return function(row, idx){
      //~ if (row["всего часов"][0] === 0) return false; // отсечь двойников
      var profile = $ctrl.RowProfile(row);
      if(!profile["бригада"]) return false;
      return profile["бригада"].some(function(name){ return name == obj.name;});
    };
  };
  
  /**/
  
  $ctrl.FilterRow2 = function(item){// фильтрация строки двойника
    return item['профиль'] == this['профиль2/id'];
  };
  
  $ctrl.InitRow = function(row, index){
    if(index !== undefined) row._index = index;
    if (!row || row._init_done) return row;// избежать повторной инициализации
    var profile = $ctrl.RowProfile(row);
    var fio = profile.names.join(' ');
    if (!$ctrl.data['данные/профили']) $ctrl.data['данные/профили'] = {};
    if(!$ctrl.data['данные/профили'][fio]) $ctrl.data['данные/профили'][fio] = profile;
    
    row._object = $ctrl.Obj(row);
    row['месяц'] = $ctrl.param['месяц'];
    row['пересчитать сумму'] = true;
    row['стиль строки объекта'] = {"height": '2rem', "padding": '0.25rem 0rem'};
    
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
    
    //~ if(!row['Суточные/смены']) row['Суточные/смены'] = $ctrl.DataSumTotal('всего смен', row, 'Суточные').toLocaleString('ru-RU');
    
    if (row['Суточные/начислено']) {
      row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
      row['Суточные/начислено'] = true;
      
    }
    
    if(row['показать суточные'] /*&& !row['Суточные/сумма']*/) $ctrl.SumSut(row);
    //~ if(!row['Сумма']) row['Сумма'] = $ctrl.DataSum(row);
    
    if (row['отпускных дней']) {
      if (row['Отпускные/начислено']) {
        row['Отпускные/сумма'] = parseFloat(Util.numeric(row['Отпускные/начислено'])).toLocaleString('ru-RU');
        row['Отпускные/начислено'] = true;
      //~ } else {
        
      }
      $ctrl.SumOtp(row);
      //~ console.log("Отпускные/сумма", row['Отпускные/сумма']);
      /*$timeout(function(){*/row['показать отпускные'] = true; /*}, 1000);*/
      
    }
    

    //найти строку двойника
    if(!row._row2 && row['профиль2/id'] ) {
      row._row2 = $ctrl.InitRow($ctrl.data['данные'] .filter($ctrl.FilterRow2, row).pop());
      //~ row._row2._row1 = row;// цикличность
      row._row2._profile['двойник'] = angular.copy(profile);
    }
    
    row._init_done = true;
    return row;
    
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
  
  $ctrl.FilterRowObj = function(obj) {// фильтровать объекты внутри строки данных
    //~ if($ctrl.param['объект']) 
    if ($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'])     return $ctrl.FilterTrue;
    return function(oid){ return oid == obj.id; };
    
    
    
  };
  
  $ctrl.ConfirmValue = function (row, name, idx) {// подтвердить крыжик перед сохранением
    $ctrl['modal-confirm-checkbox'] = undefined;
    $timeout(function(){
      $ctrl['modal-confirm-checkbox'] = {"row":row, "name":name, "idx": idx};
      if (name == "Суточные/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Суточные/сумма'];
      } else if (name == "Отпускные/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Отпускные/сумма'];
      } else if (idx === undefined) {
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
      else if (confirm.name =='Отпускные/начислено') confirm.row['Отпускные/начислено'] = confirm.row['Отпускные/начислено'] === true ? null : true;
      else if ( idx === undefined) confirm.row['Начислено'] = confirm.row['Начислено'] === true ? null : true;
      else confirm.row['Начислено'][idx] = confirm.row['Начислено'][idx] === true ? null : true;
    });
    $('#modal-confirm-checkbox').modal('close');
  };
  
  var saveValueTimeout;
  var numFields = ["Ставка","КТУ2", "Сумма", "Суточные/сумма", "Отпускные/сумма"]; //  влияют на сумму (часы тут не меняются)
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
    } else if (name == 'Отпускные/начислено' ) {
      if(!copy_row) copy_row = angular.copy(row);
      copy_row['объект'] = 0;
      copy_row['коммент'] = row['Отпускные/начислено'] ? row['Отпускные/сумма'] : null;
    }
    
    saveValueTimeout = $timeout(function(){
      saveValueTimeout = undefined;
       //~ console.log("Сохранить значение", row, event);
      $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), copy_row || row)
        .then(function(resp){
          if(resp.data.error) Materialize.toast('Ошибка сохранения', 3000, 'red');
          else Materialize.toast('Сохранено успешно', 1000, 'green');
          //~ if (num && name != 'Сумма') delete row['Сумма'];
          //~ console.log(resp.data);
          
          if (name == 'Сумма' || name == 'Отпускные/сумма' || name == 'Суточные/сумма') {
            //~ if (idx === undefined) row['пересчитать сумму'] =  !row['коммент'];
            //~ else row['пересчитать сумму'] = !row['коммент'][idx];
            row['пересчитать сумму'] = false; // для обновления суммы по профилю
            if(name == 'Отпускные/сумма') $ctrl.SumOtp(row);
            if(name == 'Суточные/сумма') $ctrl.SumSut(row);
            $timeout(function(){ row['пересчитать сумму'] = true; });
          }
          else if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
            row['пересчитать сумму'] = false; // для обновления суммы по профилю
            //~ if (idx === undefined) row['Сумма'] = null;
            //~ else row['Сумма'][idx] = null;
            //~ $ctrl.DataSumIf(row, true); // пересчитать сумму
            $ctrl.SaveValue(row, 'Сумма', idx);//.then(function(){ row['пересчитать сумму'] = true; });
            
          }
          else if(name == 'Суточные/ставка') {
            row['пересчитать сумму'] = false;// для обновления суммы по профилю
            //~ row['Суточные/сумма'] = null;
            $ctrl.SumSut(row); // пересчитать сумму суточных
            $ctrl.SaveValue(row, 'Суточные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
            
          }
          else if(name == 'Отпускные/ставка') {
            row['пересчитать сумму'] = false;// для обновления суммы по профилю
            $ctrl.SumOtp(row);
            $ctrl.SaveValue(row, 'Отпускные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
          }
          
        });
      
    }, (name == 'Начислено' || name == 'Отпускные/начислено' || name == 'Суточные/начислено') ? 0 : 1000);
    return saveValueTimeout;
  };
  
  $ctrl.DataSumIf = function(row, force){// сумма денег (инициализирует _sum для row)

    if (!force && !row['пересчитать сумму']) return true;
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
    return Math.round(count * ktu * st);
  };

   /*************Детально по профилю*************/
  $ctrl.ShowDetail = function(row){// показать по сотруднику модально детализацию
    if(row) $ctrl.showDetail = row;
    else row = $ctrl.showDetail;
    
    row['табель'] = undefined;
    $http.post(appRoutes.url_for('табель рабочего времени/отчет/детально'), {"профиль": row["профиль"], "месяц": row["месяц"],}).then(function(resp){
      //~ Array.prototype.push.apply(row['детально'], resp.data);
      row['табель'] = resp.data;
    });
    
    row['параметры расчетов'] = undefined;
    row['параметры расчетов2'] = undefined;
    return $timeout(function(){
      row['параметры расчетов'] = $ctrl.ParamDetail(row);//{"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}}; // параметры для компонента waltex/money/table+form
      //~ row['данные формы ДС'] = {'профиль/id': row["профиль"], 'категория/id': 569};
      if(row._row2) {
        //~ var row2 = angular.copy(row);
        //~ row2['профиль'] = row['профиль2/id'];
        //~ row.names = row['профиль2'];
        row['параметры расчетов2'] = $ctrl.ParamDetail(row._row2);
        row['параметры расчетов'].table['профили'] = [row._profile, row._row2._profile];// 
        //~ row['параметры расчетов']['_профиль'] = row._profile;
        row['параметры расчетов']['профили'][1] = row._row2._profile;
      }
    });
    
  };

  
  $ctrl.InitDays = function(){// для детальной табл
    $ctrl.days = dateFns.eachDay(dateFns.startOfMonth($ctrl.param['месяц']), dateFns.endOfMonth($ctrl.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
  };
  $ctrl.FormatThDay = function(d){// для детальной табл
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $ctrl.IsSunSat = function(d){// для детальной табл
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
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
  $ctrl.TotalTabel = function(name){
    var total = 0;
    if($ctrl.showDetail)  angular.forEach($ctrl.showDetail['табель'], function(row){
      total += row[name];
      
    });
    
    return total;
  };
  
  
  $ctrl.Print = function(){
    $window.location.href = appRoutes.url_for('табель/квитки расчет', undefined, {"month": dateFns.format($ctrl.param['месяц'], 'YYYY-MM'),});
    
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

/*.component('timeworkCalc', {//расч лист
  templateUrl: "time/work/calc",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: CompCalc
})*/

;

}());