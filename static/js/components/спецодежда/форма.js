(function () {'use strict';
/*
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa': new $СпецодеждаФорма($c, $scope, $element),
      ...
    }
  })
  
*/
var moduleName = "Спецодежда::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

const Lib = function($templateCache, $timeout, /*$http, *$compile,*/ appRoutes, Util) {// factory
  
const Ready = function(){/// метод
  var vm = this;
  //~ console.log("Ready", this);
  $timeout(function(){
    vm.ready = true;
  }, 1000);
};

return /*конструктор*/function ($c, $scope, $element){
  let $this = this;
  let props = ['data'];
  $this.ready = false;
  $this.Ready = Ready;
  //~ angular.extend($c, this);
  
  //~ console.log("templateCache", $templateCache.get('спецодежда/форма'));
  
  return {
    "template": $templateCache.get('спецодежда/форма'),
    "props": props,
    "data": function(){ return $this; },
    "methods": $this,
    "mounted"() {
      //~ console.log('mounted', this);
      this.Ready();
    },
  };
};

};
/**********************************************************************/
module
.factory('$СпецодеждаФорма', Lib);

}());
