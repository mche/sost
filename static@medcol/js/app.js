(function () {
  
  Vue.component('v-progress-indeterminate', { "props": ['color', 'message'], /*"data": function () { return { }},*/ "template": '<div :class="`progress z-depth-1 ${ color }-lighten-4`" style="height: inherit;"><div :class="`center ${ color }-text text-darken-2`">{{ message }}</div><div :class="`indeterminate ${ color }`"></div></div>',});
  Vue.component('v-preloader-circular-small', { "props": ['color'], "template": '<div><div class="preloader-wrapper small active"><div class="spinner-layer  " :class=" `border-${ color }` "><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>',});
  
/**
** $EventBus.$emit("мое событие", data);
** $EventBus.$on('мое событие', function(data){ ... });
*/
  angular.module('EventBus', [])
    .factory('$EventBus', function(){
      return new Vue();
    });

}( ));