// define a new console
window.console=(function(origConsole){
  'use strict';
  if (!origConsole) 
    origConsole = {};
  
  var enable = false;
  if (origConsole.info && window.setTimeout) window.setTimeout(function(){
    if (!enable) origConsole.info('Включить консольные сообщения можно: console.enable(true); ');
  }, 1000);
    
  return {
    "enable": function(bool){
      if (bool === undefined) return enable;
      enable = bool;
    },
    "log": function(){
      enable && origConsole.log && origConsole.log.apply(origConsole, arguments);
    },
    "info": function (text) {
      enable && origConsole.log && origConsole.info.apply(origConsole, arguments);
    },
    "warn": function (text) {
      enable && origConsole.log && origConsole.warn.apply(origConsole, arguments);
    },
    "error": function (text) {
      enable && origConsole.log && origConsole.error.apply(origConsole, arguments);
    }
  };
}(window.console));

$(document).ready(function(){
  'use strict';
  var headOptions = $('head meta[name="app:options"]').attr('content');
  if (headOptions) headOptions = JSON.parse(headOptions);
  if (headOptions && headOptions.hasOwnProperty('jsDebug')) window.console.enable(headOptions.jsDebug);
  
});