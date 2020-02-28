(function () {'use strict';
/*
  Модуль аренды доп расходы арендаторов
*/

var moduleName = "Аренда::Расходы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'ProjectList', 'Аренда::Расходы::Таблица', /*'EventBus',*/]);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаРасходыТаблица/*,$EventBus*/) {
  var ctrl = this;

  
  //~ $EventBus.$on('', function(){
  //~ });


  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'аренда-расходы.html'), 1);
  
const methods = {/*методы*/
  $onInit(){
    ctrl.param = {
      "месяц":new Date().toISOString().replace(/T.+/, ''),
    };
    
    tCache.then(function(proms){
      ctrl.ready  = true;
    });
    
  },
  
  SelectProject(p){
    if (p && ctrl.param["проект"] !== p) $timeout(function(){
      ctrl.param["проект"] = p;
      $timeout(()=>{ ctrl.Vue(); }); 
    });
    ctrl.param["проект"] = undefined;
  },
  
  Vue(){
    var el =  document.getElementById('тут компонент расходы таблица');
    if (el) ctrl.vueComp = new Vue(Object.assign(new $КомпонентАрендаРасходыТаблица(), {"el": el,}));
    if (ctrl.vueComp) ctrl.vueComp.param=ctrl.param;
    //~ console.log("Vue", vue);
    
  },
  
};/* конец methods*/
  
  Object.assign(ctrl, methods);
  
}

/*=============================================================*/

)

;

}());