(function () {'use strict';
/*
  Модуль аренды доп расходы арендаторов
*/

var moduleName = "Аренда::Расходы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Аренда::Расходы::Таблица', /*'EventBus',*/]);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаРасходыТаблица/*,$EventBus*/) {
  var ctrl = this;

  
  //~ $EventBus.$on('', function(){
  //~ });


  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'аренда-расходы.html'), 1);
  
  ctrl.$onInit = function(){
    ctrl.param = {

    };
    
    
    tCache.then(function(proms){
      //~ $timeout(function(){ ctrl.Vue(); });
      ctrl.Vue(); 
      ctrl.ready  = true;
    });
    
  };
  
const methods = {/*методы*/

};/* конец methods*/
  
  Object.assign(ctrl, methods);
  
  
  ctrl.Vue = function(){
    new Vue(Object.assign(new $КомпонентАрендаРасходыТаблица(), {"el": document.getElementById('тут компонент расходы таблица'),}));
    //~ new Vue(Object.assign(new $КомпонентАрендаДоговорыТаблица(), {"el": document.getElementById('тут компонент договоры'),}));
  };
  

  
}

/*=============================================================*/

)

;

}());