(function () {'use strict'; try {
/*

*/
var moduleName = "States";
var module = angular.module(moduleName);
  
var Controll = function ($scope, $http, $q, $timeout, States, appRoutes, User) {//States factory from this module!
  var $ctrl = this; 
  $scope.States = States;
  
  $ctrl.Init = function(){
    $timeout(function(){
      $ctrl.param = $ctrl.param || {};
      $scope.data = $ctrl.ask['состояния'];
      var ls1 = $ctrl.lastState();
      var ls2 = $ctrl.lastState(null, 2); // предпоследнее сост
      if ( ls1['код состояния'] != 45 && ls1['код состояния'] >=100 && ls2['код состояния'] < 100 && !$ctrl.isMyState(ls1) ) $ctrl.newState();// && !$ctrl.isMyState(ls2)
      $ctrl.ready = true;
    });
  };
  
  $ctrl.newArray = function(len) {
    return new Array(len);
  };
  
  $ctrl.lastState = function (attr, n) {// n- позиция с конца
    //~ var curr = ctrl.currentItem;
    //~ if (!curr) return curr;
    //~ var states = ctrl.currentItem['состояния'];
    if (n === undefined) n = 1;
    var last = $scope.data[$scope.data.length - n];
    if (!attr) return last;
    return last[attr];
  };
  
  $ctrl.newState = function () {
    var newState = {'код состояния':100, 'оценка':0, 'коммент':null, _new: true};
    if ($ctrl.param.asker) {newState._title_rate='Моя оценка выполнения'; newState._title_comment='Мой комментарий/отзыв к выполнению';}
    else {newState._title_rate='Моя оценка заказа'; newState._title_comment='Мой комментарий/отзыв к заказу';} // исполнитель
    $scope.data.push(newState);
  };
  $ctrl.isMyState = function (state) {
    //~ return $ctrl.userId == state['установил состояние'];
    return User.id() == state['установил состояние'];
  };
  
  $ctrl.CancelState = function (state, title) {
    $scope.data.push({'код состояния': state, _title_comment: title,'коммент':null, _new: true});
  };
  $ctrl.rmNewState = function () {
    $scope.data.pop();
  };
  
  
  $ctrl.btnStateSave = function() {
    //~ var states = ctrl.currentItem['состояния'];
    //~ var data = states[states.length - 1];
    var ask = $ctrl.ask;
    var data = $ctrl.lastState();
    data['заявка']=$ctrl.ask.id;
    if (ask._transport || ask['транспорт?']) data.transport = ask._transport || ask['транспорт?']; // новая заявка
    //~ return console.log(data);
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    $http.post(appRoutes.url_for("сохранить состояние заявки"), data, {timeout: $ctrl.cancelerHttp.promise})//$attrs.askStateUrl
      .then(function(resp) {
        delete $ctrl.cancelerHttp;
        if(resp.data['состояния']) {//ctrl.currentItem['состояния'] = resp.data['состояния'];
          $scope.data.length = 0;
          Array.prototype.push.apply($scope.data, resp.data['состояния']);
          if ($ctrl.onStateCallback) $ctrl.onStateCallback(resp.data['состояния']);
        }
        if(resp.data.err || resp.data.error) $scope.saveStateErr = resp.data.err || resp.data.error;
      });
  };
  
  $ctrl.btnState = function (state) {//boolean
    //~ if(!ctrl.currentItem) return false;
    //~ var states = ctrl.currentItem['состояния'];
    //~ if (!state) return !!states;
    return state == $ctrl.lastState("код состояния"); 
  };
  
};


module

.component('statesList', {
  templateUrl: "states/list",
  bindings: {
    ask: '<',// заявка
    param: '<', //asker: '<',// boolean из формы заявки true
      //~ askId: '<',
    //~ userId: '<',
    onStateCallback: '<',

  },
  controller: Controll
})
;

} catch(err){console.log("Ошибка компиляции в списке состояний заявки " + err.stack);}
}());