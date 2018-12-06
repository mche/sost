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
      {"id":0, "title": 'Все платежи', "icon": 'view_column', "class":'grey'},
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
    return m.class+' '+(m === $scope.param.move ? '' : 'z-depth-1');
    
  };
};

/******************************************************/

var Component = function($scope, $rootScope, $element, $timeout, $http, $q, appRoutes, Util, WalletData, $Контрагенты){
  var $c = this;
  var $ctrl = this;
  
  $scope.$on('Движение ДС/редактировать запись', function(event, data) {
    $c.data = undefined;
          
    $timeout(function() {
      $c.InitData(data);

    });
  });
  
  $c.$onInit = function(){//data
    if(!$c.param) $c.param = {};
    $scope.param = $c.param;
    //~ if(data) $c.data = data;
    //~ if(!$c.data) $c.data = {}; не тут
    
    if(!$c.data && $c.param.id) $c.LoadData().then(function(){
      //~ $c.InitData();
      $c.ready = true;
      
    });
    else $timeout(function(){
      ///$c.InitData();
      $c.ready = true;
      
    });
    
  };
  
  
  $c.LoadData = function(){//param
    //~ console.log("строка движения ДС", param);
    return $http.post(appRoutes.url_for('строка движения ДС', $c.param.id || 0), $c.param)//, {"params": param}
      .then(function(resp){
        $c.data= resp.data;
      }
      );
    
  };
  
  $c.InitData = function(data){// data  - при редактировании
    if(data) $c.data = data;
    $c.param.edit = undefined;
    if (!$c.data) $c.data= {};
    
    delete $scope.Contragent;
    delete $scope.Category;
    delete $scope.Wallet;
    delete $scope.Wallet2;
    delete $scope.Profile;
    delete $scope.sum;
    //~ delete $c.ready;
    
    
    //~ console.log("WaltexMoney InitData", $c.data, $c.param);
    //~ var Category = ;
    //~ if ($c.data["категория/id"]) Category. = ;// "finalItem":{},"selectedIdx":[]
    $scope.Category = {topParent: {id:3}, selectedItem: {"id": $c.data["категория/id"] || $c.param['категория/id'] || ($c.param['категория'] && $c.param['категория'].id) || $c.param['категория']}};
    $scope.CategoryData = $http.get(appRoutes.url_for('категории/список', 3));
    
    var Wallet = {};
    if ($c.data["кошелек/id"]) Wallet.id= $c.data["кошелек/id"];
    
    if ($c.param["проект"]) Wallet["проект"]= $c.param["проект"].id;
    if ($c.data["проект/id"]) Wallet["проект"]= $c.data["проект/id"];
    $scope.Wallet = Wallet;
    
    if ($c.param['контрагент'] || $c.data["контрагент/id"] || ($c.param.move && ($c.param.move.id == 1 || $c.param.move.id === 0))) {
      var Contragent = {id: $c.data["контрагент/id"] || $c.param['контрагент/id'] || ($c.param['контрагент'] && $c.param['контрагент'].id) || $c.param['контрагент']};
      //~ if ($c.data["контрагент/id"]) Contragent.id= $c.data["контрагент/id"] || ($c.param['контрагент'] && $c.param['контрагент'].id) || $c.param['контрагент'];
      $scope.Contragent = Contragent;
      $c.data["$объект"] = {id: $c.data["объект/id"]};
    }
    
    if ($c.param['кошелек2'] || $c.data["кошелек2/id"] || ($c.param.move && ($c.param.move.id == 2 || $c.param.move.id === 0))) {// кошельки всех проектов
      var Wallet2 = {id: $c.data["кошелек2/id"] || $c.param['кошелек2/id'] || ($c.param['кошелек2'] && $c.param['кошелек2'].id) || $c.param['кошелек2']};
      //~ if ($c.data["кошелек2/id"]) Wallet2.id= $c.data["кошелек2/id"] || ($c.param['кошелек2'] && $c.param['кошелек2'].id) || $c.param['кошелек2'];
      $scope.Wallet2 = Wallet2;
    }
    
    if ($c.param['профиль'] || $c.data["профиль/id"] || ($c.param.move && ($c.param.move.id == 3 || $c.param.move.id === 0))) {// сотрудники
      var Profile = {id: $c.data["профиль/id"] || $c.param['профиль/id'] || ($c.param['профиль'] && $c.param['профиль'].id) || $c.param['профиль']};
      //~ if ($c.data["профиль/id"]) Profile.id= $c.data["профиль/id"] || $c.param['профиль'].id || $c.param['профиль'];
      $scope.Profile = Profile;
      
      //~ $timeout(function(){// костыль доступа в начислении табеля ЗП
        //~ var l = $('profile-item div').length;//eq(0).contents()
        //~ if($('profile-item div').length === 0) $c.ready = 'нет доступа'; /// не показывать форму
        
      //~ }, 100);
    }
    
    if ($c.param['сумма']) $scope.sum = $c.param['сумма'];
    $c.parseSum();
    
    //~ $c.ready = true;
    $c.InitDate();
    
    //~ $c.WatchEdit();
    
        /*Util.Scroll2El($element[0]);*/
    $timeout(function() {
      //~ if( !Util.isElementInViewport($element[0]) ) {
        var p = $($element[0]).parents().filter(function(){ return $(this).css('position') == 'fixed'; }).first();
        if (p.length) p.get(0).scrollTop += 500;///500
        else {
          p = $('html,body');
          p.animate({scrollTop: $($element[0]).offset().top-200}, 1500);
        }
        $('textarea', $element[0]).keyup();
    });
    
  };

  /*
  $c.SetDate = function (context) {// переформат
    //~ var d = $('input[name="date"]', $($element[0]));
    //~ $c.data['дата'] = d.val();
   $c.data['дата'] = $(this._hidden).val();
    //~ d.attr('title', d.val());
  };*/
  
  $c.InitDate = function(){
    if ($c.param['дата'] && !$c.data['дата']) $c.data['дата'] = $c.param['дата'];
    if(!$c.data['дата']) $c.data['дата'] = Util.dateISO(-1);//(new Date(d.setDate(d.getDate()-1))).toISOString().replace(/T.+/, '');// вчера
    
    $timeout(function() {
      
      $('.modal', $($element[0])).modal();

      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        onSet: function(context){ var s = this.component.item.select; $c.data['дата'] = [s.year, s.month+1, s.date].join('-'); }//$c.SetDate,
        //~ min: $c.data.id ? undefined : new Date()
        //~ editable: $c.data.transport ? false : true
      });//{closeOnSelect: true,}
      
    });
    
  };
  
  $c.FilterObj  = function(item){/// по проекту
    if (!$c.param["проект"].id) return true;
    return item.$проект.id == $c.param["проект"].id;
    
  };
  
  $c.Validate = function(){
    return $scope.Category && (!!$scope.Category.selectedItem.id || $scope.Category.newItems && $scope.Category.newItems[0] && !!$scope.Category.newItems[0].title)
      && $scope.Wallet && !!$scope.Wallet.title
      && (!!$c.data['расход'] || !!$c.data['приход'])
      && !!(($scope.Contragent && $scope.Contragent.title) || ($scope.Wallet2 && $scope.Wallet2.title) || ($scope.Profile && $scope.Profile.id))
    ;
    
    
  };
  
  $c.SaveBtn = function(){///
    
    delete $c.error;
    $c.data["категория"] = $scope.Category;
    $c.data["кошелек"] = $scope.Wallet;
    if ($scope.Wallet2) $c.data["кошелек2"] = $scope.Wallet2;
    if ($scope.Contragent) $c.data["контрагент"] = $scope.Contragent;
    //~ else $c.data["$объект"] && ($c.data["$объект"].id = undefined);
    if ($scope.Profile) $c.data["профиль"] = $scope.Profile;// сотрудник
    if(!$c.data["проект/id"]) $c.data["проект/id"] = $c.param["проект"].id || $c.param["проект"];
    $c.data.move = $c.param.move;
    
    //~ console.log($c.data);
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = true;
    
    $http.post(appRoutes.url_for('сохранить движение ДС'), $c.data)///, {timeout: $c.cancelerHttp.promise}
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data.hasOwnProperty('error')) $c.error = resp.data.error;
        if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 4000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          $rootScope.$broadcast('Движение ДС/запись сохранена', resp.data.success);
          /*if ($c.data.id) {
            $c.parseSum(resp.data.success);
            angular.forEach(resp.data.success, function(val, key){$c.data[key]=val;});
            delete $c.param.newX;
            
          } else {// новая запись
            //~ $timeout(function(){
            delete $c.param.edit;
            resp.data.success._append = true;
            $c.param.newX = resp.data.success;
            
          }*/
          $c.CancelBtn();
          if($c.onSave) $c.onSave({"data": $c.data});
          $Контрагенты.RefreshData();
          WalletData.Refresh();
          
          
        }
        console.log("Редактирование сохранено: ", resp.data);
        
      });
    
  };
  
  /*$c.Edit = function(){
    //~ console.log("Edit", $c.param);
    var data = $c.param.edit;
    delete $c.param.edit._init;
    $c.$onInit(data);
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $($element[0]).offset().top //project-list
      }, 1500);
    });
  };*/
  
  $c.parseSum = function(it) {//
    it = it || $c.data;
    if(!it['сумма'] && $scope.sum) it['сумма'] = $scope.sum;
    if(!it['сумма']) return '';
    delete it["приход"];
    delete it["расход"];
    var sum = parseFloat(Util.numeric(it['сумма']));
    
    if(sum > 0) it["приход"] = Util.money(it['сумма']);//sum.toLocaleString('ru-RU');// it['сумма'];
    else if (it['сумма'].replace) it["расход"] = Util.money(it['сумма'].replace(/-/g, ""));//(-sum).toLocaleString('ru-RU');//(it['сумма']+'').replace(/-/g, "");
    else it["расход"] = -sum;
  };
  
  $c.CancelBtn = function(){
    $('.card:first', $element[0]).addClass('animated zoomOutUp');
    
    delete $c.param.id;
      $timeout(function(){
        $c.data = undefined;
        //~ var row = $("#money"+data.id);
        //~ if(row.length && !Util.isElementInViewport(row)) $('html,body').animate({scrollTop: row.offset().top}, 1500);
        //~ if(!Util.isElementInViewport(row)) $('html, body').animate({
            //~ scrollTop: row.offset().top
        //~ }, 1500);
        
      }, 400);///согласно анимации

    
  };
  
  $c.DeleteBtn =function(){
    //~ console.log("DeleteBtn");
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    
    $c.cancelerHttp  = true;
    
    $http.get(appRoutes.url_for('удалить запись движения ДС', $c.data.id))///, {timeout: $c.cancelerHttp.promise}
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data.success) {
          Materialize.toast('Удалено успешно', 2000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          //~ $c.data['удалить']=true;
          //~ $c.param.delete = $c.param.edit;
          //~ $c.param.delete._delete = true;
          delete $c.param.edit;
          //~ $c.$onInit();
          if($c.onSave) $c.onSave({"data": $c.data});
          $c.CancelBtn();
          $rootScope.$broadcast('Движение ДС/удалено', resp.data.success);
        }
        console.log("Удалено: ", resp.data);
        
      });
  };
  
  $c.ClearSum = function(){
    delete $c.data['приход'];
    delete $c.data['расход'];
    
  };
  
};

module

.controller('Controll', Controll)

.component('moneyForm', {
  controllerAs: '$c',
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