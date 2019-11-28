(function () {'use strict';
/**/
var moduleName = "Химия::Сырье::Остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);
module
.factory('$ХимияСырьеТекущиеОстатки', function(/*$templateCache, $http, */ appRoutes, $Список, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
  
  var $this = new $Список(appRoutes.urlFor('химия/сырье/остатки'));
  $this.OnLoadMap = function(item) {
    item._match = [/*item.$номенклатура.parents_title.slice(1).join('\n'), */item.$номенклатура.title, item['ед'], item['№ ПИ']].join('\n');
    return item;
  };
  $this.Load();
  $EventBus.$on('Обновить текущие остатки сырья', function(){
    $this.Clear().Load();
  });
  return $this;
});

})();