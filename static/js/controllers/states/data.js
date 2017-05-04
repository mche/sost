(function () {'use strict';
/*
  Состояния звонков и заявок
  Использование:
  1. AssetPack
  angular.module(moduleName, [....,'States'])
  States.get(60) - по коду 60 получить всю запись
  States.get(60, 'class-text') - по коду 60 получить только поле 'class-text'
  States.get([30,40]) -- вернет тоже массив
  States.get([60]) -- вернет тоже массив
  States.get([60], 'dsdsf') -- вернет тоже массив (второй параметр игнор)
*/
  
var moduleName = "States";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* failed to require */ }
var module = angular.module(moduleName, ['appRoutes', 'User', 'RatingStars']); // 'appRoutes'
/* копипастить сюда
SELECT array_to_json(array_agg(t)) FROM "Коды состояния"() t;
*/
var data = [{"id":1,"состояние":"Созданная","заголовок списка":"Созданные","заголовок кнопки":"Создание","class-bg":"","class-text":"black-text","icon":null,"ид кнопки":null},{"id":10,"состояние":"Новая","заголовок списка":"Новые","заголовок кнопки":"Новая","class-bg":"","class-text":"black-text","icon":"icon-hand-paper-o fs12","ид кнопки":null},{"id":50,"состояние":"Активная","заголовок списка":"Активные","заголовок кнопки":"Активно","class-bg":"deep-purple","class-text":"deep-purple-text","icon":"icon-ok-2 fs12","ид кнопки":null},{"id":20,"состояние":"Просроченная","заголовок списка":"Просроченные","заголовок кнопки":"Просрочено","class-bg":"grey darken-2","class-text":"grey-text text-darken-2","icon":"icon-stopwatch fs12","ид кнопки":null},{"id":60,"состояние":"Принятая","заголовок списка":"Принятые","заголовок кнопки":"Заказ принят","class-bg":"green darken-3","class-text":"green-text text-darken-3","icon":"icon-handshake-o fs12","ид кнопки":1},{"id":100,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":101,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":102,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":103,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":104,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":105,"состояние":"Завершенная","заголовок списка":"Завершенные","заголовок кнопки":"Завершено","class-bg":"lime darken-4","class-text":"lime-text text-darken-4","icon":"icon-thumbs-up fs12","ид кнопки":null},{"id":30,"состояние":"Отказная","заголовок списка":"Отказанные","заголовок кнопки":"Отказано","class-bg":"red darken-3","class-text":"red-text text-darken-3","icon":"icon-thumbs-down fs12","ид кнопки":2},{"id":40,"состояние":"Отклонённая","заголовок списка":"Отклонённые","заголовок кнопки":"Не подходит","class-bg":"red darken-1","class-text":"red-text text-darken-1","icon":"icon-thumbs-down fs12","ид кнопки":3},{"id":45,"состояние":"Отмененная","заголовок списка":"Отмененные","заголовок кнопки":"Отмена","class-bg":"red","class-text":"red-text","icon":"icon-thumbs-down fs12","ид кнопки":null},{"id":2,"состояние":"Нет связи","заголовок списка":null,"заголовок кнопки":null,"class-bg":"yellow darken-3","class-text":"yellow-text text-darken-3","icon":"icon-mobile-alt icon-stack-1x fs18, icon-cancel icon-stack-1x red-text","ид кнопки":4},{"id":4,"состояние":"Не отвечает","заголовок списка":null,"заголовок кнопки":null,"class-bg":"yellow darken-4","class-text":"yellow-text text-darken-4","icon":"icon-mobile-alt icon-stack-1x fs18, icon-cancel icon-stack-1x red-text","ид кнопки":5},{"id":6,"состояние":"Позвоню позже","заголовок списка":null,"заголовок кнопки":null,"class-bg":"grey darken-2","class-text":"grey-text text-darken-2","icon":"icon-bell-off","ид кнопки":6}]
;

var filter1 = function (code, idx) {// this - item
  return this.id == code;
};

var filter2 = function (item, idx) {// this - code(can array)
  if (this === undefined) return false;
  if (this.length) return !!(this.filter(filter1, item).shift());
  //~ console.log(item.id, this);
  return item.id == this;
};

var get = function (code, key) {// по коду состояния (и названию поля)
  if (code === undefined) return undefined;
  var f = data.filter(filter2, code);
  //~ console.log(f);
  if(code.length) return f;
  if(!f.length) return undefined;// ничего не нашел
  f = f.shift();
  if(!key) return f;
  return f[key];
};

var reIcon = new RegExp('^\s*icon-');
var testIconClass = function(id_or_item) {
  if(!angular.isObject(id_or_item)) id_or_item = get(id_or_item);
  return reIcon.test(id_or_item.icon);
};

/*одна позиция может относится к нескольким вкладкам*/
var filterStates = function (item, idx) {// this - state
  return item == this.id;
};
var cntFilter = function (state, idx) {// this - data item
  if (this._states === undefined) this._states = '';
  if (state._cnt === undefined) state._cnt = 0;
  if (state._idx === undefined) state._idx = idx+1;
  
  var data_state = this["состояние"] || (angular.isArray(this["состояния"]) && this["состояния"][ this["состояния"].length - 1]["код состояния"]);

  if ( state.id == data_state || (angular.isArray(data_state) && data_state.filter(filterStates, state).shift()) ||  state.id + data_state > 200 ){
    this._states += state["состояние"]+';';
    state._cnt++;
  }
  return false;
};
var count = function(arr) {// массив для подсчета по состояниям
  angular.forEach(arr, function(item, idx) {
    data.filter(cntFilter, item);//просто второй цикл
  });
};
var clearCount = function (arr) {// сбросить посчет перед повторным счетом (это мобил)
  angular.forEach(arr, function(item, idx) {
    delete item._states;
  });
  angular.forEach(data, function(item, idx) {
    delete item._cnt;
    delete item._idx;
  });
};


var SplitIconClass = function(id_or_item){
  if(!angular.isObject(id_or_item)) id_or_item = get(id_or_item);
  if (!id_or_item.icon) return;
  return id_or_item.icon.split(',');
};

var reStackIcon = new RegExp('icon-stack');
var StackIconClass = function(id_or_item){//наложение иконок фонтелло
  if(!angular.isObject(id_or_item)) id_or_item = get(id_or_item);
  if (!id_or_item.icon) return;
  return reStackIcon.test(id_or_item.icon);
};

var factory = {
  data: data,
  get: get,
  testIconClass: testIconClass,
  count: count,
  clearCount: clearCount,
  SplitIconClass: SplitIconClass,
  StackIconClass: StackIconClass
};

module

.run(function ($window) {
  $window['angular.'+moduleName] = factory;
})

.factory(moduleName, function () {//appRoutes
  return factory;
})



;

}());