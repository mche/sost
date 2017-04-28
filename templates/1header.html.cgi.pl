'<header>',
div({-class=>"container",},
  h2({-class=>"teal-text",}, $c->config('Проект')),
  $c->include('forms/search',),


),
#~ div({}, a({-href=>$c->oauth2->auth_url("vkontakte",),}, 'ВК')),

div({-class=>"fixed-action-btn horizontal", -style=>"top: 0px; right: 0px;"},
    a( {-class=>"btn-floating btn-large teal", -style=>"padding:0px 17px;"},
      i( {-class=>"large material-icons"}, 'menu'),
      #~ span('Регистрация',)
    ),
    ul({},
      li({}, $c->is_user_authenticated
      ? a({-class=>"btn-floating blue-grey", -href=>$c->url_for('logout'),}, i({-class=>"large material-icons",}, 'lock_outline'), ) . span('Выйти')
      : a({-class=>"btn-floating blue-grey", -href=>$c->url_for('sign'),}, i({-class=>"large material-icons",}, 'exit_to_app'), ) . span('Войти/Регистрация')
      ),
      $c->is_user_authenticated && li({}, a({-class=>"btn-floating blue-grey", -href=>$c->url_for('profile'),}, i({-class=>"large material-icons",}, 'person_pin'), ) . span('Профиль')),
      #~ li({}, a({-class=>"btn-floating blue-grey", -href=>$c->oauth2->auth_url("vkontakte"=>{redirect_uri => $c->url_for('oauth2-login')->userinfo(undef)->to_abs}),}, 'VK'),),
      #~ li({}, a({-class=>"btn-floating red darken-3", -href=>$c->oauth2->auth_url("google"=>{redirect_uri => $c->url_for('oauth2-login')->userinfo(undef)->to_abs},),}, 'G+'),),
#      <li(<a class=><i class="material-icons">insert_chart</i></a></li>
      #~ <li><a class="btn-floating yellow darken-1"><i class="material-icons">format_quote</i></a></li>
      #~ <li><a class="btn-floating green"><i class="material-icons">publish</i></a></li>
      #~ <li><a class="btn-floating blue"><i class="material-icons">attach_file</i></a></li>
    ),
),
'</header>',