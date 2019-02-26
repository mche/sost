(function () {'use strict';
/*
  Форма простой обработки снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ/простая форма снабжения";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem',  'Util', 'Номенклатура', 'Объект или адрес', 'ContragentItem',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, $Номенклатура, $Контрагенты) {
  var $c = this;
  
  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    /***if (!$c.data['$номенклатура']) $c.data['$номенклатура'] = {};
    if (!$c.data['$строка тмц/поставщик']) $c.data['$строка тмц/поставщик'] = $c.data['@строки тмц'].filter($c.FilterTMC, 'поставщик').pop() || {"количество":undefined,"коммент":undefined,};
    if (!$c.data['$строка тмц/поставщик']['количество']) $c.data['$строка тмц/поставщик']['количество'] = $c.data['$тмц/заявка']['количество'];///уже вычтены частичные поставки
    if (!$c.data['$строка тмц/с базы']) $c.data['$строка тмц/с базы'] =  $c.data['@строки тмц'].filter($c.FilterTMC, 'с базы').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    if (!$c.data['$строка тмц/на базу']) $c.data['$строка тмц/на базу'] = $c.data['@строки тмц'].filter($c.FilterTMC, 'на базу').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};***/
    
    $c['@номенклатура'] = [];
    $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){ 
      Array.prototype.push.apply($c['@номенклатура'], data);
      
      $c.ready = true;
    
      $c.data._copy = angular.copy($c.data);
      
      $c.Scroll();
      
      $timeout(function() {
        $('.modal', $($element[0])).modal({
          //~ "noOverlay": true,///absolute!
        });
      });
    });
    
  };
  
  $c.Scroll = function(){
    /***$timeout(function() { это прокрутка когда overflow auto для раздела таблицы
      //~ if( !Util.isElementInViewport($element[0]) ) {
        var p = $($element[0]).parents().filter(function(){ return $(this).css('position') == 'fixed'; }).first();
        if (!p.length) p = $($element[0]).closest('table').parent();
        if (!p.length) p = $('html,body');
        p.animate({scrollTop: $($element[0]).offset().top}, 1500);
      //~ }
    });***/
    $timeout(function() {
      //~ Util.Scroll2El($element[0]);
      $('html,body').animate({scrollTop: $($element[0]).offset().top-200}, 1500);
    }, 10);
    
  };
  
  $c.OnFocusBase1 = function(ctrl){//возврат из компонента object-address для базы
    //~ console.log("OnFocusBase1", ctrl.data, ctrl.ToggleListBtn);
    if(!ctrl.data.title) ctrl.ToggleListBtn();
    
  };
  
                                                                              var FilterNotNull = function(id){ return !!id; };
  $c.ValidNomen = function(){
    var nomen = $c.data['$номенклатура'];
    var nomenOldLevels = (nomen.selectedItem && nomen.selectedItem.id && ((nomen.selectedItem.parents_id && nomen.selectedItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    var nomenNewLevels = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    return nomenOldLevels &&  (nomenOldLevels+nomenNewLevels) > 4;/// 4 уровня
  };
  
  $c.Valid = function(){
    var kolP = parseFloat(Util.numeric($c.data['$строка тмц/поставщик']['количество']) || 0);
    var kolOb1 = parseFloat(Util.numeric($c.data['$строка тмц/с базы']['количество']) || 0);
    var kolOb2 = parseFloat(Util.numeric($c.data['$строка тмц/на базу']['количество']) || 0);
    var kolZ = parseFloat(Util.numeric($c.data['$тмц/заявка']['количество']));
    var ob1 =  $c.data['$строка тмц/с базы']['$объект'];
    var ob2 = $c.data['$строка тмц/на базу']['$объект'];
    return $c.ValidNomen() ///((nomen.selectedItem && nomen.selectedItem.id) || (nomen.newItems && nomen.newItems[0] && nomen.newItems[0].title))
      && (!kolOb1 || ob1.id) && (!kolOb2 || ob2.id)
      && (!ob1.id || kolOb1) && (!ob2.id || kolOb2)
      && (kolP+ kolOb1 >= kolZ )
    ;
  };
  
  $c.Save = function(){
    $c.cancelerHttp = 1;
    delete $c.error;
    
    $http.post(appRoutes.url_for('тмц/снабжение/сохранить простую поставку'), $c.data/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        $c.cancelerHttp = undefined;
        if(resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          $c.Cancel();//$c.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green');
          //~ window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          $rootScope.$broadcast('Сохранено/простая поставка ТМЦ', resp.data.success);
          ///обновить номенклатуру
          $c['@номенклатура'].length = 0;
          $Номенклатура.Refresh(0).Load(0).then(function(data){  Array.prototype.push.apply($c['@номенклатура'], data); });
          $Контрагенты.RefreshData();
        }
        
        console.log("Сохранено/простая поставка ТМЦ:", resp.data);
      });
    
  };
  
  $c.Cancel = function(){
     if ($c.data._copy) Object.keys($c.data._copy).map(function(key){
      $c.data[key] = $c.data._copy[key];
      
    });
    
    $('.card.animated:first', $element[0]).removeClass('zoomOutUp').addClass('zoomOutUp');
    $timeout(function(){
      $c.data._copy = undefined;
      $c.data._edit = false;
      
    }, 400);
   
    
  };
  
  $c.Delete = function(){
    $c.data['$строка тмц/поставщик']['количество'] = 0;
    $c.data['$строка тмц/с базы']['количество'] = 0;
    $c.data['$строка тмц/на базу']['количество'] = 0;
    $c.Save();
    
  };
  
};

/*=============================================================*/

module

.component('tmcSnabFormEasy', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/form-easy",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',
    ask: '<',///заявка

  },
  controller: Component
})

;

}());