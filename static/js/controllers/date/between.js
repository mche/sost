(function () {'use strict';
/*
  зависимость https://date-fns.org/
*/

var moduleName = "DateBetween";

var module = angular.module(moduleName, []);

var Component = function  ($scope, $timeout, $element) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if (!$ctrl.param) $ctrl.param = {};
    if (!$ctrl.param.values) $ctrl.param.values = [];
    $ctrl.param['формат'] = [];
    if(!$ctrl.param.values[0]) $ctrl.param.values[0] = dateFns.startOfMonth(new Date());
    if(!$ctrl.param.values[1]) $ctrl.param.values[1] = new Date();
    $ctrl.param.values[0] = dateFns.format($ctrl.param.values[0], 'YYYY-MM-DD');
    $ctrl.param.values[1] = dateFns.format($ctrl.param.values[1], 'YYYY-MM-DD');
    
    
    //~ console.log("DateBetween", $ctrl.param);
    
    $ctrl.ready = true;
    $timeout(function(){
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        //~ onClose: $ctrl.SetDate,
        onSet: $ctrl.SetDate,
      });//{closeOnSelect: true,}
      
      //формат
      var input = $('input[type="text"]', $($element[0]));
      angular.forEach($ctrl.param.values, function(val, idx){
        $ctrl.param['формат'][idx] = input.eq(idx).val();
      });
      
    });
  };
  
  $ctrl.SetDate = function (context) {// заход из двух мест datepicker+поле даты фокусировка
    if(context && context.target) {    // фокусировка
      $ctrl._target =  context.target;
      return;
    }
    var target = $($ctrl._target);
    var p = target.parent();
    var h = $("input:hidden", p);// скрытое поле
      //~ var d = $('input[name="'+$ctrl._target.id+'"]', $($element[0]));
      //~ console.log("SetDate", target.id, d.val());//$(this.component.$node).val()
    var idx = $("input:hidden", p.parent()).index(h);
    $ctrl.param.values[idx] = h.val();
    $ctrl.param['формат'][idx]= target.val();
  };
  
  $ctrl.Margin = function(){
    return {"margin-top": $ctrl.param.margin || '2rem'};
    
  };
  
  /*
  $ctrl.Cancel = function() {
    if($ctrl.onCancel) $ctrl.onCancel();
    
  };
  
  $ctrl.Ok = function() {
    if($ctrl.onOk) $ctrl.onOk($ctrl.param.date);
    
  };*/
  
  
};

/*=============================================================*/

module

.component('dateBetween', {
  templateUrl: "date/between",
  //~ scope: {},
  bindings: {
    param: '<',
    //~ onOk: '&',
    //~ onCancel: '&',

  },
  controller: Component
})

;

}());