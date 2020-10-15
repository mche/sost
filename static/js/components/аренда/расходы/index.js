(function () {'use strict';
/*
  Модуль аренды доп расходы арендаторов
*/

var moduleName = "Аренда::Расходы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', /*'Util', '','ProjectList'*/ 'Проекты::Список', 'Аренда::Договоры::Выбор', 'Компонент::Выбор объекта', 'Аренда::Расходы::Таблица', /*'EventBus',*/]);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, /*$http ,*/ appRoutes, TemplateCache, $КомпонентПроектыСписок, $КомпонентАрендаДоговорыВыбор, $КомпонентВыборОбъекта, $КомпонентАрендаРасходыТаблица/*,$EventBus*/) {
  var ctrl = this;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'аренда-расходы.html'), 1);

//~ ctrl.$onInit = function(){
  tCache.then((proms)=>{
  //~ setTimeout(()=>{
    //~ });
    new Vue({
      "el": $element[0],/// харакири ангуляр
      "data": function(){
        return {
          "month": new Date().toISOString().replace(/T.+/, ''),
          "project": {},
          "object": {},
          //~ "projectId": undefined,
          //~ "projectName": undefined,
          "contract": {},
          //~ "_contract": {},/// целиком
          //~ "contractId": undefined,
          //~ "tpl": `<div>key {{(project.id || '0') + month + (contract.id || '0')}}</div>`,
        };
      },
      "methods":{
        SelectProject(p){
          this.project = p;
          //~ this.project.id = p && p.id;
          //~ this.project.name = p && p.name;
          //~ this.projectName = p && p.name;
          //~ this.projectId = p && p.id;
          //~ console.log("SelectProject", p);
        },
        SelectObject(o){
          //~ console.log("SelectObject", o);
          this.object = o;// ? {"id": o.id,} : {};
          
        },
        //~ ProjectName(){
          //~ console.log("ProjectName", this.project);
          //~ return this.project.name;
        //~ },
        OnContractSelect(item){
          //~ console.log("OnContractSelect", item);
          if (item) this.SelectProject({"id": item && item['проект/id'], "name": item && item['проект/name'], });
          this.$set(this.contract, 'id', item && item.id);
          //~ this.contractId = item && item.id;
          //~ Object.assign(this._contract, item || {});
          //~ this.$set(this, '_contract', item || {});
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
        'v-table':new $КомпонентАрендаРасходыТаблица(),
        'v-project-list': new $КомпонентПроектыСписок(),
        'v-contract-select': new $КомпонентАрендаДоговорыВыбор(),
        'v-object-select': new $КомпонентВыборОбъекта(),
      },
      "computed": {
        RefreshKey(){
          return this.month + (this.project ? this.project.id : '0') + (this.contract ? this.contract.id : '0') + (this.object ? this.object.id : '0');
        },
        //~ ProjectName(){ return this.project.name; },
        //~ ContractId() { return this.contract.id; },
      },
    });
  });
  
//~ };
}

/*=============================================================*/

)

;

}());