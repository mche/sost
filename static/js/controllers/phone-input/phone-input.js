/*
http://codepen.io/vladymy/pen/oboEBo
Automatic phone number formatting in input field

Credits:
    - Wade Tandy via
    http://stackoverflow.com/questions/19094150/using-angularjs-directive-to-format-input-field-while-leaving-scope-variable-unc
    
    - kstep via
    http://stackoverflow.com/questions/12700145/how-to-format-a-telephone-number-in-angularjs
    
    - hans via
    http://codepen.io/hans/details/uDmzf/
*/

(function () {
'use strict';

var app = angular.module('phone.input', []);

var re = {
  tel: /(\d{1,3})(\d{1,3})?(\d{1,2})?(\d{1,2})?/,
  tel_star: /([\d\*X]{1,3})([\d\*X]{1,3})?([\d\*X]{1,2})?([\d\*X]{1,2})?/,
  non_digit:  /[^0-9]/g,
  non_digit_star:  /[^0-9\*X]/g
};

var format = function (nums) {// array
  if (!nums) return nums;
  var fmt = "(" + nums[1];
  if ( nums[1] && nums[1].length == 3 ) fmt += ") ";
  if ( nums[2] ) fmt += nums[2];
  if ( nums[2] && nums[2].length == 3 ) fmt += "-";
  if ( nums[3] ) fmt += nums[3];
  if ( nums[3] && nums[3].length == 2 ) fmt += "-";
  if (nums[4]) fmt += nums[4];
  
  return fmt;
  
};

app.directive('phoneInput', function($filter, $browser) {
  return {
    require: 'ngModel',
    link: function($scope, $element, $attrs, ngModelCtrl) {
      var listener = function() {
        var value = $element.val().replace(re.non_digit, '');
        $element.val($filter('tel')(value, false));
      };

      // This runs when we update the text field
      ngModelCtrl.$parsers.push(function(viewValue) {
        return viewValue.replace(re.non_digit, '').slice(0,10);
      });

      // This runs when the model gets updated on the scope directly and keeps our view in sync
      ngModelCtrl.$render = function() {
        $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
      };

      $element.bind('change', listener);
      $element.bind('keydown', function(event) {
        var key = event.keyCode;
        // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
        // This lets us support copy and paste too
        if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40) || key == 8 || key == 46 ){
            return;
        }
        $browser.defer(listener); // Have to do this or changes don't get picked up properly
      });

      $element.bind('paste cut', function() {
          $browser.defer(listener);
      });
    }

  };
});
app.filter('tel', function () {
  return function (tel) {
    if (!tel) { return ''; }

    var value = tel.toString().replace(re.non_digit, '').slice(0,10);//.replace(/^\+/, '');

    //~ if (value.match(re.non_digit)) {
        //~ return tel;
   //~ }
  
    //~ var nums = re.tel.exec(value);
    return format(value.match(re.tel));
    
  };
});

app.filter('tel_star', function () {
  return function (tel) {
    if (!tel) { return ''; }

    var value = tel.toString().replace(re.non_digit_star, '').slice(0,10);//.replace(/^\+/, '');

    //~ if (value.match(re.non_digit)) {
        //~ return tel;
   //~ }
  
    //~ var nums = re.tel.exec(value);
    return format(value.match(re.tel_star));
  };
});

app.factory('phoneInput', function() {
  var validate = function(tel) {
    var ok = tel && tel.length >= 10 && ! re.non_digit.test(tel);
    //~ console.log('validate: '+tel, ok);
    if(ok) return true;
    return false;
  };
  var factory = {
    validate: validate,
  };
  return factory;
});

}());