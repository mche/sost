(function () {'use strict';
/*
  движение ДС
*/

try {angular.module('MoneyTable');}
catch(e) {  angular.module('MoneyTable', []);}// тупая заглушка
  
var moduleName = "WaltexMoney";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'loadTemplateCache',  'appRoutes', 'ProjectList', 'TreeItem', 'WalletItem', 'ContragentItem', 'Объект или адрес', 'ProfileItem', 'MoneyTable']);//'MoneyWork' 

var Controll = function($scope, $attrs, $element, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {"создавать проект":true};
    $scope.moves = [
      {"id":0, "title": 'Все платежи', "icon": 'view_column', "class":'light-green lighten-2'},
      {"id":1, "title": 'Внешние платежи', "icon": 'all_out'},
      {"id":2, "title": 'Внутренние перемещения', "icon": 'swap_horiz'},
      {"id":3, "title": 'Расчеты по сотрудникам', "icon": 'group'}
    ];
    //~ ctrl.param = $scope.param;
    if($attrs.projectId) $scope.param["проект"] ={"id": parseInt($attrs.projectId)};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });// массив
  };
  
  ctrl.InitTabs = function(){
    //~ $timeout(function(){
      //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'transparent'});
    //~ });
    
  };
  
  ctrl.SelectProject = function(p){
    //~ console.log("SelectProject");
    $scope.param["проект"] = undefined;
    $scope.param.edit = undefined;
    if(!p) return;
    $timeout(function(){
      $scope.param["проект"] = p;
    });
  };
  
  ctrl.SelectMove = function(m){
    $scope.param.move  = undefined;
    $scope.param.edit = undefined;
    $scope.param.id = undefined;
    $timeout(function(){$scope.param.move  = m;});
    var main = $('main');
    if(m && m.id === 0) main.addClass('wide');
    else main.removeClass('wide');
  };
  
  ctrl.ReadyIf = function(){
    return ctrl.ready && $scope.param['проект'] && $scope.param['проект'].id !== 0 && $scope.param.move;
    
  };
  
  ctrl.TabClass = function(m){
    return m.class;
    
  };
};

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes, Util, WalletData, ContragentData){
  var $ctrl = this;
  
  //~ $ctrl.WatchEdit = function(){
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        
        if (newValue) {
          $ctrl.data = undefined;
          
          $timeout(function() {
            $ctrl.InitData(newValue);

          });
        } else {
          //~ $ctrl.data = undefined;
        }
      }
    );
  //~ };
  
  $ctrl.$onInit = function(){//data
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param = $ctrl.param;
    //~ if(data) $ctrl.data = data;
    //~ if(!$ctrl.data) $ctrl.data = {}; не тут
    

    
    //~ $ctrl.project =  $ctrl.param["проект/id"];
    
    if(!$ctrl.data && $ctrl.param.id) $ctrl.LoadData().then(function(){
      //~ $ctrl.InitData();
      $ctrl.ready = true;
      
    });
    else 
      //~ $timeout(function(){$ctrl.InitData();});
      $ctrl.ready = true;
    
    
  };
  
  
  $ctrl.LoadData = function(){//param
    //~ param = param || {};
    //~ if (param['кошелек2'] === undefined) param['кошелек2'] = $ctrl.param['кошелек2'];
    //~ if (param['кошелек2'] === undefined) param['кошелек2'] = $ctrl.param.move && $ctrl.param.move.id == 2;
    
    //~ console.log("строка движения ДС", param);
    return $http.post(appRoutes.url_for('строка движения ДС', $ctrl.param.id || 0), $ctrl.param)//, {"params": param}
      .then(function(resp){
        $ctrl.data= resp.data;
        
      }
      );
    
  };
  
  $ctrl.InitData = function(data){// data  - при редактировании
    if(data) $ctrl.data = data;
    $ctrl.param.edit = undefined;
    if (!$ctrl.data) $ctrl.data= {};
    
    delete $scope.Contragent;
    delete $scope.Category;
    delete $scope.Wallet;
    delete $scope.Wallet2;
    delete $scope.Profile;
    delete $scope.sum;
    //~ delete $ctrl.ready;
    
    
    //~ console.log("WaltexMoney InitData", $ctrl.data, $ctrl.param);
    //~ var Category = ;
    //~ if ($ctrl.data["категория/id"]) Category. = ;// "finalItem":{},"selectedIdx":[]
    $scope.Category = {topParent: {id:3}, selectedItem: {"id": $ctrl.data["категория/id"] || $ctrl.param['категория/id'] || ($ctrl.param['категория'] && $ctrl.param['категория'].id) || $ctrl.param['категория']}};
    $scope.CategoryData = $http.get(appRoutes.url_for('категории/список', 3));
    
    var Wallet = {};
    if ($ctrl.data["кошелек/id"]) Wallet.id= $ctrl.data["кошелек/id"];
    
    if ($ctrl.param["проект"]) Wallet["проект"]= $ctrl.param["проект"].id;
    if ($ctrl.data["проект/id"]) Wallet["проект"]= $ctrl.data["проект/id"];
    $scope.Wallet = Wallet;
    
    if ($ctrl.param['контрагент'] || $ctrl.data["контрагент/id"] || ($ctrl.param.move && ($ctrl.param.move.id == 1 || $ctrl.param.move.id === 0))) {
      var Contragent = {id: $ctrl.data["контрагент/id"] || $ctrl.param['контрагент/id'] || ($ctrl.param['контрагент'] && $ctrl.param['контрагент'].id) || $ctrl.param['контрагент']};
      //~ if ($ctrl.data["контрагент/id"]) Contragent.id= $ctrl.data["контрагент/id"] || ($ctrl.param['контрагент'] && $ctrl.param['контрагент'].id) || $ctrl.param['контрагент'];
      $scope.Contragent = Contragent;
      $ctrl.data["$объект"] = {id: $ctrl.data["объект/id"]};
    }
    
    if ($ctrl.param['кошелек2'] || $ctrl.data["кошелек2/id"] || ($ctrl.param.move && ($ctrl.param.move.id == 2 || $ctrl.param.move.id === 0))) {// кошельки всех проектов
      var Wallet2 = {id: $ctrl.data["кошелек2/id"] || $ctrl.param['кошелек2/id'] || ($ctrl.param['кошелек2'] && $ctrl.param['кошелек2'].id) || $ctrl.param['кошелек2']};
      //~ if ($ctrl.data["кошелек2/id"]) Wallet2.id= $ctrl.data["кошелек2/id"] || ($ctrl.param['кошелек2'] && $ctrl.param['кошелек2'].id) || $ctrl.param['кошелек2'];
      $scope.Wallet2 = Wallet2;
    }
    
    if ($ctrl.param['профиль'] || $ctrl.data["профиль/id"] || ($ctrl.param.move && ($ctrl.param.move.id == 3 || $ctrl.param.move.id === 0))) {// сотрудники
      var Profile = {id: $ctrl.data["профиль/id"] || $ctrl.param['профиль/id'] || ($ctrl.param['профиль'] && $ctrl.param['профиль'].id) || $ctrl.param['профиль']};
      //~ if ($ctrl.data["профиль/id"]) Profile.id= $ctrl.data["профиль/id"] || $ctrl.param['профиль'].id || $ctrl.param['профиль'];
      $scope.Profile = Profile;
      
      //~ $timeout(function(){// костыль доступа в начислении табеля ЗП
        //~ var l = $('profile-item div').length;//eq(0).contents()
        //~ if($('profile-item div').length === 0) $ctrl.ready = 'нет доступа'; /// не показывать форму
        
      //~ }, 100);
    }
    
    if ($ctrl.param['сумма']) $scope.sum = $ctrl.param['сумма'];
    $ctrl.parseSum();
    
    //~ $ctrl.ready = true;
    $ctrl.InitDate();
    
    //~ $ctrl.WatchEdit();
    
        /*Util.Scroll2El($element[0]);*/
    $timeout(function() {
      //~ if( !Util.isElementInViewport($element[0]) ) {
        var p = $($element[0]).parents().filter(function(){ return $(this).css('position') == 'fixed'; }).first();
        if (!p.length) p = $('html,body');
        p.animate({scrollTop: $($element[0]).offset().top}, 1500);
      //~ }
        $('textarea', $element[0]).keyup();
    });
    
  };

  /*
  $ctrl.SetDate = function (context) {// переформат
    //~ var d = $('input[name="date"]', $($element[0]));
    //~ $ctrl.data['дата'] = d.val();
   $ctrl.data['дата'] = $(this._hidden).val();
    //~ d.attr('title', d.val());
  };*/
  
  $ctrl.InitDate = function(){
    if(!$ctrl.data['дата']) $ctrl.data['дата'] = Util.dateISO(-1);//(new Date(d.setDate(d.getDate()-1))).toISOString().replace(/T.+/, '');// вчера
    
    $timeout(function() {
      
      $('.modal', $($element[0])).modal();

      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        onSet: function(context){ var s = this.component.item.select; $ctrl.data['дата'] = [s.year, s.month+1, s.date].join('-'); }//$ctrl.SetDate,
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
      
      //~ if(!$ctrl.data['дата']) $ctrl.SetDate();// переформат
      
    });
    
  };
  
  $ctrl.FilterObj  = function(item){/// по проекту
    if (!$ctrl.param["проект"].id) return true;
    return item.$проект.id == $ctrl.param["проект"].id;
    
  };
  
  $ctrl.Validate = function(){
    return (!!$scope.Category.selectedItem.id || $scope.Category.newItems && $scope.Category.newItems[0] && !!$scope.Category.newItems[0].title)
      && !!$scope.Wallet.title
      && (!!$ctrl.data['расход'] || !!$ctrl.data['приход']);
    
    
  };
  
  $ctrl.SaveBtn = function(){///
    
    delete $ctrl.error;
    $ctrl.data["категория"] = $scope.Category;
    $ctrl.data["кошелек"] = $scope.Wallet;
    if ($scope.Wallet2) $ctrl.data["кошелек2"] = $scope.Wallet2;
    if ($scope.Contragent) $ctrl.data["контрагент"] = $scope.Contragent;
    if ($scope.Profile) $ctrl.data["профиль"] = $scope.Profile;// сотрудник
    if(!$ctrl.data["проект/id"]) $ctrl.data["проект/id"] = $ctrl.param["проект"].id || $ctrl.param["проект"];
    $ctrl.data.move = $ctrl.param.move;
    
    //~ console.log($ctrl.data);
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('сохранить движение ДС'), $ctrl.data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.hasOwnProperty('error')) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 2000, 'green');
          if ($ctrl.data.id) {
            $ctrl.parseSum(resp.data.success);
            angular.forEach(resp.data.success, function(val, key){$ctrl.data[key]=val;});
            delete $ctrl.param.newX;
            
          } else {// новая запись
            //~ $timeout(function(){
            delete $ctrl.param.edit;
            resp.data.success._append = true;
            $ctrl.param.newX = resp.data.success;
            
          }
          $ctrl.CancelBtn();
          if($ctrl.onSave) $ctrl.onSave({"data": $ctrl.data});
          ContragentData.RefreshData();
          WalletData.Refresh();
          
          
        }
        console.log("Редактирование сохранено: ", resp.data);
        
      });
    
  };
  
  /*$ctrl.Edit = function(){
    //~ console.log("Edit", $ctrl.param);
    var data = $ctrl.param.edit;
    delete $ctrl.param.edit._init;
    $ctrl.$onInit(data);
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $($element[0]).offset().top //project-list
      }, 1500);
    });
  };*/
  
  $ctrl.parseSum = function(it) {//
    it = it || $ctrl.data;
    if(!it['сумма'] && $scope.sum) it['сумма'] = $scope.sum;
    if(!it['сумма']) return '';
    delete it["приход"];
    delete it["расход"];
    var sum = parseFloat(Util.numeric(it['сумма']));
    
    if(sum > 0) it["приход"] = Util.money(it['сумма']);//sum.toLocaleString('ru-RU');// it['сумма'];
    else if (it['сумма'].replace) it["расход"] = Util.money(it['сумма'].replace(/-/g, ""));//(-sum).toLocaleString('ru-RU');//(it['сумма']+'').replace(/-/g, "");
    else it["расход"] = -sum;
  };
  
  $ctrl.CancelBtn = function(){
    $ctrl.data = undefined;
    delete $ctrl.param.id;
    var data = $ctrl.param.edit || $ctrl.param.newX || $ctrl.param.delete;
    if (data && !data._delete) {// && !data._newInit && !data._delete
      //~ data['обновить'] = true;//передернуть строку
      
      //~ $timeout(function(){
        //~ delete data['обновить'];// передернуть строку
        //~ $ctrl.param.edit = data;

      //~ });
      
      
      $timeout(function(){
        var row = $("#money"+data.id);
        //~ Util.Scroll2El(row);
        if(row.length && !Util.isElementInViewport(row)) $('html,body').animate({scrollTop: row.offset().top}, 1500);
        //~ if(!Util.isElementInViewport(row)) $('html, body').animate({
            //~ scrollTop: row.offset().top
        //~ }, 1500);
        
      });
    }
    
    //~ $ctrl.$onInit();
    
  };
  
  $ctrl.DeleteBtn =function(){
    //~ console.log("DeleteBtn");
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('удалить запись движения ДС', $ctrl.data.id), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.success) {
          //~ $ctrl.data['удалить']=true;
          //~ $ctrl.param.delete = $ctrl.param.edit;
          //~ $ctrl.param.delete._delete = true;
          delete $ctrl.param.edit;
          //~ $ctrl.$onInit();
          if($ctrl.onSave) $ctrl.onSave({"data": $ctrl.data});
          $ctrl.CancelBtn();
          
        }
        console.log("Удалено: ", resp.data);
        
      });
  };
  
  $ctrl.ClearSum = function(){
    delete $ctrl.data['приход'];
    delete $ctrl.data['расход'];
    
  };
  
  /*
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit && newVal.edit._init)  return $ctrl.Edit();
  });*/
  
};

module

.controller('Controll', Controll)

.component('moneyForm', {
  templateUrl: "money/form",
  bindings: {
    data: '<',
    param: '<',
    onSave: '&',
  },
  controller: Component
})

;

}());