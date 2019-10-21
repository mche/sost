(function ($) {
  $(document).ready(function() {


    // Radio and Checkbox focus class
    var radio_checkbox = 'input[type=radio], input[type=checkbox]';
    $(document).on('keyup.radio', radio_checkbox, function(e) {
      // TAB, check if tabbing to radio or checkbox.
      if (e.which === 9) {
        $(this).addClass('tabbed');
        var $this = $(this);
        $this.one('blur', function(e) {

          $(this).removeClass('tabbed');
        });
        return;
      }
    });
  });
  
  if (Vue) Vue.component('v-progress-indeterminate', { "props": ['color', 'message'], "data": function () { return { }}, "template": '<div :class="`progress z-depth-1 ${ color }-lighten-4`" style="height: inherit;"><div :class="`center ${ color }-text text-darken-2`">{{ message }}</div><div :class="`indeterminate ${ color }`"></div></div>',});

}( jQuery ));
