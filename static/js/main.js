/***
Под jQuery разное:
- инициализация выплывающей навигации (Materialize)
***/

$(document).ready(function () {
  'use strict';
  /***  Навигация сайта выплывает слева или справа ***/
  var rsn = $("a.right-side-nav");
  var lsn = $("a.left-side-nav");
  if(rsn.length) rsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'right', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
  if(lsn.length) {
    lsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'left', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
    //~ $('div.left-side-hover').on( "mouseover", function(){ console.log("div.left-side-hover mouseover", lsn); lsn.sideNav('show'); } );
  }
  
  /***   Расширение главной колонки  ***/
  if (window.innerWidth < 1200) $('main div.container').addClass('wide');
  /*** гасим консоль -  теперь в app.js  ***/
  //~ try {
    //~ var $console = angular.injector(['Console']).get('$Console');
    //~ var headOptions = $('head meta[name="app:options"]').attr('content');
    //~ if (headOptions) headOptions = JSON.parse(headOptions);
    //~ if (headOptions && headOptions.hasOwnProperty('jsDebug')) $console.enable(headOptions.jsDebug);
  //~ } catch (e) {}
  
});

