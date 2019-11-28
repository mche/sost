(function () {'use strict';
/**/
var moduleName = "Химия::Номенклатура";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);
module
.factory('$ХимияНоменклатураПродукция', function(/*$templateCache, $http, */ appRoutes, $Список, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
  var param = {"parent_title": '★ продукция ★'};
  var $this = new $Список(appRoutes.urlFor('химия/номенклатура'));
  $this.Load(param);
  $EventBus.$on('Обновить номенклатуру продукции', function(){
    $this.Clear().Load(param);
  });
  return $this;
})

.factory('$ХимияНоменклатураСырье', function(/*$templateCache, $http, */ appRoutes, $Список, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
  var param = {"parent_title": '★ сырьё ★'};
  var $this = new $Список(appRoutes.urlFor('химия/номенклатура'));
  $this.Load(param);
  $EventBus.$on('Обновить номенклатуру сырья', function(){
    $this.Clear().Load(param);
  });
  return $this;
})
;

})();