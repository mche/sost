(function () {'use strict';
  //~ document.addEventListener("DOMContentLoaded", function(event) {
    /** тупо активировать**/
    //~ angular.injector(['App']);///.get('$Console')
    //~ console.log('Аренда::Акты', Vue.appRoutes, Vue.$http);///parcelRequire('$http')
  //~ });
  //~ return;

  
/*
  Модуль аренды отметки актов
*/

var moduleName = "Аренда::Акты";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes','Util', '',*/ 'Проекты::Список', 'Аренда::Акты::Таблица',]);//

//~ module.run(function(){
   //~ console.log('Аренда::Акты', Vue.appRoutes, Vue.$http);///parcelRequire('$http')
//~ });

module.controller('Controll', function(/*$scope, $q, $timeout, */$element, /*$http ,*/ appRoutes,/* TemplateCache,*/ $КомпонентПроектыСписок, $КомпонентАрендаАктыТаблица) {
  var ctrl = this;
  //~ var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'аренда-акты.html'), 1);
  
//~ ctrl.$onInit = function(){
  //~ tCache.then((proms)=>{
  //~ setTimeout(()=>{
    //~ });
    new Vue({
      "el": $element[0],/// харакири ангуляр
      "data": function(){
        return {
          "month": new Date().toISOString().replace(/T.+/, ''),
          "project": undefined,
        };
      },
      "methods":{
        SelectProject(p){
          this.project = p;
          //~ console.log("SelectProject", p);
        },
      },
      "mounted": function(){
        let vm = this;
        $('.datepicker').pickadate({// все настройки в файле русификации ru_RU.js
          monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
          format: 'mmmm yyyy',
          monthOnly: 'OK',// кнопка
          selectYears: true,
          onClose: function (context) {
            var s = this.component.item.select;
            var date = new Date([s.year, s.month+1, s.date].join('-')).toISOString().replace(/T.+/, '');
            if ( vm.month == date ) return;
              vm.month = date;
          },
        });//{closeOnSelect: true,}
      },
      "components": {
        'v-table':new $КомпонентАрендаАктыТаблица(),
        'v-project-list': new $КомпонентПроектыСписок(),
      },
    });
  //~ });
  
//~ };
  
  
}

/*=============================================================*/

)

;

}());