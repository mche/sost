/***
Под jQuery разное:
- проверка версии
- инициализация выплывающей навигации (Materialize)
- отключение консоли

***/
const VersionChanged = function(ver){///
/***
 вернет:
 - undefined - если нет прежней версии (соответственно нет обновления)
 - true(есть обновление)/false(нет обновления) - если передана версия (аргумент) для проверки
 - строку версии - если есть обновление и не передан аргумент (версия)
 - undefined - нет обновления и не передан аргумент (версия)
  
***/
  var old = localStorage.getItem('app:version '+location.pathname);/// || false;// || localStorage.getItem('app config')
  if (!old) return;
  if(!ver) ver = $('head meta[name="app:version"]').attr('content') || 1;
  var changed = ver != old;
  if(arguments[0]) return changed; /// модальная авторизация
  else if (changed) return ver;/// не передан аргумент версии
};

document.VersionChanged = VersionChanged;

$(document).ready(function () {
  'use strict';
  /***
    обновление скриптов работает за счет очистки/пересоздания ассет|пак кэша
    обновление шаблонов через смену ВЕРСИИ (используется в сервисе LoadTemplateCache для добавления к урлам) static/js/controllers/template-cache/script.js
***/
  ///определить что страница загружена авторизованным //~ if ( !($('div[ng-app="formAuth"]').length || $('.status404').length) ) {
  if ($('head meta[name="app:uid"]').attr('content') && !$('.status404').length) {
    //~ if (!old || curr != old) {
    var ver = VersionChanged();
    if (ver) {
      //~ console.log("Перезапуск страницы с новой версией: ", curr);
      Materialize.Toast($('<a href="javascript:" class="hover-shadow3d green-text text-darken-4">').click(function(){ return true; }).html('Обновление <i class="material-icons" style="">refresh</i> '+ver), 5000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
      localStorage.setItem('app:version ' + location.pathname, ver);
      location.reload(true); 
    }
    //~ console.log("Версия: ", curr, old == curr ? undefined : old);
  }
  
  
  /*
  Навигация сайта выплывает слева или справа
  */
  var rsn = $("a.right-side-nav");
  var lsn = $("a.left-side-nav");
  if(rsn.length) rsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'right', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
  if(lsn.length) {
    lsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'left', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
    //~ $('div.left-side-hover').on( "mouseover", function(){ console.log("div.left-side-hover mouseover", lsn); lsn.sideNav('show'); } );
  }
  
  /***
  Расширение главной колонки
  
  ***/
  if (window.innerWidth < 1200) $('main div.container').addClass('wide');
  /*** гасим консоль ***/
  try {
    var $console = angular.injector(['Console']).get('$Console');
    var headOptions = $('head meta[name="app:options"]').attr('content');
    if (headOptions) headOptions = JSON.parse(headOptions);
    if (headOptions && headOptions.hasOwnProperty('jsDebug')) $console.enable(headOptions.jsDebug);
  } catch (e) {}
  
});

