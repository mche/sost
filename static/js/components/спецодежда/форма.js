(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $СпецодеждаФорма({<данные в компонент>}, $c, $scope),
      ...
    }
  })
  
*/
var moduleName = "Спецодежда::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

const Lib = function($templateCache, $timeout, /*$http, *$compile,*/ appRoutes, Util) {// factory

const props = ['data'];
const Ready = function(){/// метод
  var vm = this;
  console.log("Ready", this.$el);
  $timeout(function(){
    vm.ready = true;
  }, 1000);
};

return /*конструктор*/function (data, $c, $scope){
  let $this = this;
  
  data.ready = false;
  $this.Ready = Ready;
  //~ angular.extend($c, this);
  
  return {
    "template": $templateCache.get('спецодежда/форма'),
    "props": props,
    "data": function(){ return data; },
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
