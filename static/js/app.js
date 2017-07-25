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
  поэтому отслеживать время запросов
  !внимание! default_expiration должен соотв сервеной куки просрочке!
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  */
  angular.module('AuthTimer', ['appRoutes', 'formAuth'])
    .config(function ($httpProvider, $provide) {//, $cookies
      var default_expiration = 600;
      $provide.factory('httpAuthTimer', function ($q, $rootScope, $injector, $window, $timeout, appRoutes) {//$rootScope, $location
        var lastResTime;//, stopReqs;
        return {
          //~ "request": function (config) {
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            //~ return config || $q.when(config);
          //~ },
          "response": function (resp) {
            //~ var $cookies = $injector.get('$cookies');
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              lastResTime = new Date();
              //~ console.log("httpAuthTimer last response time", lastResTime);//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
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
            if((!cache || !cache.put) && resp.status == 404 && expires > default_expiration) {
              //~ stopReqs = true;
              //~ console.log("httpAuthTimer responseError 404 auth expires", expires);//response.headers()
              $timeout(function(){
                if($('auth-timer-login').length) $('.modal', $('auth-timer-login')).modal('open');
                else {
                  var $compile = $injector.get('$compile');
                  //~ $window.location.href = appRoutes.url_for('вход', undefined, {"from": $window.location.pathname});
                  $('body').append($compile('<auth-timer-login></auth-timer-login>')($rootScope)[0]);//$scope
                  //~ $scope.$digest();
                }
              });
            }
            return $q.reject(resp);
          }
        };
      });
      $httpProvider.interceptors.push('httpAuthTimer');
    })
    
    .component('authTimerLogin', {
      template: '<div id="modal-AuthTimer" ng-if="$ctrl.ready" class="modal"><div class="modal-content"><h3 class="red-text">Истекло время бездействия. Войдите снова.</h3><div class="input-field"><input type="checkbox" ng-model="param.reload" ng000-true-value=" $window.location.pathname " ng000-false-value=" false " ng000-checked=" true " id="крыжик обновления страницы"><label for="крыжик обновления страницы"><h4>Обновить страницу после входа (рекомендуется)</h4></label></div><div>{{ param | json }}</div><form-auth data-param="param"></form-auth></div></div>',
      //~ bindings: {
      //~ },
      controller: function($scope, $element, $timeout, $window, formAuthTCache){
        var $ctrl = this;
        //~ $scope.$window = $window;
        //~ console.log("component 'authTimerLogin'", formAuthTCache);

        $ctrl.$onInit = function () {
          //~ $scope.from = $window.location.pathname;
          $scope.param = {"reload": true,"successCallback": function(resp_data){
            if($scope.param.reload) return $window.location.reload();
            $('.modal', $($element[0])).modal('close');
          }};
          formAuthTCache.load.then(function (proms) {
            $ctrl.ready = true;
            $timeout(function() {
              $('.modal', $($element[0])).modal({"dismissible": false,}).modal('open');
            });
          });
          
        };
      }
    })
    ;

})();
