(function () {'use strict';
/*
  Перемещения с объекта на объект
*/

var moduleName = "ТМЦ форма перемещения";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', /*'Util',*/ 'appRoutes', 'TMCFormLib', 'Номенклатура',]);//'ngSanitize',, 'dndLists'

var Ctrl = function  ($scope, /*$rootScope,*/ $q, $timeout, $http, $element, appRoutes, TMCFormLib, NomenData) {
  var $ctrl = this;
  
  new TMCFormLib($ctrl, $scope, $element);
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    $scope.paramObject={"placeholder": 'указать объект-получатель', 'без проекта': true, 'только объекты':true,};
    $scope.nomenData = NomenData.Load(0);//$http.get(appRoutes.url_for('номенклатура/список', 0));
    $ctrl.ready = true;
    
    $scope.$on('Редактировать перемещение ТМЦ', function(event, ask){
      $ctrl.Cancel();
      $timeout(function(){ $ctrl.Open(ask); });
    });
  };
  
  $ctrl.InitData = function(data){
    data = angular.copy(data) || {};
    return {
      id: data.id,
      "объект": $ctrl.param["объект"].id,
      "дата1": data['дата1'],
      "$с объекта": data['$с объекта'] || $ctrl.param['объект'],
      "$грузоотправители": data['$грузоотправители'] || [$ctrl.param['объект']['$контрагент']],
      "$позиции тмц": data['$позиции тмц'],
      "коммент": data['коммент'],
      
    };
  };
  
  $ctrl.Open = function(data){// новая или редактирование
    if($ctrl.data && $ctrl.data._open) return;
    if(data) $ctrl.data = $ctrl.InitData(data);
    if(!$ctrl.data) $ctrl.data = $ctrl.InitData();
    if(!$ctrl.data.id && !$ctrl.data['$позиции тмц'] || $ctrl.data['$позиции тмц'].length ===0) $ctrl.AddPos();
    $ctrl.data._open = true;
    //~ $ctrl.data._success_save = false;
    $timeout(function(){
        $('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $ctrl.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
        
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
      });
  };
  
  $ctrl.InitAsk = function(ask){
    //~ console.log("InitAsk", $ctrl.data);
    $scope.ask = ask || $ctrl.data;
    
  };
  
  $ctrl.FilterValidPos = function(row){
    var object = $ctrl.FilterValidPosObject(row);
    var nomen = $ctrl.FilterValidPosNomen(row);
    var kol = $ctrl.FilterValidPosKol(row);
    //~ var cena = $ctrl.FilterValidPosCena(row);
    return object && nomen && kol;// && cena;
  };
  
  $ctrl.Save = function(ask){
    if(!ask) {// проверка
      ask = $ctrl.data;
      if(!ask["$позиции тмц"].length) return false;
      return ask['дата1']
        //~ && ask.contragent4.filter(function(item){ return item.id || item.title; }).length
        //~ && $ctrl.ValidAddress1()//ask.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
        && $ctrl.ValidPos(ask);
    }
    //~ ask['объект'] = $ctrl.param["объект"].id;
    if (!ask.id) ask['$позиции тмц'].map(function(tmc){ tmc['дата1'] = ask['дата1'] });
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить перемещение'), ask/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
        }
        //~ console.log("Save", resp.data);
        if(resp.data.success) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green');
          $ctrl.ready = false;
          window.location.href = window.location.pathname+'?id='+resp.data.success.id;
        }
        console.log("Saved:", resp.data);
      });
  };
  
};

/*=============================================================*/

module

.component('tmcBazaForm', {
  templateUrl: "tmc/baza/form",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Ctrl,
})

;

}());