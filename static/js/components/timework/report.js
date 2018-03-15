(function () {'use strict';
/*
*/
var moduleName = "TimeWorkReport";
try {angular.module(moduleName); return;} catch(e) { } 
//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'TemplateCache', 'appRoutes', 'WaltexMoney', 'ObjectMy', 'Util' , 'SVGCache',  'TimeWorkPayForm', 'TimeWorkReportLib']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

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

var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,   TimeWorkReportLib,    appRoutes, Util) {  //function Comp
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($ctrl);// [2].concat(args)
  //~ console.log("ctrl obj ", $ctrl);
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  new TimeWorkReportLib($ctrl, $scope, /*$timeout,*/ $element/*, $http, $compile, appRoutes*/);
  
  $ctrl.Log = function(){
    console.log(arguments);
  };
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['фильтры']) $ctrl.param['фильтры'] = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    var async = [];
    //~ async.push();
    async.push($ctrl.LoadProfiles());
    async.push($ctrl.LoadObjects());
    async.push($ctrl.LoadBrigs());
    $q.all(async).then(function(){
      
        
        $ctrl.param['общий список'] = true;
        $ctrl.LoadData().then(function(){
          $ctrl.ready= true;
      
          $timeout(function() {
            //~ $('.tabs', $($element[0])).tabs();
            //~ $ctrl.tabsReady = true;
            $('.modal', $($element[0])).modal({"dismissible": false,});
            $ctrl.InitDays();
            $('select', $($element[0])).material_select();
          //~ $ctrl['фильтр офис'] = null;
          //~ $('input[type="radio"]').siblings('label').click(function(event){ console.log("radio", eval($(this).siblings('input[type="radio"]').attr('ng-model'))); });
        });
      });
    });
    
    
    
  };  
  
  $ctrl.LoadData = function(){
    
    if(!$ctrl.param['объект'] && !$ctrl.param['общий список'] && !$ctrl.param['бригада'] && !$ctrl.param['общий список бригад']) return;//$q.defer().resolve();
    if (!$ctrl.data['данные']) $ctrl.data['данные'] = [];
    $ctrl.data['данные'].length = 0;
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
        $ctrl.data['пересечение объектов'] = resp.data.pop();// хвост в массиве профильных данных
        //~ console.log("пересечение объектов", $ctrl.data['пересечение объектов'])
        //~ Object.keys($ctrl.data['пересечение объектов']).map(function(pid){ $ctrl.data['пересечение объектов'][pid] = $ctrl.data['пересечение объектов'][pid]["json"].map(function(row){ return JSON.parse(row) }); });
        //~ console.log("пересечение объектов", $ctrl.data['пересечение объектов']);
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
  

  $ctrl.FilterITR = function(row, idx){// только ИТР
    //~ if(!$ctrl['фильтр ИТР']) return true;
    var profile = $ctrl.RowProfile(row);
    return !!profile['ИТР?'];
  };
  $ctrl.FilterNach =  function(row, idx){// фильтр начисления
    return !!row['Начислено'] && row['Начислено'].some(function(n){ return !!n; })
      || (row['Суточные/смены'] && !!row['Суточные/начислено'])
      || (row['отпускных дней'] && !!row['Отпускные/начислено'])
    ;
  };
  $ctrl.FilterOfis = function(row, idx){// фильтовать объекты Офис
     //~ var profile = $ctrl.RowProfile(row);
    //~ if ($ctrl['фильтр офис'] === undefined) return true;
    //~ if(!this && $ctrl['фильтр офис'] === undefined) return true;
    var re = /офис/i;
   return row["объекты/name"].some(function(n){ return re.test(n); });
    //~ if(this || $ctrl['фильтр офис']) return t;
    //~ else return !t;
  };
  /*$ctrl.FilterProfile = function(row, idx){// в lib
    //~ if (row["всего часов"][0] === 0) return false; // отсечь двойников
    if(!$ctrl.filterProfile) return true;
    var re = new RegExp($ctrl.filterProfile,"i");
    var profile = $ctrl.RowProfile(row);
    return re.test(profile.names.join(' '));// && ($ctrl.param['общий список'] || row["объекты"].some(function(oid){ return oid == obj.id; }));
  };*/
  /***логика фильтрации строк***/
  $ctrl.FilterData = function(row, idx) {// вернуть фильтующую функцию для объекта/бригады
    //~ console.log("FilterData", this);
    var obj = this;
    
    return ($ctrl.FilterObjects(row, idx, obj) || $ctrl.FilterBrigs(row, idx, obj))
      && (!$ctrl.param['фильтры']['профили'] || $ctrl.FilterProfile(row, idx))
      && ($ctrl.param['фильтры']['ИТР'] === undefined || ($ctrl.param['фильтры']['ИТР'] ? $ctrl.FilterITR(row, idx) : !$ctrl.FilterITR(row, idx)))
      && ($ctrl.param['фильтры']['начисления'] === undefined || ($ctrl.param['фильтры']['начисления']  ? $ctrl.FilterNach(row, idx) : !$ctrl.FilterNach(row, idx)))
      && ($ctrl.param['фильтры']['расчет ЗП'] === undefined || ($ctrl.param['фильтры']['расчет ЗП'] ? $ctrl.FilterCalcZP(row, idx) : !$ctrl.FilterCalcZP(row, idx)))
      //~ && $ctrl.FilterNachCalcZP(row, idx) 
      //~ && ($ctrl['фильтр офис'] === undefined || $ctrl['фильтр офис'] === true ? $ctrl.FilterOfis(row, idx) : !$ctrl.FilterOfis(row, idx))
      && ($ctrl.param['фильтры']['офис'] === undefined || ($ctrl.param['фильтры']['офис'] ? $ctrl.FilterOfis(row, idx) : !$ctrl.FilterOfis(row, idx)))
    ;
  };
  
  /**/
  
  $ctrl.FilterRow2 = function(item){// фильтрация строки двойника
    return item['профиль'] == this['профиль2/id'];
  };
  $ctrl.FilterRow1 = function(item){// фильтрация строки реал сотр
    return item['профиль'] == this['профиль1/id'];
  };
  $ctrl.FilterProfile1 = function(p){// фильтрация профиля реал сотр
    return p.id == this['профиль1/id'];
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
    //~ row['пересчитать сумму'] = true;
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
    //~ else /*нет суммы*/   будет в шаблоне
    $ctrl.DataSum(row);
    
    if (angular.isArray(row['Суточные']))  row['показать суточные'] = row['Суточные'].some(function(it){ return !!it; });
    else row['показать суточные'] = !!row['Суточные'];
    if (row['Суточные/начислено']) {
      row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
      row['Суточные/начислено'] = true;
    }
    if(row['показать суточные'] && !row['Суточные/сумма']) $ctrl.SumSut(row);
   
    if (row['отпускных дней']) {
      if (row['Отпускные/начислено']) {
        row['Отпускные/сумма'] = parseFloat(Util.numeric(row['Отпускные/начислено'])).toLocaleString('ru-RU');
        row['Отпускные/начислено'] = true;
      //~ } else {
        
      }
      if(!row['Отпускные/сумма']) $ctrl.SumOtp(row);
      //~ console.log("Отпускные/сумма", row['Отпускные/сумма']);
      /*$timeout(function(){*/row['показать отпускные'] = true; /*}, 1000);*/
      
    }
    

    //найти строку двойника
    if(!row._row2 && row['профиль2/id'] ) {
      row._row2 = $ctrl.InitRow($ctrl.data['данные'] .filter($ctrl.FilterRow2, row).pop());
      //~ row._row2._row1 = row;// цикличность
      if(row._row2) row._row2._profile['двойник'] = angular.copy(profile);
    } else if (!row._row1 && row['профиль1/id']) {// на реал профиль 
      //~ console.log("профиль1/id", row['профиль1/id']);
      var profile = $ctrl.allProfiles.filter($ctrl.FilterProfile1, row).pop();
      if (!profile) profile = ['не найден?'];
      row._profile1 =  profile;
      //~ row._row1 = angular.copy($ctrl.InitRow($ctrl.data['данные'] .filter($ctrl.FilterRow1, row).pop()));
      //~ row._row2._row1 = row;// цикличность
      //~ row._row1._profile['двойник'] = angular.copy(profile);
    }
    
    $ctrl.InitRowOverTime(row);// переработка
    
    row._init_done = true;
    return row;
    
  };
  
  $ctrl.Obj = function(row){// полноценные объекты
    
    if(row["объект"]) return [$ctrl.data['_объекты'][ row["объект"] ] ];//[$ctrl.FindObj(row["объект"])];
    
    if(row["объекты"]) return row["объекты"].map(function(oid){
      return $ctrl.data['_объекты'][ oid ];//$ctrl.FindObj(oid);
    });
    
  };
  //~ $ctrl.FilterObj = function(obj){ return obj.id == this; };
  //~ $ctrl.FindObj = function(oid){// найти объект по ИДу
    //~ return $ctrl.data['объекты'].filter($ctrl.FilterObj, oid).pop()
     //~ || $ctrl.data['бригады'].filter($ctrl.FilterObj, oid).pop();
  //~ };
  
  $ctrl.FilterRowObj = function(obj) {// фильтровать объекты внутри строки данных
    //~ if($ctrl.param['объект']) 
    if ($ctrl.param['общий список'] || $ctrl.param['бригада'] || $ctrl.param['общий список бригад'])     return $ctrl.FilterTrue;
    return function(oid){ return oid == obj.id; };
    
    
    
  };
  
  $ctrl.ConfirmValue = function (row, name, idx) {// подтвердить крыжик перед сохранением
    //~ console.log("ConfirmValue", $ctrl['modal-confirm-checkbox']);
    $ctrl['modal-confirm-checkbox'] = undefined;
    $timeout(function(){
      $ctrl['modal-confirm-checkbox'] = {"row":row, "name":name, "idx": idx};
      
      if (name == "Переработка/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Переработка/сумма'];
      } else if (name == "Суточные/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Суточные/сумма'];
      } else if (name == "Отпускные/начислено") {
        $ctrl['modal-confirm-checkbox'].sum = row['Отпускные/сумма'];
      } else if (idx === undefined) {
        $ctrl['modal-confirm-checkbox'].sum = row['Сумма'];
      } else {
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
      if (confirm.name =='Переработка/начислено') confirm.row['Переработка/начислено'] = confirm.row['Переработка/начислено'] === true ? null : true;
      else if (confirm.name =='Суточные/начислено') confirm.row['Суточные/начислено'] = confirm.row['Суточные/начислено'] === true ? null : true;
      else if (confirm.name =='Отпускные/начислено') confirm.row['Отпускные/начислено'] = confirm.row['Отпускные/начислено'] === true ? null : true;
      else if ( idx === undefined) confirm.row['Начислено'] = confirm.row['Начислено'] === true ? null : true;
      else confirm.row['Начислено'][idx] = confirm.row['Начислено'][idx] === true ? null : true;
    });
    $('#modal-confirm-checkbox').modal('close');
  };
  
  var saveValueTimeout;
  var numFields = ["Ставка","КТУ2", "Сумма", "Суточные/сумма", "Отпускные/сумма", "Переработка/сумма"]; //  влияют на сумму (часы тут не меняются)
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
      //~ if (idx !== undefined) {
        //~ if(!copy_row) copy_row = angular.copy(row);
        //~ copy_row['объект'] = row['объекты'][idx];
        //~ copy_row['коммент'] = row['коммент'][idx];
      //~ }
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
    } else if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
      if (idx === undefined) row['Сумма'] = null;
      else row['Сумма'][idx] = null;
    } else if (name == 'Суточные/ставка' ) {
      row['Суточные/сумма'] = null;
    } else if (name == 'Отпускные/ставка' ) {
      row['Отпускные/сумма'] = null;
    } else if (name == 'Переработка/начислено' ) {
      if(!copy_row) copy_row = angular.copy(row);
      copy_row['объект'] = 0;
      copy_row['коммент'] = row['Переработка/начислено'] ? row['Переработка/сумма'] : null;
    } else if (name == 'Переработка/ставка' ) {
      row['Переработка/сумма'] = null;
    }
    
    
    //~ row['пересчитать сумму'] = false; // для обновления суммы по профилю
    
    var emp;// флажок очищенного поля
    if (idx === undefined) emp =  row['коммент'] === '';
    else emp = row['коммент'][idx] === '';
    
    saveValueTimeout = $timeout(function(){
      saveValueTimeout = undefined;
       //~ console.log("Сохранить значение", row, event);
      $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), copy_row || row)
        .then(function(resp){
          if(resp.data.error) Materialize.toast('Ошибка сохранения', 3000, 'red');
          else Materialize.toast('Сохранено успешно: '+name, 1000, 'green');
          //~ if (num && name != 'Сумма') delete row['Сумма'];
          //~ console.log(resp.data);
          
          if (name == 'Сумма'){ // || name == 'Отпускные/сумма' || name == 'Суточные/сумма') {
            //~ if(name == 'Отпускные/сумма') $ctrl.SumOtp(row);
            //~ if(name == 'Суточные/сумма') $ctrl.SumSut(row);
            if(emp) {
              var sum = $ctrl.DataSumIdx(row, idx);
              if (idx !== undefined) row['Сумма'][idx] = sum.toLocaleString();
              else row['Сумма'] = sum.toLocaleString();
            }
          }
          if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
            //~ var sum1 = idx === undefined ? row['Сумма'] : row['Сумма'][idx];
            var sum = $ctrl.DataSumIdx(row, idx);
            if (idx !== undefined) row['Сумма'][idx] = sum.toLocaleString();
            else row['Сумма'] = sum.toLocaleString();
            //~ if (sum1) { // если стояла сумма - пересохранить
              $ctrl.SaveValue(row, 'Сумма', idx, {"коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
            //~ }
          }
          else if(name == 'Суточные/сумма') {
            if(emp) {
              $ctrl.SumSut(row); // пересчитать сумму суточных
              //~ $ctrl.SaveValue(row, 'Суточные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
            }
          }
          else if(name == 'Суточные/ставка') {
            $ctrl.SumSut(row); // пересчитать сумму суточных
            $ctrl.SaveValue(row, 'Суточные/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
          }
          else if(name == 'Переработка/ставка') {
            $ctrl.SumOverTime(row); // пересчитать сумму суточных
            $ctrl.SaveValue(row, 'Переработка/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
          }
          else if(name == 'Отпускные/сумма') {
            if (emp) {
              $ctrl.SumOtp(row);
              //~ $ctrl.SaveValue(row, 'Отпускные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
            }
          }
          else if(name == 'Отпускные/ставка') {
            $ctrl.SumOtp(row);
            $ctrl.SaveValue(row, 'Отпускные/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
          }
          
          
        });
      
    }, (name == 'Начислено' || name == 'Отпускные/начислено' || name == 'Суточные/начислено' ||  name == 'Переработка/начислено') ? 0 : 1000);
    return saveValueTimeout;
  };
  
  $ctrl.DataSum = function(row){// пересчет суммы денег по строке объекта только если там пусто

    //~ if (!force && !row['пересчитать сумму']) return true;
    if (angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx) {
      if( val === null || val === undefined) //{ === null
        var sum = $ctrl.DataSumIdx(row, idx);
        if(sum) row['Сумма'][idx] = sum.toLocaleString('ru-RU');
    });
    else if (row['Сумма'] === null || row['Сумма'] === undefined) {
      var sum = $ctrl.DataSumIdx(row);
      if(sum) row['Сумма'] = sum.toLocaleString('ru-RU');
    }
    
    //~ return true;
  };

  $ctrl.DataSumIdx = function(row, idx){// сумма денег по профилю/объекту
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    var ktu = (idx === undefined) ? parseFloat(Util.numeric(row['КТУ2'])) : parseFloat(Util.numeric(row['КТУ2'][idx]));
    var st = (idx === undefined) ? parseFloat(Util.numeric(row['Ставка'])) : parseFloat(Util.numeric(row['Ставка'][idx]));
    var count =  (idx === undefined) ? parseFloat(row[cname]) : parseFloat(row[cname][idx]);
    //~ console.log("сумма посчитана", row, count, ktu, st);
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
  
  var re_date = /\d+-\d+-\d+/;
  $ctrl.InitDetailRow = function(oid, row){
    //~ if(row._inited) return;
    row._object = $ctrl.data['_объекты'][oid];//$ctrl.FindObj(oid);
    row._total = 0;
    row._cnt = 0;
    angular.forEach(row, function(val, d){
      if (re_date.test(d) && val['значение']) {// только даты!
        var v = parseFloat(Util.numeric(val['значение']));//val['значение'].replace(text2numRE, '').replace(/,/, '.')
        if(v) {
          row._cnt++;
          row._total += v;
        }
      }
    });
    //~ row.cells = $ctrl.days.map(function(d){
      //~ var df = dateFns.format(d, 'YYYY-MM-DD');
      //~ var data = row[df] || {};
      //~ data._d = d;
      //~ return data;
    //~ });
  };
  $ctrl.InitDetailCell = function(row, d){// для детальной табл
    var df = dateFns.format(d, 'YYYY-MM-DD');
    var data = row[df] || {};
    data._d = d;
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