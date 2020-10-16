import {AuthForm, ModalAuth} from './svelte-auth/dist/index.mjs';
/** static/js/svelte-auth $ npm run build
** parcel build --no-source-maps --log-level 3 -d ../dist/ ../auth.js
** в ассетпак js/dist/auth.js
**/

// нет так больше в два раза, чем выше
//~ import AuthForm from './svelte-auth/src/AuthForm.svelte';
//~ import ModalAuth from './svelte-auth/src/ModalAuth.svelte';


const DOMVersion = (version)=>{
  let dom = document.querySelector('head meta[name="app:version"]');
  if (version) dom.setAttribute('content', version);
  else return dom.getAttribute('content');
};

const CheckVersion = (test, set)=>{
  let ver = window.localStorage.getItem('app:version '+window.location.pathname);
  let dom = DOMVersion();
  //~ if (test) {
    if (!ver ||  test != ver || test != dom) {
      window.localStorage.setItem('app:version '+window.location.pathname, set || test);
      return false;
    } else return true;
  //~ }
  //~ return ver;
};

const ShowUpdate = (msg)=>{
  if (document.querySelector('.status404') ) return;
  return new Promise((resolve, reject) => {
    Materialize.Toast($('<a href="javascript:" class="hover-shadow3d red-text text-darken-4">')
      .click(function(){ document.getElementById('toast-container').remove(); resolve();  })
      .html('Обновите [F5] страницу <i class="material-icons" style="">refresh</i> '+msg), 30*1000, 'red lighten-4 red-text text-darken-4 border fw500 animated zoomInUp');
    
  });
  
};

const ReloadCache = (version)=>{
  CheckVersion(version, version);
  window.location.reload(true);
};


document.addEventListener("DOMContentLoaded", function(event) {
  'use strict';
  let app = document.querySelector('app-auth');
  let auth;
  if (app) auth = new AuthForm({"target": app, "props":{"Success":(data)=>{
    setTimeout(()=>{
      auth.$destroy();
      if (data.version && !CheckVersion(data.version, data.version) ) window.location.reload(true);
      else window.location.reload();
    }, 500);///анимацию
  }}});
  //~ else if (!document.querySelector('head meta[name="app:uid"]').getAttribute('content') || document.querySelector('.status404') ) return;
  else {
    
    let modalAuth;/// как флажок модального окна
    let deferred; /// как флажок задержки
    
    const ShowModalAuth = ()=>{
      if (modalAuth) return;
      modalAuth = new ModalAuth({"target": document.body, "props":{"Success":(data)=>{
        setTimeout(()=>{ modalAuth.$destroy(); modalAuth = undefined; }, 1000);///анимацию
        if (data.version && !CheckVersion(data.version, 1)) ShowUpdate(data.version).then(()=>{ ReloadCache(data.version); });
      }}});
    };
    
    const Reset = ()=>{ deferred = undefined;  };
    
    const EventCallback =  ev => {
      if (deferred) return;
      deferred = setTimeout(Reset, 60*1000);
      //~ 
      fetch('/keepalive').then((resp)=>{
        if (resp.ok) return resp.json().then((data)=>{
          if (data.version && !CheckVersion(data.version,1)) ShowUpdate(data.version).then(()=>{ ReloadCache(data.version); });
        }); /// строка версии
        else Materialize.Toast($('<a  href="javascript:" class="hover-shadow3d white-text bold">').click(function(){ ShowModalAuth(); document.getElementById('toast-container').remove(); }).html('Завершилась авторизация, войти заново <i class="icon-login"></i>'), 30*1000, 'red darken-2 animated zoomInUp');
        
      });
    };
      
    deferred = setTimeout(Reset, 5*60*1000);// чтобы сразу не стартовал
      
      
    document.addEventListener('mousemove', EventCallback);
    window.addEventListener('scroll', EventCallback);
    
  }
  
  if ( document.querySelector('head meta[name="app:uid"]').getAttribute('content') && !document.querySelector('.status404') ) {
    var curr = DOMVersion();
    if (!CheckVersion(curr, curr)) {
      //~ console.log("Перезапуск страницы с новой версией: ", ver);
      //~ Materialize.Toast($('<a href="javascript:" class="hover-shadow3d green-text text-darken-4">').click(function(){ window.location.reload(true); }).html('Обновление <i class="material-icons" style="">refresh</i> '+curr), 5000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
      //~ ReloadCache(curr);
      window.location.reload(true); 
    }
    //~ console.log("Версия: ", curr, old == curr ? undefined : old);
  }
});