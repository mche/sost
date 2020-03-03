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
      "месяц":new Date(),//.toISOString().replace(/T.+/, ''),
    };
    
    tCache.then(function(proms){
      ctrl.ready  = true;
      $timeout(function(){
        $('.datepicker.month', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
          format: 'mmmm yyyy',
          monthOnly: 'OK',// кнопка
          selectYears: true,
          onClose: function (context) {
            var s = this.component.item.select;
            //~ vm.$set(vm, "payMonth" , [s.year, s.month+1, s.date].join('-'));
            var date = new Date([s.year, s.month+1, s.date].join('-')).toISOString().replace(/T.+/, '');
            if ( ctrl.param['месяц'] == date ) return;
            //~ ctrl.param['месяц'] = undefined;
            //~ $timeout(function(){
              ctrl.param['месяц'] = date;
              //~ console.log("set date", ctrl.param['месяц']);
              //~ $timeout(()=>{ ctrl.Vue(); });
              //~ ctrl.Vue();
            //~ });
            //~ vm.LoadData();
          },
        });//{closeOnSelect: true,}
        
        //~ ctrl.Vue();
        
      });
    });
    
  },
  
  SelectProject(p){
    //~ if (p && ctrl.param["проект"] !== p) $timeout(function(){
      ctrl.param["проект"] = p;
      ctrl.Vue();
      //~ $timeout(()=>{ ctrl.Vue(); }); 
    //~ });
    //~ ctrl.param["проект"] = undefined;
  },
  
  Vue(){
    if (ctrl.vue) return;
    //~ var el =  document.getElementById('тут компонент расходы таблица');
    //~ if (!el) return console.log("Нет document.getElementById('тут компонент расходы таблица')");
    ctrl.vue = new Vue({"el": '#тут-компонент-расходы-таблица', "data":function(){ return {"param":ctrl.param}; }, "components":{'v-table':new $КомпонентАрендаРасходыТаблица(),}});
    //~ vue.$set(vue.param, 'param2', 'foo')
    ///ctrl.vueComp = new Vue(Object.assign(new $КомпонентАрендаРасходыТаблица(), {"el": el,}));
    //~ if (ctrl.vueComp) ctrl.vueComp.param=ctrl.param;
    //~ console.log("Vue", vue.param);
    
  },
  
};/* конец methods*/
  
  Object.assign(ctrl, methods);
  
}

/*=============================================================*/

)

;

}());