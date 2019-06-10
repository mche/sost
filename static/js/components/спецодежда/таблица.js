(function () {'use strict';
/*
*/
var moduleName = "Спецодежда::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Спецодежда::Форма', 'Спецодежда::Сотрудники']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, /*$templateCache,*/ appRoutes, $СпецодеждаФорма, $СпецодеждаСотрудники){
  var $c = this;
  var meth = {/*методы Vue*/};
  
  $scope.$on('Выбран сотрудник', function(event, profile){
    //~ console.log("Получен сотрудник", JSON.stringify(profile));
    $c.vue.profile = undefined;
    if (profile) {
      $c.vue.ready = false;
      $c.LoadProfile(profile).then(function(){
        $c.vue.ready = true;
        $c.vue.profile = profile;
      });
    }
    
  });
  
  $scope.$on("Сохранена спецодежда", function(event, row){
    console.log("Сохранена спецодежда", row);
    
  });
  
  $c.$onInit = function(){
    
    $c.LoadData().then(function(){
      //~ console.log("childNodes[0]", $element[0].childNodes[0]);
      $c.vue = new Vue({
        "el":  $element[0], //.childNodes[0],
        //~ "delimiters": ['{%', '%}'],
        "data"() {
            return {
              "ready": true,
              "filter": {"наименование": '',},
              "profile": undefined,
              "data": $c.data,
              "dataFiltered": $c.data,
              //~ "selectedItem": undefined,///
              //~ "$профили": $c.$профили,
            };
          },
          "methods": meth,
          "components": {
            'guard-ware-form': new $СпецодеждаФорма({/*"param": $c.param*/}, $c, $scope),
          },
        });
        //~ console.log("Vue", $c.vue);
      });
  };
  
  $c.LoadData = function(){
    $c.data = $c.data || [];
    $c.data.splice(0, $c.data.length);
    var async = [];
    async.push($http.get(appRoutes.url_for('спецодежда/список')).then(function(resp){
      Array.prototype.push.apply($c.data, resp.data);      
    }));
    async.push($СпецодеждаСотрудники.Load().then(function(resp){
      $c.$профили = $СпецодеждаСотрудники.$Data();      
    }));
    return $q.all(async);
    
  };
  
  var timeoutSearch;
  const FilterSearch  = function(item, index){///
    //~ console.log("FilterSearch", item);
    let vm = this.vm;
    let re = this.re;
    let visib = re ? re.test([item['наименование'], item['ед']].join(' ')) /*|| item.tel.some(FilterTel, re)*/ : true;
    return visib;
    //~ vm.$set(item, '_hide', !visib);
    //~ if (visib) this['индексы'].push(index);
  };
  const Search = function() {///внутри таймаута
    let vm = $c.vue;
    if (!vm.filter['наименование']) {
      vm.dataFiltered = vm.data;
    } else {
      let re = new RegExp(vm.filter['наименование'],"i");
      vm.dataFiltered =  vm.data.filter(FilterSearch, {"vm": vm, "re": re,});
    }
    timeoutSearch = undefined;
  };
  meth.ChangeFilterSearch = function(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['наименование'] = event;
      return Search();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(Search, 500);
    
  };
  
  meth.ToggleSelect = function(item){
    //~ console.log("ToggleSelect", item);
    let vm = this;
    vm.$set(item, '_selected', !item._selected);
  };
  
  const MapInitRow = function(row){///
    row['@профили'] = row['@профили/id'].map(function(pid){ return $c.$профили[pid]; });
  };
  meth.ItemRows = function(item, name){
    //~ console.log("InitRow", JSON.stringify(row));
    //~ item[name].map(MapInitRow, item);
    return item[name];
  };
  
  meth.RowProfiles = function(row){
    row['@профили'] = row['@профили'] || row['@профили/id'].map(function(pid){ return $c.$профили[pid]; });
    return row['@профили'];
  };
  
  $c.LoadProfile = function(profile){
    return $http.post(appRoutes.url_for('спецодежда сотрудника'), {"id": profile.id}).then(function(resp){
      $c.vue.$set(profile, 'спецодежда', resp.data);
    });
  };
  
};

/*=====================================================================*/

module

.component('guardWare', {
  "controllerAs": '$c',
  "templateUrl": "спецодежда/таблица",
  "bindings": {
    param: '<',
    data: '<', ///может массив

  },
  controller: Controll
})

;

}());