(function () {'use strict';
/**/
var moduleName = "Химия::Сырье::Остатки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);
module
.factory('$ХимияСырьеТекущиеОстатки', function(/*$templateCache, $http, */ appRoutes, $Список /*$timeout,$rootScope, , /**$compile, Util $EventBus*/) {// factory
  var $this = new $Список(appRoutes.urlFor('химия/сырье/остатки'));
  $this.Load();
  return $this;
});

})();