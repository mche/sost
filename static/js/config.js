$(document).ready(function () {
  
  $.ajax({
    url: "/config",
    dataType: 'json',
    cache: true,
    success: function(data){
      if(data.VERSION) {
        var old = localStorage.getItem('VERSION');
        if(!old) return localStorage.setItem('VERSION', data.VERSION);
        if (data.VERSION != old) {
          console.log("Перезапуск страницы с новой версией");
          localStorage.setItem('VERSION', data.VERSION);
          location.reload(true); 
        }
      }
    }
  });
});