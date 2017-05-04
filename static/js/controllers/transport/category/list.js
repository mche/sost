(function () {
'use strict';

var Controll = function ($scope, $http, appRoutes, CategoryData) {
  var $ctrl = this;
  //~ $ctrl.$attrs = $attrs;
  
  $ctrl.Init = function () {
    
    if ($ctrl.data === undefined) {
      CategoryData.get($ctrl.staticData, function (resp) {
        $ctrl.data = resp.data;
        $ctrl.InitData();
      });
    } else {
      $ctrl.InitData();
    }
  };
  
  $ctrl.InitData = function() {
    
    if ($ctrl.level === undefined) $ctrl.level = 0;
    $ctrl.selected = $ctrl.category.selectedIdx[$ctrl.level]; // индекс позиция на текущем уровне
    //~ $ctrl.ToggleSelect($ctrl.data[$ctrl.selected]);
    $ctrl.SetFinalCategory();
    if ($ctrl.selected) $ctrl.category.selected = $ctrl.data[$ctrl.selected];// item
    
    $ctrl.ready = true;
    
  };
    
  $ctrl.SetFinalCategory = function () {
    var final = $ctrl.selected !== undefined && $ctrl.data[$ctrl.selected] && ((!$ctrl.data[$ctrl.selected].childs) || $ctrl.data[$ctrl.selected].childs.length === 0);
    if ( final ) {// нет потомков - это финал в родительский контроллер
      $ctrl.category.finalCategory = $ctrl.data[$ctrl.selected];// item
    } else {
      $ctrl.category.finalCategory = {};
    }
  
  };
  
  
  $ctrl.ToggleSelect = function (item) {
    if ($ctrl.disabled) return false;
    var idx = $ctrl.data.indexOf(item);
    
    if ($ctrl.selected !== undefined && $ctrl.selected == idx) {// сброс
      $ctrl.selected = undefined;
      $ctrl.category.selectedIdx = $ctrl.category.selectedIdx.splice(0, $ctrl.level);
      $ctrl.category.finalCategory = {};
      $ctrl.category.selected = $ctrl.SelectedCategory();
      //~ $ctrl.category.current = {};
      return true;
    }
    
    // Выключил 16-01-2017
    //~ if (item.hasOwnProperty('_count') && !item._count) return;
    
    $ctrl.selected =  idx;
    $ctrl.category.selectedIdx[$ctrl.level] = idx;
    $ctrl.SetFinalCategory();
    $ctrl.category.selected = $ctrl.data[$ctrl.selected];// item
    //~ $ctrl.category.current = $ctrl.data[idx];
  };
  
  $ctrl.SelectedCategory = function () {
    var data = $ctrl.data,
      curr;
    angular.forEach($ctrl.category.selectedIdx, function(idx) {
      curr = data[idx];
      data = curr.childs;
    });
    //~ $ctrl.category.selected = curr;
    return curr;
  };
  
  $ctrl.filterSelected = function(item, index, array) {
    //~ console.log("фильрация списка", item);
    if (!!item.disabled) return false;
    if ($ctrl.selected === undefined || $ctrl.data[$ctrl.selected] === item) return true;
    return false;
  };
  
  $ctrl.ItemImg = function (item) {
    return appRoutes.url_for('картинка категории', [item._img_url || 'default.png']);
  };
  
  //~ if ($ctrl.data === undefined) {CategoryData.get($ctrl.staticData, function (resp) {$ctrl.data = resp.data; $ctrl.Init();});} 
  //~ else {$ctrl.Init();}

  
};

var serviceData = function($http, appRoutes) {//$q, 
  
  this.get = function(staticData, http_then_cb){
    $http.get(staticData ? appRoutes.url_for('категории транспорта') : appRoutes.url_for('данные категорий транспорта'))//{"cache": true}
    .then(http_then_cb);
  };
  
};

angular.module('transport.category.list', ['appRoutes'])
//~ .config( function( $compileProvider ){
  //~ console.log($compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|javascript):/));
//~ })
.component('transportCategoryList', {// много раз повторяется и шаблон проще жестко здесь зашить
  templateUrl: "transport/category/list",
  //~ templateUrl: "/controllers/transport/category/list.html",
  //~ function ($attrs) {
    //~ console.log("component categoryList templateUrl:", $attrs);
    //~ this.xTemplateUrl = $attrs.xTemplateUrl;
    //~ return $attrs.xTemplateUrl;
  //~ },
  bindings: {
      staticData: '<',// boolean влияет на получение корневых данных дерева (статика или с динамическим подсчетом)
      disabled: '<',
      data: '<', // массив-данные потомков для уровня
      level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
      category: '<' // {} внешние данные (нужен проброс) а именно:
          //~ selectedIdx: '=', // двунаправленный массив предустановленных позиций списков [1,0,2] - выбрать вторую поз на 0 уровне, первую - на 1 уровне, третью на третьем уровне
          //~ finalCategory: '=' // если дошел до вершины любой ветки - установить ее узел
      //~ , dataUrl: '<'
  },
  controller: Controll
})

.service('CategoryData', serviceData)

;

}());