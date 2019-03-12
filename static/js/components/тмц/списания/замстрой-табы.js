(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ замстрой табы";
try {angular.module(moduleName); return;} catch(e) { } 


var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ текущие остатки', 'TMCTabsLib', 'ТМЦ список инвентаризаций', 
]);//'ngSanitize',, 'dndLists'

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
        {//таб
          "title": 'Наличие ТМЦ',
          "len-000":function(tab){ return $c.data['остатки'] && $c.data['остатки'].length; },
          "liClass": 'teal lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'teal-text text-darken-4 ',
          "aClassActive": ' before-teal-darken-4',
          "svgClass":'teal-fill fill-darken-4',
        },
      ]
    }
  ];
  
  //~ $scope.$on('Сохранить ')
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
  
      /*** остатки **/
  $c.LoadDataOst = function(append){
    if (!$c.data['остатки']) $c.data['остатки']=[];
    if (append === undefined) $c.data['остатки'].splice(0, $c.data['остатки'].length);
    $ТМЦТекущиеОстатки.Clear();///$c.param
  };
  
  $c.OnConfirmSpis = function(row){///крыжик принятия списания
    //~ $c.param['принимать списания'];
    console.log('OnConfirmSpis', row);
    return $http.post(appRoutes.url_for('тмц/сохранить принятие списания'), {id: row.id, "принял": row['принял']})
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 3000, 'red-text text-darken-3 red lighten-3 border fw500 animated zoomInUp');
        else if (resp.data.success) Materialize.toast("Сохранено успешно", 3000, 'green-text text-darken-3 green lighten-4 border fw500 animated zoomInUp');
        console.log("OnConfirmSpis", resp.data);
      }, function(){
        Materialize.toast('Ошибка на сервере', 5000, 'red-text text-darken-3 red lighten-3 border fw500');
        
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