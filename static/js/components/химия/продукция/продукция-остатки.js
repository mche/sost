(function () {'use strict';
/**/
var moduleName = "Химия::Продукция::Остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);
module
.factory('$ХимияПродукцияТекущиеОстатки', function(/*$templateCache, $http, */ appRoutes, $Список, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
  
  var $this = new $Список(appRoutes.urlFor('химия/продукция/остатки'));
  $this.OnLoadMap = function(item) {
    item._match = [/*item.$номенклатура.parents_title.slice(1).join('\n'), */item.$номенклатура.title, item['ед'], item['№ партии']].join('\n');
    return item;
  };
  $this.Load();
  $EventBus.$on('Обновить текущие остатки продукции', function(){
    $this.Clear();
  });
  return $this;
});

})();