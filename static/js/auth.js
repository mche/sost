import {AuthForm, ModalAuth} from './svelte-auth/dist/index.mjs';
/// static/js/svelte-auth $ npm run build
//parcel build --no-source-maps --no-minify --log-level 5 -d dist/ auth.js
// в ассетпак js/dist/auth.js

 const VersionChanged = (ver)=>{///
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

const ShowUpdate = (msg)=>{
  Materialize.Toast($('<a href="javascript:" class="hover-shadow3d red-text text-darken-4">')
    .click(function(){ document.getElementById('toast-container').remove(); window.location.reload(true); })
    .html('Обновите [F5] страницу <i class="material-icons" style="">refresh</i> '+msg), 30000, 'red lighten-4 red-text text-darken-4 border fw500 animated zoomInUp');
};


document.addEventListener("DOMContentLoaded", function(event) {
  'use strict';
  let app = document.querySelector('app-auth');
  if (app) new AuthForm({"target": app, "props":{"Success":(data)=>{
    if (data.version && VersionChanged(data.version)) window.location.reload(true);
    else window.location.reload();
    
  }}});
  else {
    
    const ShowModalAuth = ()=>{
      let comp = new ModalAuth({"target": document.body, "props":{"Success":(data)=>{
        setTimeout(()=>{ comp.$destroy(); }, 1000);///анимацию
        if (data.version && VersionChanged(data.version)) ShowUpdate(data.version);
        
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
          if (resp.ok) return resp.text();/// строка версии
          else Materialize.Toast($('<a  href="javascript:" class="hover-shadow3d white-text bold">').click(function(){ ShowModalAuth(); document.getElementById('toast-container').remove(); }).html('Завершилась авторизация, войти заново <i class="icon-login"></i>'), 30*1000, 'red darken-2 animated zoomInUp');
          
        })
        .then((version)=>{
          if (VersionChanged(version)) ShowUpdate(version);
          
        })
        ;
      }
    ;
    document.addEventListener('mousemove', eventCallback);
    //~ window.addEventListener('scroll', eventCallback);
    
  }
})