(function () {'use strict';
/*
*/
var moduleName = "Спецодежда::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Спецодежда::Форма', 'Компонент::Сотрудники', 'EventBus']);//'ngSanitize',appRoutes

const Factory = function($http, $q, $timeout, $templateCache,/*$rootScope, */ appRoutes, $КомпонентСпецодеждаФорма, $СотрудникиДанные, $EventBus){
  //~ var $c = this;
  var meth = {/*методы Vue*/};
  
  meth.EventBus = function(){
    let vm = this;
    $EventBus.$on('Выбран сотрудник', function(profile){
      //~ console.log("Получен сотрудник", JSON.stringify(profile));
      //~ vm.profile = undefined;
      //~ vm.ChangeFilterKey('');
      vm.Refresh({"профиль": profile && profile.id, "append": false})
        .then(function(){
          vm.profile = profile;
        });
      $EventBus.$emit("Отметить сотрудников", undefined);
    });
  
    const eventOnSelectProfile = {/// функции для $EventBus.$on('Отметка сотрудника'
      "SomePID": function(pid){ return this.profile.id == pid; },
      "MapCnt": function(row){/// инкремент если уже в списке
        var some = row['@профили/id'].some(eventOnSelectProfile.SomePID, {"profile": this.profile});
        this.cnt[row.id] /*+*/= (this.cnt[row.id] || 0) + (some ? 1 : 0);
        this.cnt[this.profile.id] /*+*/= (this.cnt[this.profile.id] || 0) + (some ? 1 : 0);
      },
      "FilterCnt": function(row_id){
        return (row_id != this.profile.id) && (!this.cnt[row_id] || this.cnt[this.profile.id] == this.vm.selectedRows.length);
      },
    };
    $EventBus.$on('Отметка сотрудника', function(profile){
      //~ console.log(profile.id, vm.selectedRadio);
      /// только для тех отмеченных строк, где этого профиля нет или во всех он есть (удаление связи)
      var cnt = {};
      vm.selectedRows.map(eventOnSelectProfile.MapCnt, {"profile": profile, "cnt": cnt});
      //~ console.log("Отметка сотрудника", cnt);
      var rows = Object.keys(cnt).filter(eventOnSelectProfile.FilterCnt, {"profile": profile, "cnt": cnt, "vm": vm});
      if (rows.length) vm.Ref(profile.id, rows);
      //~ else Materialize.toast("---", 3000, 'orange-text text-darken-3 orange lighten-3 fw500 border animated zoomInUp fast');
    });
  }; /// EventBus()
  
  meth.Init = function(){
    let vm = this;
    
    vm.EventBus();
    vm.LoadData({"lookup": true}).then(function(){
      vm.dataFiltered = [...vm.data];
      vm.ready = true;
      $timeout(function(){
        $('.modal', $(vm.$el)).modal();
        vm.Autocomplete();
      });
    });
        
  };
  
  meth.LoadData = function(param){
    let vm = this;
    param = param || {};
    vm.data = vm.data || [];
    vm.lookup = vm.lookup || [];
    
    if(!param.append) vm.data.splice(0, vm.data.length);
    if (param.lookup) vm.lookup.splice(0, vm.lookup.length);
    param.limit = param.limit || vm.param.limit;
    var async = [];
    async.push($http.post(appRoutes.url_for('спецодежда/список'), param).then(function(resp){
      Array.prototype.push.apply(vm.data, resp.data.shift());
      if (param.lookup) Array.prototype.push.apply(vm.lookup, resp.data.shift());
    }));
    async.push($СотрудникиДанные.Load().then(function(resp){
      vm.$профили = $СотрудникиДанные.$Data();
    }));
    return $q.all(async);
    
  };
  
  meth.Autocomplete = function(){
    let vm = this;
    vm.textField = vm.textField || $('input[type="text"]', $(vm.$el));
    var lookup = vm.lookup.map(function(val){
      return {"value": val};
    });
    vm.textField.autocomplete({
      "lookup": lookup,
      "appendTo": vm.textField.parent(),
      "formatResult": function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      "onSelect": function (suggestion) {
        //~ console.log("onSelect", suggestion);
        vm.Refresh({"наименование": suggestion.value, "append": false});
      },
      //~ onSearchComplete: function(query, suggestions){},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  meth.Refresh = function(param){///
    var vm = this;
    angular.extend(vm.param, param);
    if (param.append) vm.param.offset = vm.param.offset + vm.param.limit;
    else vm.param.offset = 0;
    //~ vm.param['наименование'] = n;
    //~ vm.param.append = undefined;
    vm.httpLoad = true;
    vm.dataFiltered = [];
    return vm.LoadData(vm.param)
      .then(function(){
        vm.dataFiltered = [...vm.data];///долго бился косяк, просто присвоение - нереактивный массив
        //~ console.log(vm.dataFiltered[0] === vm.data[0]);
        vm.httpLoad = false;
      });
    
  };
  
  meth.ToggleProfiles = function(row){
    var vm = this;
    vm.$set(row, 'развернуть список профилей', !row['развернуть список профилей']);
  };
  
  meth.GetProfile = function(pid){
    let vm = this;
    return vm.$профили[pid] || {"names": '???'};
  };
  
  meth.OpenForm = function(item){
    //~ edit = edit || angular.copy(item);// ||  {'наименование': item['наименование'], 'ед': item['ед'],};
    this.$set(item, 'edit', true);
    //~ console.log("OpenForm", item);
  };
  
  meth.CloseForm = function(item){//// из компонента формы vm.$emit('close-form', vm.item);
    let vm = this;
    var row = item.id && vm.dataFiltered.find(function(row){ return row.id==item.id; });//.pop();
    if (item.save || item.remove) {//сохранено редактирование и удаление
      var idx = row ? vm.dataFiltered.indexOf(row) : -1;
      if (idx >= 0) vm.dataFiltered.splice(idx, 1);
      if (item.save) {
        vm.dataFiltered.splice(idx < 0 ? 0 : idx, 0, item.save);
        ///vm.ChangeRadio(item.save);
      } ///else vm.ClickRadio(item);
      vm.ChangeChb(item.save || item, true);
    }
    vm.$set(item, 'edit', false);
    if (row) vm.$set(row, 'edit', false);
    vm.$set(item, 'save', undefined);
    vm.$set(item, 'remove', undefined);
    //~ console.log("CloseForm", item, row, item === row);
  };
  
  const MapSelectedRows = function(row){
    var that = this;
    row['@профили/id'].map(function(pid){ that.cnt[pid] = (that.cnt[pid] || 0)+1; })
    //~ Array.prototype.push.apply(that.pids, row['@профили/id'] || []);
  };
  meth.ChangeChb = function(row, val){
    let vm = this;
    if (val !== undefined) vm.$set(row, '_selected', val);
    let idx = vm.selectedRows.indexOf(row);
    if (idx >= 0) vm.selectedRows.splice(idx, 1);
    else vm.selectedRows.push(row);
    var cnt = {};
    vm.selectedRows.map(MapSelectedRows, {"cnt": cnt});
    var pids = Object.keys(cnt).filter(function(pid){ return cnt[pid] == vm.selectedRows.length; });
    $EventBus.$emit("Отметить сотрудников", pids);
  };
  
  /*meth.ClickRadio = function(row){
    let vm = this;
    if (vm.selectedRadio === row) {
      vm.selectedRadio = undefined;
      vm.ChangeRadio();
    }
  };*/
  
  const MapRowHTTP = function(row){/// много строк прогресса
    var rows = this.rows, vm = this.vm, val = this.val;
    if (rows.some(function(id){ return id == row.id; })) vm.$set(row, 'httpSave', val);
  };
  ///
  meth.Ref = function(pid, rows){/* создание и удаление связи*/
    //~ console.log("Ref", arguments);
    var vm = this;
    vm.selectedRows.map(MapRowHTTP, {"vm": vm, "rows": rows, "val": true});
    
    return $http.post(appRoutes.url_for('спецодежда/связь'), {"id1": pid, "id2": rows})///vm.selectedRows.map(function(row){ return row.id; })
      .then(function(resp){
        vm.selectedRows.map(MapRowHTTP, {"vm": vm, "rows": rows, "val": false});
        if (resp.data.error) return Materialize.toast("Ошибка сохранения: "+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
        if (resp.data.remove) {
          resp.data.remove.map(function(rem){
            vm.selectedRows.map(function(row){
              var idx = row['@профили/id'].indexOf(rem.id1);
              if (idx >= 0 ) row['@профили/id'].splice(idx, 1);
            });
            Materialize.toast("Удалено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
          });
        }
        if (resp.data.save) {
          resp.data.save.map(function(rem){
            vm.selectedRows.map(function(row){
              var idx = row['@профили/id'].indexOf(rem.id1);
              if (idx < 0) row['@профили/id'].push(rem.id1);
            });
            Materialize.toast("Сохранено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
          });
          
        }
      },
      function(){
        vm.selectedRows.map(MapRowHTTP, {"vm": vm, "rows": rows, "val": false});
        Materialize.toast("Ошибка сохранения", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      });
  };
  
return /*конструктор*/function (data){
  let $this = this;
  data = data || {};
  
  return {
    "template": $templateCache.get('спецодежда/таблица'),
    //~ "props": ['param'],
    "data": function () {
      let vm = this;
      return {
        "ready": false,
        "param": {"наименование": '', "limit": 50, "offset": 0,},
        "profile": undefined,
        "dataFiltered": [],///this.DataArray($c.$data)
        "newItem": {},
        "selectedRows": [],///undefined
        "confirm": undefined,/// любой объект на подтверждение
        "httpLoad": undefined,
      };
    },
    "methods": meth,
    /*"computed": {
      "edit": function(){
        return this.InitItem(angular.copy(this.item));
      }
    },*/
    "created"() {},
    "mounted"() {
      //~ console.log('mounted', this);
      this.Init();
    },
    "components": {
      'guard-ware-form': new $КомпонентСпецодеждаФорма(),
    },
  };
}; /// конструктор
  
};/// Factory()

/*=====================================================================*/

module

//~ .component('guardWare', {
  //~ "controllerAs": '$c',
  //~ "templateUrl": "спецодежда/таблица",
  //~ "bindings": {
    //~ param: '<',
    //~ data: '<', ///может массив

  //~ },
  //~ controller: Controll
//~ })
.factory('$КомпонентСпецодеждаТаблица', Factory)
;

}());