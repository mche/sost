(function () {
  'use strict';
  angular.module('AppTplCache', [])
  .run(function($templateCache) {
    //~ console.log("App config starting...", $templateCache);
    $templateCache.put('progress/load', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Загружается...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/save', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Сохраняется...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/search', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Поиск...</div><div class="indeterminate"></div></div>');
  });
  
  /*
  доступа к кукам не будет https://stackoverflow.com/a/27863299
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  */
  angular.module('AuthTimer', ['appRoutes'])
    .config(function ($httpProvider, $provide) {//, $cookies
      //~ console.log("angular.module('AuthTimer', []).config", $httpProvider.interceptors);
      $provide.factory('httpAuthTimer', function ($q,  $injector, $window, $timeout, appRoutes) {//$rootScope, $location
        var lastResTime, stopReqs;
        return {
          "request": function (config) {
            //~ //var $cookies = $injector.get('$cookies');
            var cache = config.cache; // тут же $templateCache
            if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            return config || $q.when(config);
          },
          "response": function (resp) {
            //~ var $cookies = $injector.get('$cookies');
            var cache = resp.config.cache; // тут же $templateCache
            //~ if(!lastResTime) lastResTime = new Date();
            if(!cache || !cache.put) {
              lastResTime = new Date();
              console.log("httpAuthTimer last response time", lastResTime);//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
              
              
            }
            return resp || $q.when(resp);
          },
          //~ "requestError": function (rejection) {
            //~ return $q.reject(rejection);
          //~ },
          "responseError": function (resp) {
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            var expires = dateFns.differenceInSeconds(new Date(), lastResTime);
            if((!cache || !cache.put) && resp.status == 404 && expires > 30) {
              stopReqs = true;
              //~ var path = $location.path();
              console.log("httpAuthTimer responseError 404 auth expires", expires);//response.headers()
              $timeout(function(){ $window.location.href = appRoutes.url_for('вход', undefined, {"from": $window.location.pathname}); });
            }
            return $q.reject(resp);
          }
        };
      });
      $httpProvider.interceptors.push('httpAuthTimer');
    })
    .component('authTimerOut', {
      templateUrl: "profile/form-auth",
      bindings: {
      },
      controller: function(){
        var $ctrl = this;

        $ctrl.$onInit = function () {
          
        };
      }
    })
    ;

})();
