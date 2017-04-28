(function ($) {
  /*
  @param callback, which execute when all scripts done loaded (param optional)
  @param options is a ajax options, see  jQuery.ajax( options ) (param optional)
    by default cache: true, dataType: "script",
  
  DOM:
  
  <a ... cachedAjaxScript="/js/profile.js" cachedAjaxScriptDone="elem.pluginFoo(methodOrOptions, ...);",>Push...</a>
  <script cachedAjaxScript="/js/foo.js"></script>
  <div cachedAjaxScript="/js/bar.js"></div>
  
  
  DOM atributes for elements:
  cachedAjaxScript="/js/scriptFoo.js" (i.e. url) (atribute required)
  cachedAjaxScriptDone="code string evalutes on this script loaded success".
      Enabled variable 'elem' is pointer to jQuery DOM element (atribute optional)
  
  Note. The callback param exec only if ALL scripts loaded successfully.
  
  Usage:
  $('*[cachedAjaxScript]').cachedAjaxScript(function () {
    // extended functionality ready!!
    $('#btnSave').profile('btnSaveProfile');
  });
  
  */
  
  var ajaxDone = function (elem, url, options) {
    
    return function( script, textStatus, jqxhr ) {
      if (jqxhr.status == '200' || jqxhr.status == '304') {
        options.done++;
        elem.removeAttr('cachedAjaxScript');
        elem.attr('done-cachedAjaxScript', url);
        var evalCode = elem.attr('cachedAjaxScriptDone');
        if (typeof evalCode == 'string' && evalCode.length) {
          eval(evalCode);
        }
      }
      //~ else {
        //~ console.log(url + '  loading error: ' + jqxhr.status + ' ' + textStatus);
      //~ }
      if (options.done == options.total) {
        if (typeof options.callback === 'function' ) {
          options.callback();
        }
      }
    };
  };
  
  $.fn.cachedAjaxScript = function (callback, options) {
    
    var defaults = {
      dataType: "script",
      cache: true,
      //url
    };
    options = $.extend(defaults, options);
    
    //  evalute callback when done=total
    var counter = {// один для всех
      total: $(this).length,
      done: 0,
      callback: callback,
    };
    
    $(this).each(function(){
      var $this = $(this);
      options.url = $this.attr('cachedAjaxScript');
      if (typeof options.url == 'string' && options.url.length) {
        jQuery.ajax( options ).done(ajaxDone($this, options.url, counter));
      }
    });
  };
}( jQuery ));
