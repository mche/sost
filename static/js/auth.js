import {AuthForm, ModalAuth} from './svelte-auth/dist/index.mjs';
/// static/js/svelte-auth $ npm run build
//parcel build --no-source-maps --no-minify --log-level 5 -d dist/ auth.js
// в ассетпак js/dist/auth.js

const DOMVersion = ()=>{
  return document.querySelector('head meta[name="app:version"]').getAttribute('content');
};

const StorageVersion = (test, set)=>{
  let ver = window.localStorage.getItem('app:version '+window.location.pathname);
  if (test) {
    if (!ver ||  test != ver) {
      window.localStorage.setItem('app:version '+window.location.pathname, set || test);
      return false;
    } else return true;
  }
  return ver;
};

const ShowUpdate = (msg)=>{
  Materialize.Toast($('<a href="javascript:" class="hover-shadow3d red-text text-darken-4">')
    .click(function(){ document.getElementById('toast-container').remove(); window.location.reload(true); })
    .html('Обновите [F5] страницу <i class="material-icons" style="">refresh</i> '+msg), 30000, 'red lighten-4 red-text text-darken-4 border fw500 animated zoomInUp');
};


document.addEventListener("DOMContentLoaded", function(event) {
  'use strict';
  let app = document.querySelector('app-auth');
  if (app) new AuthForm({"target": app, "props":{"Success":(data)=>{
    if (data.version && !StorageVersion(data.version, 1) ) window.location.reload(true);
    else window.location.reload();
    
  }}});
  else {
    
    const ShowModalAuth = ()=>{
      let comp = new ModalAuth({"target": document.body, "props":{"Success":(data)=>{
        setTimeout(()=>{ comp.$destroy(); }, 1000);///анимацию
        if (data.version && !StorageVersion(data.version, 1)) ShowUpdate(data.version);
        
      }}});
    };
    
    let deferred,
      reset = ()=>{
        deferred = undefined;
      },
      
      eventCallback =  ev => {
        if (deferred) return;
        deferred = setTimeout(reset, 60*1000);
        //~ 
        fetch('/keepalive').then((resp)=>{
          if (resp.ok) return resp.text().then((version)=>{
            //~ console.log("проверка версии", version, StorageVersion(version)));
            if (!StorageVersion(version,1)) ShowUpdate(version);
            
          }); /// строка версии
          else Materialize.Toast($('<a  href="javascript:" class="hover-shadow3d white-text bold">').click(function(){ ShowModalAuth(); document.getElementById('toast-container').remove(); }).html('Завершилась авторизация, войти заново <i class="icon-login"></i>'), 30*1000, 'red darken-2 animated zoomInUp');
          
        });
      }
    ;
    document.addEventListener('mousemove', eventCallback);
    //~ window.addEventListener('scroll', eventCallback);
    
  }
  
  if ( document.querySelector('head meta[name="app:uid"]').getAttribute('content') && !$('.status404').length ) {
    var curr = DOMVersion();
    if (!StorageVersion(curr, curr)) {
      //~ console.log("Перезапуск страницы с новой версией: ", ver);
      Materialize.Toast($('<a href="javascript:" class="hover-shadow3d green-text text-darken-4">').click(function(){ window.location.reload(true); }).html('Обновление <i class="material-icons" style="">refresh</i> '+curr), 5000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
      //~ window.localStorage.setItem('app:version ' + window.location.pathname, ver);
      //~ StorageVersion(ver);
      window.location.reload(true); 
    }
    //~ console.log("Версия: ", curr, old == curr ? undefined : old);
  }
});