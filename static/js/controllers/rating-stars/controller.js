(function() {
  'use strict';
/* https://github.com/juank11memphis/angular-jk-rating-stars */
  function Controll($attrs, $timeout) {

    var ctrl = this;

    if (ctrl.readOnly === undefined) {
      ctrl.readOnly = false;
    }

    ctrl.initStarsArray = function() {
      ctrl.starsArray = ctrl.getStarsArray();
      ctrl.validateStars();
    };

    ctrl.getStarsArray = function() {
      var starsArray = [];
      for (var index = 0; index < ctrl.maxRating; index++) {
        var starItem = {
          index: index,
          class: 'star-off'
        };
        starsArray.push(starItem);
      }
      return starsArray;
    };

    ctrl.setRating = function(rating) {
      if (ctrl.readOnly) return;
      ctrl.rating = rating;
      
      //~ ctrl.validateStars(ctrl.rating);
      $timeout(function() {
        ctrl.onRating({
          rating: ctrl.rating
        });
      });
    };

    ctrl.setMouseOverRating = function(rating) {
      if (ctrl.readOnly) return;
      ctrl.validateStars(rating);
    };

    ctrl.validateStars = function(rating) {
      if (!ctrl.starsArray || ctrl.starsArray.length === 0) {
        return;
      }
      for (var index = 0; index < ctrl.starsArray.length; index++) {
        var starItem = ctrl.starsArray[index];
        if (index <= (rating - 1)) {
          starItem.class = 'star-on';
        } else {
          starItem.class = 'star-off';
        }
      }
    };

  }

  angular
    .module('RatingStars')
    .controller('RatingStarsController', //[
      //'$attrs', '$timeout',
      Controll
  //  ]
  );

}());
