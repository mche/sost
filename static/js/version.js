(function () {
  'use strict';
/*
обновление скриптов работает за счет очистки/пересоздания ассет|пак кэша
обновление шаблонов через смену ВЕРСИИ (используется в сервисе LoadTemplateCache для добавления к урлам) static/js/controllers/template-cache/script.js
*/
  
  var curr = {"VERSION": '2017-10-09T10:03'};
  var old = JSON.parse(localStorage.getItem('app uniost') || localStorage.getItem('app config') || 'false');
  //~ if(!old) return localStorage.setItem('app config', JSON.stringify(curr));
  if (!old || curr.VERSION != old.VERSION) {
    console.log("Перезапуск страницы с новой версией", curr.VERSION);
    localStorage.setItem('app config', JSON.stringify(curr));
    location.reload(true); 
    //~ config = data;
  }
  console.log("Конфиг", curr);

})();
