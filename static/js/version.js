$(document).ready(function () {
  var version = '2017-07-26-1';
  var old = localStorage.getItem('VERSION');
  if(!old) return localStorage.setItem('VERSION', version);
  if (version != old) {
    console.log("Перезапуск страницы с новой версией");
    localStorage.setItem('VERSION', version);
    location.reload(true); 
  }
  
});