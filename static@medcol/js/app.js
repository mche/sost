(function () {
  
  Vue.component('v-progress-indeterminate', { "props": ['color', 'message'], "data": function () { return { }}, "template": '<div :class="`progress z-depth-1 ${ color }-lighten-4`" style="height: inherit;"><div :class="`center ${ color }-text text-darken-2`">{{ message }}</div><div :class="`indeterminate ${ color }`"></div></div>',});
  
/**
** $EventBus.$emit("мое событие", data);
** $EventBus.$on('мое событие', function(data){ ... });
*/
  angular.module('EventBus', [])
    .factory('$EventBus', function(){
      return new Vue();
    });

}( ));