(function () {'use strict';
/*
*/
var moduleName = "Спецодежда::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Спецодежда::Форма', 'Спецодежда::Сотрудники', 'EventBus']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, /*$rootScope, $templateCache,*/ appRoutes, $СпецодеждаФорма, $СпецодеждаСотрудники, $EventBus){
  var $c = this;
  var meth = {/*методы Vue*/};
  
  $EventBus.$on('Выбран сотрудник', function(profile){
    //~ console.log("Получен сотрудник", JSON.stringify(profile));
    $c.vue.profile = undefined;
    $c.vue.ChangeFilterKey('');
    if (profile) {
      $c.vue.ready = false;
      $c.LoadProfile(profile).then(function(){
        $c.vue.ready = true;
        $c.vue.profile = profile;
      });
    }
    $EventBus.$emit("Отметить сотрудников", undefined);
  });
  
  $EventBus.$on('Отметка сотрудника', function(profile){
    //~ console.log(profile.id, $c.vue.selectedRadio);
    if ($c.vue.selectedRadio) $c.vue.Ref($c.vue.selectedRadio, profile.id);
  }); 
  //~ $EventBus.$on('Отметка сотрудника снята', function(profile){
    //~ console.log(profile.id, $c.vue.selectedRadio);
  //~ });
  
  //~ $scope.$on("Сохранена спецодежда", function(event, row){
    //~ console.log("Сохранена спецодежда", row);
    
  //~ });
  
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
              //~ "$data": $c.$data,
              "dataFiltered": this.DataArray($c.$data),
              "newItem": {},
              "selectedRadio": undefined,///
              "confirm": undefined,/// любой объект на подтверждение
              //~ "$профили": $c.$профили,
            };
          },
          "methods": meth,
          "mounted"(){
            var vm = this;
            $timeout(function(){
              $('.modal', $(vm.$el)).modal();
            })
          },
          "components": {
            'guard-ware-form': new $СпецодеждаФорма({/*"param": $c.param*/}, $c, $scope),
          },
        });
        //~ console.log("Vue", $c.vue);
      });
  };
  
  $c.LoadData = function(){
    //~ $c.data = $cf || [];
    //~ $c.$data = $c.$data || {};
    //~ $c.data.splice(0, $c.data.length);
    var async = [];
    async.push($http.get(appRoutes.url_for('спецодежда/список')).then(function(resp){
      //~ Array.prototype.push.apply($c.data, resp.data);
      $c.$data = resp.data;
    }));
    async.push($СпецодеждаСотрудники.Load().then(function(resp){
      $c.$профили = $СпецодеждаСотрудники.$Data();      
    }));
    return $q.all(async);
    
  };
  
  const MapDataKey = function(key){
    var data = this.data;
    var vm = this.vm;
    var item = data[key];
    vm.$set(item, '_selected', false);
    item['@спецодежда'].map(function(row){ vm.$set(row, '_hide', undefined); });
    return item;
  };
  meth.DataArray = function(data){
    let vm = this;
    data = data || $c.$data;
    return  Object.keys(data).map(MapDataKey, {"data": data, "vm": vm})
  };
  
  var timeoutSearch;
  const FilterKey  = function(key/*item, index*/){///
    //~ console.log("FilterKey", item);
    let vm = this.vm;
    let re = this.re;
    let visib = re ? re.test(key/*[item['наименование'], item['ед']].join(' ')*/) /*|| item.tel.some(FilterTel, re)*/ : true;
    return visib;
    //~ vm.$set(item, '_hide', !visib);
    //~ if (visib) this['индексы'].push(index);
  };
  const FilteredData = function() {///внутри таймаута
    let vm = $c.vue;
    if (!vm.filter['наименование']) {
      vm.dataFiltered = vm.DataArray();
    } else {
      let re = new RegExp(vm.filter['наименование'],"i");
      vm.dataFiltered =  Object.keys($c.$data).filter(FilterKey, {"vm": vm, "re": re,}).map(MapDataKey, {"data": $c.$data, "vm": vm});
    }
    timeoutSearch = undefined;
  };
  meth.ChangeFilterKey = function(event){
    let vm = this;
    if (!event.target) {/// или сброс в строку
      vm.filter['наименование'] = event;
      if (vm.selectedRadio) vm.ClickRadio(vm.selectedRadio);//сброс
      return FilteredData();
    }
    if (timeoutSearch) $timeout.cancel(timeoutSearch);
    timeoutSearch = $timeout(FilteredData, 500);
    
  };
  
  meth.ToggleItem = function(item, val){
    //~ 
    let vm = this;
    vm.$set(item, '_selected', val === undefined ? !item._selected : val);
    if (!item._selected && vm.selectedRadio && item['@спецодежда'].some(function(row){ return vm.selectedRadio === row; })) vm.ClickRadio(vm.selectedRadio);
    //~ $c.vue.$set(item, 'edit', undefined);
  };
  
  const MapInitRow = function(row){///
    row['@профили'] = row['@профили/id'].map(function(pid){ return $c.$профили[pid]; });
  };
  meth.ItemRows = function(item, name){
    //~ console.log("ItemRows", JSON.stringify(item));
    //~ $c.$data[item['наименование']+'&'+item['ед']] = item;
    //~ item[name].map(MapInitRow, item);
    return item[name];
  };
  
  meth.GetProfile = function(pid){
    //~ if ( !row['@профили/id'] )  row['@профили/id'] = [];
    //~ row['@профили'] = row['@профили'] || row['@профили/id'].map(function(pid){ return $c.$профили[pid]; });
    //~ return row['@профили'];
    return $c.$профили[pid] || {"names": '???'};
  };
  
  meth.OpenForm = function(item, edit){
    //~ if (edit && edit.id) item.$спецодежда[edit.id] = edit;
    edit = angular.copy(edit) ||  {'наименование': item['наименование'], 'ед': item['ед'],};
    $c.vue.$set(item, 'edit', edit);
  };
  
  meth.CloseForm = function(item){//// из компонента формы vm.$emit('close-form', vm.item);
    let vm = this;
    //~ var idx = vm.data.indexOf($c.$data]);
    var it = 0//$c.$data[item.edit['наименование']+' & '+item.edit['ед']]
      || item;//vm.dataFiltered[vm.dataFiltered.indexOf(item)];
    if ( item.edit.id && (item.save || item.remove)) {//редактирование и удаление
      var row = it['@спецодежда'].filter(function(row){ return row.id==item.edit.id; }).pop();
      var idx = row ? it['@спецодежда'].indexOf(row) : -1;
      it['@спецодежда'].splice(idx, 1);
      if (item.save) {
        row = item.save['@спецодежда'][0];
        if (it['наименование'] == item.edit['наименование'] && it['ед'] == item.edit['ед']) {
          it['@спецодежда'].splice(idx < 0 ? 0 : idx, 0, row);
        } else {
          it = item.save;
          $c.$data[it.key] = it;
          vm.dataFiltered.unshift(it);
        }
        vm.ChangeFilterKey('');
        vm.ChangeRadio(row);
        vm.ToggleItem(it, true);
       
      }
    }
    else if (item.save) /*новая строка в data*/ {
      var row  = item.save['@спецодежда'][0];
      if (it && it['@спецодежда']) it['@спецодежда'].unshift(row);
      else {
        it = item.save;
        $c.$data[it.key] = it;
        vm.dataFiltered.unshift(it);
      }
      //~ vm.ChangeFilterKey('');
      vm.ChangeRadio(row);
      vm.ToggleItem(it, true);
    }
    $c.vue.$set(item, 'edit', undefined);
    $c.vue.$set(item, 'save', undefined);
    $c.vue.$set(item, 'remove', undefined);
  };
  
  meth.ChangeRadio = function(row){
    //~ console.log("ChangeRadio", arguments);
    let vm = this;
    if (row) vm.selectedRadio = row;
    if ($c.prev_selectedRadio) $c.vue.$set($c.prev_selectedRadio, '_selected', false);
    if (vm.selectedRadio) $c.vue.$set(vm.selectedRadio, '_selected', true);
    $c.prev_selectedRadio = vm.selectedRadio;
    //~ $rootScope.$broadcast("Выбрана спецодежда", vm.selectedRadio);
    $EventBus.$emit("Отметить сотрудников", vm.selectedRadio && vm.selectedRadio['@профили/id']);
  };
  
  meth.ClickRadio = function(row){
    let vm = this;
    if (vm.selectedRadio === /*event.target._value*/ row) {
      vm.selectedRadio = undefined;
      vm.ChangeRadio();
    }
  };
  
  meth.Ref = function(row, pid){/* создание и удаление связи*/
    //~ console.log("Ref", arguments);
    var vm = this;
    vm.$set(row, 'httpSave', true);
    return $http.post(appRoutes.url_for('спецодежда/связь'), {"id1": pid, "id2": row.id})
      .then(function(resp){
        row.httpSave = false;
        if (resp.data.error) return Materialize.toast("Ошибка сохранения: "+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
        if (resp.data.remove) {
          var idx = row['@профили/id'].indexOf(pid);
          if (idx >= 0 ) row['@профили/id'].splice(idx, 1);
          Materialize.toast("Удалено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
        }
        if (resp.data.save) {
          var idx = row['@профили/id'].indexOf(pid);
          if (idx < 0) row['@профили/id'].push(pid);
          Materialize.toast("Сохранено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
        }
      },
      function(){
        row.httpSave = false;
        Materialize.toast("Ошибка сохранения", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      });
  };
  
  const MapProfileRow = function(row){
    var data = this.data;// это массив спецодежды
    var vm = this.vm || $c.vue;
    vm.$set(row, '_hide', !data.some(function(r){ return row.id == r.id; }));
  };
  const MapProfileItem = function(item){
    var data = this.data;
    var vm = this.vm || $c.vue;
    vm.ToggleItem(item, true);
    item['@спецодежда'].map(MapProfileRow, {"item": item, "data": data[item.key]['@спецодежда'], "vm": vm});
    return item;
  };
  $c.LoadProfile = function(profile){
    return $http.post(appRoutes.url_for('спецодежда сотрудника'), {"pid": profile.id})
      .then(function(resp){
        $c.vue.ClickRadio($c.vue.selectedRadio);///сброс
        $c.vue.dataFiltered =  Object.keys(resp.data).map(MapDataKey, {"data": $c.$data, "vm": $c.vue}).map(MapProfileItem, {"data": resp.data, "vm": $c.vue});
      //~ $c.vue.$set(profile, 'спецодежда', );
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