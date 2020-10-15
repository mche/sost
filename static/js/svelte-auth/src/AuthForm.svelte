<div>
<div class="card teal lighten-5 animated-000-slideInUp"><!-- col s12 m6 l4 offset-m3 offset-l4    -->
  <div class="card-content">
    <h2 class="center">
      <i class="icon-login"></i>
      Вход в систему
    </h2>
    <h4>Логин</h4>
    <div class="input-fields">

      <div class="input-field">
        <input name="login" type="text" class="validate" bind:value={login} on:keypress={EnterSend} required placeholder="имя или телефон">
        <!--label for="login" data-error="" data-success="" class="active">Логин</label-->
        
      </div>
      
      <h4>Пароль</h4>
      <div ng-show="!$c.forget && !$c.remem" class="input-field">
        <input name="passwd" type="password" class="validate" bind:value={passwd} on:keypress={EnterSend}  required placeholder="**********">
        <!--label for="passwd" data-error="" data-success="" class="active">Пароль</label-->
      </div>
      
      <!--div class="right-align">
        <a ng-click="$c.forgetClick()" ng-class="{disabled: !$c.validLogin()}" href="javascript:">не помню пароль</a>
      </div>
      
      <div ng-show="$c.remem" class="input-field">
        <input name="remem_code" type="text" class="validate" ng-model="$c.remem.code" ng-keypress="$c.enterSend($event)" required>
        <label for="remem_code" data-error="" data-success="" class="active">Высланный пароль</label>
      </div-->
      
    </div>
    
{#if false}
    <div class="" ng-if="!$c.remem && !$c.forget && $c.captcha">
      <h5>Проверьте логин/пароль для входа</h5>
    </div>
{/if}
    
{#if error}
    <div class="clearfix red-text">{error}</div>
{/if}
    <!--div class="clearfix green-text" ng-show="$c.success">{{$c.success}}</div-->

{#if checking}
    <div class="progress z-depth-1 teal-lighten-4" style="height: inherit;"><div class="center teal-text text-darken-2">Проверка...</div><div class="indeterminate teal"></div></div>
{/if}
    
  </div>
  
  
  
  <div class="card-action center">
    <a on:click={Send} href="javascript:" class=" btn-large" class:disabled>
      <i class="icon-login"></i>
    </a>
  </div>
</div>

</div><!--- row -->

<script>
  import Http from './http.js';
  ///import md5 from 'nano-md5';
  let md5 = require('nano-md5');

  let login = '';
  let passwd = '';
  let error;
  let checking;
  export let Success;// Callback
  
  $: disabled = !(login.length > 1 && passwd.length > 3);
  
  const appRoutes = function(){
    return angular.injector(['AppRoutes']).get('appRoutes');
  }
  
  const Send = ()=>{
    error = undefined;
    checking = true;
    Http.post(appRoutes().urlFor("обычная авторизация/регистрация"), {login, "passwd":md5(passwd)})
      .then((data)=>{
        checking = false;
        if (data.error) error = data.error;
        if (data.id) {//успешный вход
          Materialize.Toast('Успешный вход', 3000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
          if (Success) return Success(data);
          window.location.href = '/';
        }
      
      });
//~     
  };
  
  const EnterSend = (ev)=>{
//~     console.log("EnterSend");
    if (ev.keyCode == 13) Send();
  
  };

</script>