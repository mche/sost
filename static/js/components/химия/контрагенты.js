(function () {'use strict';
/**/
var moduleName = "Химия::Контрагенты";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);
module
.factory('$ХимияКонтрагенты', function(/*$templateCache, $http, */ appRoutes, $Список, $EventBus /*$timeout,$rootScope, , /**$compile, Util */) {// factory
  
  var $this = new $Список(appRoutes.urlFor('химия/контрагенты'));
  $this.Load();
  $EventBus.$on('Обновить контрагентов', function(){
    $this.Clear().Load();
  });
  return $this;
});

})();