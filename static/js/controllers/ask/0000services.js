(function () {'use strict';

var moduleName = "AskService";


var serviceData = function($http, $q, appRoutes) {
  
  this.get = function(scope, ctrl){
    var async = [];
    async.push($http.get(appRoutes.url_for("данные формы заявки", ctrl.$attrs.askId || 0)+'?c='+(ctrl.$attrs.selectedCategory || 0)).then(function (resp) {//$attrs.formDataUrl    
      
      scope.data = resp.data;
      
    }));
    
    $q.all(async).then(function (proms) {
      
      $http.get(scope.data.transport ? appRoutes.url_for('категории транспорта') : appRoutes.url_for('данные категорий транспорта'))
      .then(function (resp) {//$attrs.categoryTreeDataUrl
        scope.data.categoryTreeData = resp.data;

        ctrl.ready = true;
      });
    });
  };
  
};

angular.module(moduleName, ['appRoutes'])

.service('FormAskData', serviceData)

;

}());