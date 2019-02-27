(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ замстрой табы";
try {angular.module(moduleName); return;} catch(e) { } 


var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ текущие остатки', 'TMCTabsLib', ]);//'ngSanitize',, 'dndLists'

const Component = function  ($scope, /*$rootScope, $q,*/ $timeout, $http, $element, appRoutes, Util, $TMCTabsLib, $Список ) {//TMCSnab, ObjectAddrData, $filter, $sce
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $c.tabs = [
    {// строка
      "title": '',
      "childs":[
        {
          "title":'Списания ТМЦ',
          "data": 'списания',
          "фильтр": function(it){ return !0; },
          "liClass": 'red lighten-3',
          //~ "tbodyClass": 'orange lighten-5',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3',
          "svgClass":'red-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },
      ]
    }
  ];
  new $TMCTabsLib($c, $scope, $element);
  
  $c.$onInit = function(){
    if(!$c.param.where) $c.param.where={"дата1":{"values":[]},};// фильтры
    $scope.param = $c.param;
    $c.data = {};
    $c.LoadDataSpis().then(function(){
      $c.ready = true;
      $timeout(function(){
        $('.modal', $($element[0])).modal();
        
        if (!$c.tab/*$c.data['заявки'].DataLen()*/) $c.SelectTab(undefined, '', 'Списания ТМЦ');
        //~ console.log("ТМЦ замстрой табы");
      });

    });
  };
  
  $c.LoadDataSpis = function(){//param
    
    $c.data['списания'] = new $Список(appRoutes.url_for('тмц/список списаний'), $c, $scope, $element);
    return $c.data['списания'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$списания) $c.data.$списания = {};
      $c.data['списания'].$Data($c.data.$списания);
    });
    
  };

};


/*=============================================================*/

module

.component('tmcZamstroyTabs', {
  controllerAs: '$c',
  templateUrl: "tmc/zamstroy/tabs",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());