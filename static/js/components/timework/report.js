(function () {'use strict';
/*
*/
var moduleName = "TimeWorkReport";
try {angular.module(moduleName); return;} catch(e) { } 
//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['TemplateCache', 'appRoutes', 'WaltexMoney', 'Объекты', 'Util' , 'TimeWorkPayForm', 'TimeWorkReportLib']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  var tCache = TemplateCache.split(appRoutes.url_for('assets', 'timework/report.html'), 1);
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    
    tCache.then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

//~ var text2numRE = /[^\d,\.]/g;
//~ var text2numRE = /\s+|[^\d\.,]+[\d\.,]*/g;
  
//~ var Comp = (function(){/// пробы наследования var Comp !соотв! function Comp (...)
  //~ angular.module('OO')._.inherits(Comp, angular.module('Components')['комп1']);

var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,   TimeWorkReportLib,    appRoutes, Util) {  //function Comp
  var $c = this;
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($c);// [2].concat(args)
  //~ console.log("ctrl obj ", $c);
  
  new TimeWorkReportLib($c, $scope, /*$timeout,*/ $element/*, $http, $compile, appRoutes*/);
  
  $c.Log = function(){
    console.log(arguments);
  };
  
  $c.$onInit = function() {
    if(!$c.param) $c.param = {};
    if(!$c.param['фильтры']) $c.param['фильтры'] = {};
    if(!$c.param['месяц']) $c.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $c.data = {};
    
    //~ $c.param['общий список'] = true;
    
    var async = [];
    //~ async.push($c.LoadData());
    async.push($c.LoadProfiles());
    async.push($c.LoadObjects());
    async.push($c.LoadBrigs());
    $q.all(async).then(function(){
      
        
        //~ $c.param['общий список'] = true;
        //~ $c.LoadData().then(function(){
          $c.ready= true;
      
          $timeout(function() {
            //~ $('.tabs', $($element[0])).tabs();
            //~ $c.tabsReady = true;
            $('.modal', $($element[0])).modal({"dismissible": false,});
            $c.InitDays();
            $('select', $($element[0])).material_select();
            
          //~ $c['фильтр офис'] = null;
          //~ $('input[type="radio"]').siblings('label').click(function(event){ console.log("radio", eval($(this).siblings('input[type="radio"]').attr('ng-model'))); });
          });
          
          //~ $c.LoadProfiles();
          //~ $c.LoadObjects();
          $c.param['общий список'] = true;
          $c.LoadData().then(function(){
            $c.LoadBrigs();
            //~ $('#radioOfis2').click();
          });
          
          
      });
    //~ });
    
    
    
  };  
  
  $c.LoadData = function(){
    
    if(!$c.param['объект'] && !$c.param['общий список'] && !$c.param['бригада'] && !$c.param['общий список бригад']) return;//$q.defer().resolve();
    if (!$c.data['данные']) $c.data['данные'] = [];
    $c.data['данные'].length = 0;
    //~ $c['костыль для крыжика выплаты'] = undefined;
    //~ if (!$c.param['объект'] || !$c.param['месяц']) return;
    //~ var data = {"объект": $c.param['объект'], "месяц": $c.param['месяц']};
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = true;
    
    return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $c.param/*, {timeout: $c.cancelerHttp.promise}*/)//appRoutes.url_for('табель рабочего времени/отчет/данные')
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        $c.cancelerHttp = false;
        //~ angular.forEach(resp.data, function(val, key){$c.data[key] = val;});
        $c.data['пересечение объектов'] = resp.data.pop();// хвост в массиве профильных данных
        //~ console.log("пересечение объектов", $c.data['пересечение объектов'])
        //~ Object.keys($c.data['пересечение объектов']).map(function(pid){ $c.data['пересечение объектов'][pid] = $c.data['пересечение объектов'][pid]["json"].map(function(row){ return JSON.parse(row) }); });
        //~ console.log("пересечение объектов", $c.data['пересечение объектов']);
        Array.prototype.push.apply($c.data['данные'], resp.data.pop());
        $c.data['данные/профили']=undefined; // для фильтации по одному ФИО
        //~ if (!$c.autocompleteSelectProfile) $c.autocompleteSelectProfile = [];
        //~ $c.autocompleteSelectProfile.length = 0;
        //~ $c.filterProfile=undefined;
      },
        function(resp){// fail
          Materialize.Toast('Ошибка загрузки данных', 3000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp');
          //~ $c.cancelerHttp.resolve();
          //~ $c.cancelerHttp = $q.defer();
          //~ return $http.post(appRoutes.url_for('табель рабочего времени/отчет/данные'), $c.param, {timeout: $c.cancelerHttp.promise})//
            //~ .then(success_data);
          $c.cancelerHttp = false;
        }
      
      );
    
  };
  

  $c.FilterITR = function(row, idx){// только ИТР
    //~ if(!$c['фильтр ИТР']) return true;
    var profile = $c.RowProfile(row);
    return !!profile && !!profile['ИТР?'];
  };
  $c.FilterNach =  function(row, idx){// фильтр начисления
    return !!row['Начислено'] && row['Начислено'].some(function(n){ return !!n; })
      || (row['Суточные/смены'] && !!row['Суточные/начислено'])
      || (row['отпускных дней'] && !!row['Отпускные/начислено'])
      || !!row['Переработка/начислено']
    ;
  };
  

  /***логика фильтрации строк***/
  $c.FilterData = function(row, idx) {// вернуть фильтующую функцию для объекта/бригады
    //~ console.log("FilterData");
    var obj = this;
    //~ row._objOrBrig = {"id": obj.id};
    
    //~ if ($c._FilterDataProcess) $timeout.cancel($c._FilterDataProcess);
    //~ else $c._FilterDataProcess = $timeout(_FilterDataProcessDone, 1000);
    
    return ($c.FilterObjects(row, idx, obj) || $c.FilterBrigs(row, idx, obj))
      && (!$c.param['фильтры']['профили'] || $c.FilterProfile(row, idx))
      && ($c.param['фильтры']['ИТР'] === undefined || ($c.param['фильтры']['ИТР'] ? $c.FilterITR(row, idx) : !$c.FilterITR(row, idx)))
      && ($c.param['фильтры']['начисления'] === undefined || ($c.param['фильтры']['начисления']  ? $c.FilterNach(row, idx) : !$c.FilterNach(row, idx)))
      && ($c.param['фильтры']['расчет ЗП'] === undefined || ($c.param['фильтры']['расчет ЗП'] ? $c.FilterCalcZP(row, idx) : !$c.FilterCalcZP(row, idx)))
      && ($c.param['фильтры']['офис'] === undefined || ($c.param['фильтры']['офис'] ? $c.FilterOfis(row, idx) : !$c.FilterOfis(row, idx)))
      && ($c.param['фильтры']['путевые листы'] === undefined || ($c.param['фильтры']['путевые листы'] ? $c.FilterPL(row, idx) : !$c.FilterPL(row, idx)))/// путевые листы в названии объекта
      && ($c.param['фильтры']['доплата'] === undefined || ($c.param['фильтры']['доплата'] ? $c.FilterДоплата(row, idx) : !$c.FilterДоплата(row, idx)))/// двойники
    ;
  };
  
  /**/
  
  $c.FilterRow2 = function(item){// фильтрация строки двойника
    return item['профиль'] == this['профиль2/id'];
  };
  $c.FilterRow1 = function(item){// фильтрация строки реал сотр
    return item['профиль'] == this['профиль1/id'];
  };
  $c.FilterProfile1 = function(p){// фильтрация профиля реал сотр
    return p.id == this['профиль1/id'];
  };
  
  $c.FilterДоплата = function(row, idx){///двойники
    return !!row['профиль1/id'] || !!row._row2;
  };
  
  $c.InitRow = function(row, index){
    /*if($c.tableProcessed) $timeout.cancel($c.tableProcessed);
    $c.tableProcessed = $timeout(function(){
      $c.tableProcessed = undefined;
      //~ console.log("table Ready");
      //~ Util.ScrollTable($('table.scrollable'), $element[0]);
    }, 100);*/
    
    if(index !== undefined) row._index = index;
    if (!row || row._init_done) return row;// избежать повторной инициализации
    var profile = $c.RowProfile(row);
    if (!profile) return row;
    var fio = profile.names.join(' ');
    if (!$c.data['данные/профили']) $c.data['данные/профили'] = {};
    if(!$c.data['данные/профили'][fio]) $c.data['данные/профили'][fio] = profile;
    
    row._object = $c.Obj(row);
    if (!row._object) return row;
    row['месяц'] = $c.param['месяц'];
    //~ row['пересчитать сумму'] = true;
    row['стиль строки объекта'] = {"height": '2rem', "line-height": '2rem', /*"padding": '0.25rem 0rem'*/};

    
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
    
    row['Доп. часы замстрой/начислено'].map(function(val, idx){
      row['Доп. часы замстрой/начислено'][idx] = !!row['Доп. часы замстрой/начислено'][idx];
      
    });
    
    if (row['Сумма'] && !angular.isArray(row['Сумма'])) row['Сумма'] = parseFloat(Util.numeric(row['Сумма'])).toLocaleString('ru-RU');//row['Сумма'].replace(text2numRE, '').replace(/,/, '.')
    else if (row['Сумма'] && angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx){
      if(!val) return;
      row['Сумма'][idx] = parseFloat(Util.numeric(val)).toLocaleString('ru-RU');//val.replace(text2numRE, '').replace(/,/, '.')
      //~ else row['Сумма'][idx] = val.toLocaleString('ru-RU');
    });
    //~ else /*нет суммы*/   будет в шаблоне
    $c.DataSum(row);
    
    if (angular.isArray(row['Суточные']))  row['показать суточные'] = row['Суточные'].some(function(it){ return !!it; });
    else row['показать суточные'] = !!row['Суточные'];
    if (row['Суточные/начислено']) {
      row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
      row['Суточные/начислено'] = true;
    }
    if(row['показать суточные'] && !row['Суточные/сумма']) $c.SumSut(row);
   
    if (row['отпускных дней']) {
      if (row['Отпускные/начислено']) {
        row['Отпускные/сумма'] = parseFloat(Util.numeric(row['Отпускные/начислено'])).toLocaleString('ru-RU');
        row['Отпускные/начислено'] = true;
      //~ } else {
        
      }
      if(!row['Отпускные/сумма']) $c.SumOtp(row);
      //~ console.log("Отпускные/сумма", row['Отпускные/сумма']);
      /*$timeout(function(){*/row['показать отпускные'] = true; /*}, 1000);*/
      
    }
    

    //найти строку двойника
    if(!row._row2 && row['профиль2/id'] ) {
      row._row2 = $c.InitRow($c.data['данные'] .filter($c.FilterRow2, row).pop());
      //~ row._row2._row1 = row;// цикличность
      if(row._row2) row._row2._profile2 = angular.copy(profile);
      else  row._profile2 = angular.copy(profile);
    }
    else if (!row._row1 && row['профиль1/id']) {// на реал профиль 
      //~ console.log("профиль1/id", row['профиль1/id']);
      var p = $c.allProfiles.filter($c.FilterProfile1, row).pop();
      if (!profile) p = ['не найден?'];
      row._profile1 =  p;
      //~ row._row1 = angular.copy($c.InitRow($c.data['данные'] .filter($c.FilterRow1, row).pop()));
      //~ row._row2._row1 = row;// цикличность
      //~ row._row1._profile2 = angular.copy(profile);
    }
    
    $c.InitRowOverTime(row);// переработка
    $c.IsHandSum(row);
    if (!row['Переработка/сумма']) $c.SumOverTime(row);
    
    row._init_done = true;
    return row;
    
  };
  
  $c.Obj = function(row){// полноценные объекты
    
    if(row["объект"]) return [$c.data.$объекты[ row["объект"] ] ];//[$c.FindObj(row["объект"])];
    
    if(row["объекты"]) return row["объекты"].map(function(oid){
      return $c.data.$объекты[ oid ];//$c.FindObj(oid);
    });
    
  };
  //~ $c.FilterObj = function(obj){ return obj.id == this; };
  //~ $c.FindObj = function(oid){// найти объект по ИДу
    //~ return $c.data['объекты'].filter($c.FilterObj, oid).pop()
     //~ || $c.data['бригады'].filter($c.FilterObj, oid).pop();
  //~ };
  
  $c.FilterRowObj = function(obj) {// фильтровать объекты внутри строки данных
    //~ if($c.param['объект']) 
    if ($c.param['общий список'] || $c.param['бригада'] || $c.param['общий список бригад'])     return $c.FilterTrue;
    return function(oid){ return oid == obj.id; };
  };
  
  $c.ConfirmValue = function (row, name, idx) {// подтвердить крыжик перед сохранением
    //~ console.log("ConfirmValue", $c['modal-confirm-checkbox']);
    $c['modal-confirm-checkbox'] = undefined;
    $timeout(function(){
      $c['modal-confirm-checkbox'] = {"row":row, "name":name, "idx": idx};
      
      if (name == "Переработка/начислено") {
        $c['modal-confirm-checkbox'].sum = row['Переработка/сумма'];
      } else if (name == "Суточные/начислено") {
        $c['modal-confirm-checkbox'].sum = row['Суточные/сумма'];
      } else if (name == "Отпускные/начислено") {
        $c['modal-confirm-checkbox'].sum = row['Отпускные/сумма'];
      } else if (name == "Доп. часы замстрой/начислено") {
        $c['modal-confirm-checkbox'].sum = row['Доп. часы замстрой/сумма'][idx];
      } else if (idx === undefined) {
        $c['modal-confirm-checkbox'].sum = row['Сумма'];
      } else {
        $c['modal-confirm-checkbox'].sum = row['Сумма'][idx];
      }
      
      $('#modal-confirm-checkbox').modal('open');
      //~ $timeout(function(){$c['modal-confirm-checkbox'].ready = true;});
    });
  };
  $c.ConfirmValueOK = function () {// подтвердил крыжик нач
    $c.SaveValue($c['modal-confirm-checkbox'].row, $c['modal-confirm-checkbox'].name, $c['modal-confirm-checkbox'].idx); // row, name, idx
    //~ if ($c.param['фильтры']['начисления'] !== undefined)
    $c.RefreshTableS();
  };
  $c.ConfirmValueNOT = function() {// вернуть состояние крыжика
    var confirm = $c['modal-confirm-checkbox'];
    var idx= confirm.idx;
    $timeout(function(){
      if (confirm.name =='Переработка/начислено') confirm.row['Переработка/начислено'] = confirm.row['Переработка/начислено'] === true ? null : true;
      else if (confirm.name =='Суточные/начислено') confirm.row['Суточные/начислено'] = confirm.row['Суточные/начислено'] === true ? null : true;
      else if (confirm.name =='Отпускные/начислено') confirm.row['Отпускные/начислено'] = confirm.row['Отпускные/начислено'] === true ? null : true;
      else if (confirm.name =='Доп. часы замстрой/начислено') confirm.row['Доп. часы замстрой/начислено'][idx] = confirm.row['Доп. часы замстрой/начислено'][idx] === true ? null : true;
      else if ( idx === undefined) confirm.row['Начислено'] = confirm.row['Начислено'] === true ? null : true;
      else confirm.row['Начислено'][idx] = confirm.row['Начислено'][idx] === true ? null : true;
    });
    $('#modal-confirm-checkbox').modal('close');
  };
  
  var saveValueTimeout = {};
  var numFields = ["Ставка", "Суточные/ставка", "Отпускные/ставка", "Переработка/ставка", "КТУ2", "Сумма", "Суточные/сумма", "Отпускные/сумма", "Переработка/сумма", "Доп. часы замстрой/сумма"]; //  влияют на сумму (часы тут не меняются)
  const isNumField = function(n){
    var name = this;
    return n == name;
  };
  
  /*сохранение без задержки*/
  const Save = function(row, name, idx, data){//сохранить разные значения
    var num = numFields.some(isNumField, name);
    
    var save = {};
    
    if (idx === undefined) save['объект'] = row['объект'];
    else save['объект'] = row['объекты'][idx];
    
    save['профиль'] = row['профиль'];
    save['дата'] = dateFns.format($c.param['месяц'], 'YYYY-MM')+'-01';
    save['значение'] = name;
    
    
    if (num) {// к числу
      
      if(angular.isArray(row[name])) {
        row['коммент'] = row[name].map(function(val){
          if(!val) return val;
          val += '';
          //~ console.log("text2numRE", val);
          return parseFloat(Util.numeric(val));//val.replace(text2numRE, '').replace(/,/, '.')
        });
        row[name][idx] = row['коммент'][idx] && row['коммент'][idx].toLocaleString('ru-Ru');
      }
      else if (row[name]) {
        row['коммент'] = parseFloat(Util.numeric(row[name]));//row[name].replace(text2numRE, '').replace(/,/, '.')
        row[name] = row['коммент'] && row['коммент'].toLocaleString('ru-Ru');
      }
      else row['коммент'] = row[name];
      //~ if (idx !== undefined) {
        //~ row['коммент'][idx] = parseFloat(row[name][idx].replace(text2numRE, '').replace(/,/, '.'));
      //~ }
      
    } else {// Примечание и Начислено
      row['коммент'] = row[name];
    }
    
    if (idx === undefined) save['коммент'] = row['коммент'];
    else save['коммент'] = row['коммент'][idx];
    
    //~ var copy_row;
    if (data) {
      //~ copy_row = angular.copy(row);
      Object.keys(data).map(function(key){ save[key] = data[key]; });
    }
    
    if (name == 'Сумма' || name == 'Примечание') {
      //~ if (idx !== undefined) {
        //~ if(!copy_row) copy_row = angular.copy(row);
        //~ save['объект'] = row['объекты'][idx];
        //~ save['коммент'] = row['коммент'][idx];
      //~ }
    } else if (name == 'Начислено' ) {
      if (idx !== undefined) {
        //~ if(!copy_row) copy_row = angular.copy(row);
        //~ save['объект'] = row['объекты'][idx];
        save['коммент'] = row['Начислено'][idx] ? row['Сумма'][idx] : null;
      }  else save['коммент'] = row['Начислено'] ? row['Сумма'] : null;
    } else if (name == 'Доп. часы замстрой/начислено' ) {
      if (idx !== undefined) {
        //~ if(!copy_row) copy_row = angular.copy(row);
        //~ save['объект'] = row['объекты'][idx];
        save['коммент'] = row['Доп. часы замстрой/начислено'][idx] ? row['Доп. часы замстрой/сумма'][idx] : null;
      }  else save['коммент'] = row['Доп. часы замстрой/начислено'] ? row['Доп. часы замстрой/сумма'] : null;
    } else if (name == 'Суточные/начислено' ) {
      //~ if(!copy_row) copy_row = angular.copy(row);
      save['объект'] = 0;///чтобы без объекта
      save['коммент'] = row['Суточные/начислено'] ? row['Суточные/сумма'] : null;
    } else if (name == 'Отпускные/начислено' ) {
      //~ if(!copy_row) copy_row = angular.copy(row);
      save['объект'] = 0;///чтобы без объекта
      save['коммент'] = row['Отпускные/начислено'] ? row['Отпускные/сумма'] : null;
    } else if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
      if (idx === undefined) row['Сумма'] = null;
      else {
        //~ if(!copy_row) copy_row = angular.copy(row);
        //~ save['объект'] = row['объекты'][idx];
        //~ copy_row['коммент'] = row['коммент'][idx];
        row['Сумма'][idx] = null;
      }
    } else if (name == 'Суточные/ставка' ) {
      //~ if(!copy_row) copy_row = angular.copy(row);
      save['объект'] = 0;///чтобы без объекта
      row['Суточные/сумма'] = null;
    } else if (name == 'Отпускные/ставка' ) {
      //~ if(!copy_row) copy_row = angular.copy(row);
      save['объект'] = 0;///чтобы без объекта
      row['Отпускные/сумма'] = null;
    } else if (name == 'Переработка/начислено' ) {
      //~ if(!copy_row) copy_row = angular.copy(row);
      save['объект'] = 0;///чтобы без объекта
      save['коммент'] = row['Переработка/начислено'] ? row['Переработка/сумма'] : null;
    } else if (name == 'Переработка/ставка' ) {
      row['Переработка/сумма'] = null;
    }
    
    
    //~ row['пересчитать сумму'] = false; // для обновления суммы по профилю
    
    var emp;// флажок очищенного поля
    if (idx === undefined) emp =  row['коммент'] === '';
    else emp = row['коммент'][idx] === '';
    
    //~ saveValueTimeout[timeoutKey] = $timeout(function(){
      //~ saveValueTimeout[timeoutKey] = undefined;
       //~ console.log("Сохранить значение", row, event);
      
      if (!row._save) row._save = {};
      var saveKey = name+'-idx:'+idx;
      if (!row._save[saveKey]) row._save[saveKey] = [];
      row._save[saveKey].push(save);
      
      return $http.post(appRoutes.url_for('табель рабочего времени/сохранить значение'), save)///copy_row || row
        .then(function(resp){
          //~ console.log("Сохранение", "row[name]", row[name], idx, "save:", save, "resp:", resp.data);
          row._save[saveKey].splice(row._save[saveKey].indexOf(save), 1);
          if (!row._save[saveKey].length) delete row._save[saveKey];
          if(resp.data.error) return Materialize.toast('Ошибка сохранения: '+resp.data.error, 10000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
          //~ Materialize.toast('Сохранено успешно: '+name, 2000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
          //~ if (num && name != 'Сумма') delete row['Сумма'];
          //~ console.log(resp.data);
          $timeout(function(){ $c.IsHandSum(row); });
          
          if (name == 'Сумма'){ // || name == 'Отпускные/сумма' || name == 'Суточные/сумма') {
            //~ if(name == 'Отпускные/сумма') $c.SumOtp(row);
            //~ if(name == 'Суточные/сумма') $c.SumSut(row);
            if(emp) {
              var sum = $c.DataSumIdx(row, idx);
              if (idx !== undefined && sum) row['Сумма'][idx] = sum.toLocaleString();
              else if (sum) row['Сумма'] = sum.toLocaleString();
              //~ $timeout(function(){ $c.IsHandSum(row); });
            }
            
          }
          
          if(['КТУ2', 'Ставка'].some(function(n){ return n == name;})) {// сбросить сумму - будет расчетной
            //~ var sum1 = idx === undefined ? row['Сумма'] : row['Сумма'][idx];
            var s = $c.DataSumIdx(row, idx);
            if (idx !== undefined && s) row['Сумма'][idx] = s.toLocaleString();
            else if (s) row['Сумма'] = s.toLocaleString();
            //~ if (sum1) { // если стояла сумма - пересохранить
              //~ $c.SaveValue(row, 'Сумма', idx, {"коммент": null,});
              Save(row, 'Сумма', idx, {"коммент": null,});
                //~ .then(function(){ $c.IsHandSum(row); });///row['пересчитать сумму'] = true;
            //~ }
          }
          else if(name == 'Суточные/сумма') {
            if(emp) {
              $c.SumSut(row); // пересчитать сумму суточных
              //~ $c.SaveValue(row, 'Суточные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
            }
          }
          else if(name == 'Суточные/ставка') {
            $c.SumSut(row); // пересчитать сумму суточных
            //~ $c.SaveValue(row, 'Суточные/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
            Save(row, 'Суточные/сумма', undefined, {"объект": 0, "коммент": null,});
          }
          else if(name == 'Переработка/ставка') {
            $c.SumOverTime(row); // пересчитать сумму суточных
            //~ $c.SaveValue(row, 'Переработка/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
            Save(row, 'Переработка/сумма', undefined, {"объект": 0, "коммент": null,});
          }
          else if(name == 'Переработка/сумма') {
            if (emp) {
              $c.SumOverTime(row); // пересчитать сумму суточных
              //~ $c.SaveValue(row, 'Переработка/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
            }
            
          }
          else if(name == 'Отпускные/сумма') {
            if (emp) {
              $c.SumOtp(row);
              //~ $c.SaveValue(row, 'Отпускные/сумма', undefined, {"объект": 0});//.then(function(){ row['пересчитать сумму'] = true; });
            }
          }
          else if(name == 'Отпускные/ставка') {
            $c.SumOtp(row);
            //~ $c.SaveValue(row, 'Отпускные/сумма', undefined, {"объект": 0, "коммент": null,});//.then(function(){ row['пересчитать сумму'] = true; });
            Save(row, 'Отпускные/сумма', undefined, {"объект": 0, "коммент": null,});
          }
          
          
        }, function(){
          Materialize.toast('Ошибка сохранения. Проверьте работу сети', 10000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        });
      
    //~ }, (name == 'Начислено' || name == 'Отпускные/начислено' || name == 'Суточные/начислено' ||  name == 'Переработка/начислено' || name == 'Доп. часы замстрой/начислено') ? 0 : 1000);
    //~ return saveValueTimeout[timeoutKey];
  };
  
  $c.SaveValue = function(row, name, idx, data){//сохранить разные значения
    //~ console.log("SaveValue", row, name, idx);
    var timeoutKey = row['профиль']+name;
    if (saveValueTimeout[timeoutKey]) $timeout.cancel(saveValueTimeout[timeoutKey]);
    saveValueTimeout[timeoutKey] = $timeout(function(){
      saveValueTimeout[timeoutKey] = undefined;
      Save(row, name, idx, data);
    }, (name == 'Начислено' || name == 'Отпускные/начислено' || name == 'Суточные/начислено' ||  name == 'Переработка/начислено' || name == 'Доп. часы замстрой/начислено') ? 0 : 1000);
    return saveValueTimeout[timeoutKey];
    
  };
  
  $c.DataSum = function(row){// пересчет суммы денег по строке объекта только если там пусто
    if (angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx) {
      if( val === null || val === undefined) /*{ === null*/  {
        var sum = $c.DataSumIdx(row, idx);
        if(sum) row['Сумма'][idx] = sum.toLocaleString('ru-RU');
      }
    });
    else if (row['Сумма'] === null || row['Сумма'] === undefined) {
      var sum = $c.DataSumIdx(row);
      if(sum) row['Сумма'] = sum.toLocaleString('ru-RU');
    }
  };

  $c.DataSumIdx = function(row, idx){// сумма денег по профилю/объекту
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    var ktu = (idx === undefined) ? parseFloat(Util.numeric(row['КТУ2'])) : parseFloat(Util.numeric(row['КТУ2'][idx]));
    var st = (idx === undefined) ? parseFloat(Util.numeric(row['Ставка'])) : parseFloat(Util.numeric(row['Ставка'][idx]));
    var count =  (idx === undefined) ? parseFloat(row[cname]) : parseFloat(row[cname][idx]);
    //~ console.log("сумма посчитана", row, count, ktu, st);
    return Math.round(count * ktu * st);
  };
  
  ///сумма ручная или по ставке и КТУ
  $c.IsHandSum = function(row){
    if (!row['это ручная сумма']) row['это ручная сумма'] = [];///для объектов
    var cname = row._profile['ИТР?'] ? 'всего смен' : 'всего часов';
    
    //~ $timeout(function(){///!!! ПРОБЛЕМЫ
      row['объекты'].map(function(o, index){///по объектам
        if (!row['Ставка'][index]) return row['это ручная сумма'][index] = false;
        
        var calc = Math.round(parseFloat(Util.numeric(row['КТУ2'][index] || row['КТУ1'][index]) || 1)
          * parseFloat(Util.numeric(row['Ставка'][index] || 0))
          * parseFloat(Util.numeric(row[cname][index] || 0)));
        //~ console.log('IsHandSum', parseFloat(Util.numeric(row['КТУ2'][index] || row['КТУ1'][index]) || 1), parseFloat(Util.numeric(row['Ставка'][index] || 0)) , parseFloat(Util.numeric(row[cname][index] || 0)));
        
        row['это ручная сумма'][index] = calc  != parseFloat(Util.numeric(row['Сумма'][index]) || -1);
        //~ return ///(!!row['Начислено'][index] || parseFloat(row['РасчетЗП/флажок']) >= 0)    && 
          //~ calc  != parseFloat(Util.numeric(row['Сумма'][index]) || -1);
        
        
      });
      
      if (!row['Переработка/ставка']) row['это ручная сумма/переработка'] = false;
      else {
        var calc = Math.round(parseFloat(Util.numeric(row['Переработка/ставка'] || 0)) * parseFloat(Util.numeric(row['всего/переработка/часов'] || 0)));
        row['это ручная сумма/переработка'] = calc  != parseFloat(Util.numeric(row['Переработка/сумма']) || -1);
      }
      
      if (!row['Отпускные/ставка']) row['это ручная сумма/отпускные'] = false;
      else {
        var calc = Math.round(parseFloat(Util.numeric(row['Отпускные/ставка'] || 0)) * parseFloat(Util.numeric(row['отпускных дней'] || 0)));
        row['это ручная сумма/отпускные'] = calc  != parseFloat(Util.numeric(row['Отпускные/сумма']) || -1);
      }
      
      if (!row['Суточные/ставка']) row['это ручная сумма/Суточные'] = false;
      else {
        var calc;
        if(angular.isArray(row['Суточные/ставка'])) row['Суточные/ставка'].map(function(it, idx){ if(it) calc = Math.round(parseFloat(Util.numeric(it)) * parseFloat(Util.numeric(/*row['всего смен'][idx]*/ row['Суточные'][idx])));  });
        else calc = Math.round(parseFloat(Util.numeric(row['Суточные/ставка'])) * parseFloat(Util.numeric(/*row['всего смен']*/ row['Суточные'])));
        row['это ручная сумма/Суточные'] = calc  != parseFloat(Util.numeric(row['Суточные/сумма']) || -1);
      }
      
    //~ });
    
    
    
    
  };

   /*************Детально по профилю*************/
  $c.ShowDetail = function(row){// показать по сотруднику модально детализацию
    if(row) $c.showDetail = row;
    else row = $c.showDetail;
    
    //~ console.log("$c.ShowDetail", row);
    
    row['табель'] = undefined;
    $http.post(appRoutes.url_for('табель рабочего времени/отчет/детально'), {"профиль": row["профиль"], "месяц": row["месяц"],}).then(function(resp){
      //~ Array.prototype.push.apply(row['детально'], resp.data);
      row['табель'] = resp.data;
    });
    
    row['параметры расчетов'] = undefined;
    row['параметры расчетов2'] = undefined;
    return $timeout(function(){
      row['параметры расчетов'] = $c.ParamDetail(row);//{"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}}; // параметры для компонента waltex/money/table+form
      //~ row['данные формы ДС'] = {'профиль/id': row["профиль"], 'категория/id': 569};
      if(row._row2) {
        //~ var row2 = angular.copy(row);
        //~ row2['профиль'] = row['профиль2/id'];
        //~ row.names = row['профиль2'];
        row['параметры расчетов2'] = $c.ParamDetail(row._row2);
        row['параметры расчетов'].table['профили'] = [row._profile, row._row2._profile];// 
        //~ row['параметры расчетов']['_профиль'] = row._profile;
        row['параметры расчетов']['профили'][1] = row._row2._profile;
      }
    });
    
  };

  
  $c.InitDays = function(){// для детальной табл
    $c.days = dateFns.eachDay(dateFns.startOfMonth($c.param['месяц']), dateFns.endOfMonth($c.param['месяц']));//.map(function(d){ return dateFns.getDate(d);});//
  };
  $c.FormatThDay = function(d){// для детальной табл
    return [dateFns.format(d, 'dd', {locale: dateFns.locale_ru}), dateFns.getDate(d)];
  };
  $c.IsSunSat = function(d){// для детальной табл
    var wd = dateFns.format(d, 'd');
    return wd == 0 || wd == 6;
  };
  
  var re_date = /\d+-\d+-\d+/;
  $c.InitDetailRow = function(oid, row){
    //~ if(row._inited) return;
    row._object = $c.data.$объекты[oid];//$c.FindObj(oid);
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
    //~ row.cells = $c.days.map(function(d){
      //~ var df = dateFns.format(d, 'YYYY-MM-DD');
      //~ var data = row[df] || {};
      //~ data._d = d;
      //~ return data;
    //~ });
  };
  $c.InitDetailCell = function(row, d){// для детальной табл
    var df = dateFns.format(d, 'YYYY-MM-DD');
    var data = row[df] || {};
    data._d = d;
    return data;
  };
  $c.TotalTabel = function(name){
    var total = 0;
    if($c.showDetail)  angular.forEach($c.showDetail['табель'], function(row){
      total += row[name];
      
    });
    
    return total;
  };
  
  var rowSaving = function(key){ return this._save[key] && this._save[key].length; };
  $c.ShowSaving = function(row, name, index){///если только row тогда все сохранения
    if (!row._save) return;
    var keys = Object.keys(row._save);
    if (!keys.length) return;
    if (name/* && index !== undefined*/) {
      var key = name+'-idx:'+index;
      return row._save[key] && row._save[key].length;
    }
    //~ console.log('ShowSaving row');
    return keys.some(rowSaving, row);
    
  };

  
  //~ $c.StyleDisabledChb = function(disabled){
    //~ if (disabled) return {"color": 'transparent !important'};
    //~ return {};
  //~ };
  
};
//~ return Comp;
//~ })();

//----------------------------------------------------------------

//~ var CompCalc = function($scope, $http, $q, $timeout, $element){
  
  
//~ };

/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeWorkReport', {
  controllerAs: '$c',
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