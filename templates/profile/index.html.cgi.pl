$c->layout('main', handler=>'ep', title=>'Профиль');


#~ my $dbh = $c->stash('dbh');
#~ my $sth = $c->stash('sth');
my $uid = $c->auth_user->{id};
#~ my $login = $c->auth_user->{login};
my $ou = $c->oauth->model->oauth_users_by_profile($uid);
my $error = $c->vars( qw(error err) ) || delete $c->session->{oauth_err};
my $conflict = $c->vars( qw(site) )
  if $error && $error eq 'CONFLICT';
my $old_pw = $c->vars( qw(pw old_pw) );


#~ div({-style=>"white-space: pre-wrap; overflow-wrap: break-word;"}, $c->render_to_string(json=> {%{$c->auth_user}})),

! (scalar keys %$ou) && !$c->auth_user->{login} &&  div({-class=>"red lighten-5 red-text text-darken-2", -style=>"border: 1px solid; padding: 10px; margin: 1em 0;"}, 'Внимание! Текуший профиль не имеет логина и внешней авторизации. Чтобы не потерять профиль присоедините сейчас внешнюю авторизацию.'),

div({},
  form({-name=>"formProfile", -class=>"", -method=>"post", -action000=>$c->url_for("профиль сохранить"), "ng-app"=>"formProfile", "ng-controller"=>"formProfileControll as ctrl",},#  "ng-submit"=>"ctrl.Submit()"
    div({'ng-hide'=>"ctrl.ready", 'ng-include'=>" 'progress/load' ",}, ''),
    div({'ng-if'=>"ctrl.ready", -class=>"row",},
      
      div({-class=>"col m8 s12"},
        div({-class=>"right"}, "#$uid"),
        h2('Мой аккаунт', ),
        form_profile({'data-profile'=>"profile", 'data-old-pw'=>"'$old_pw'"}, ''),
        

      ),
      div({-class=>"col m4 s12"},

        ($error || '') && div({-style=>"color:red;"}, 'Ошибка внешней авторизации: ', $error),
        ($conflict || '') && div({-style=>"color:red;"}, 
          "Вход через пользователя сайта ", span({-class=>"black-text"}, $conflict), " уже используется в другом профиле сервиса Лови Газель",
          p("Можно сейчас", a({-class=>"btn relogin", -href=>$c->url_for('logout')->query(redirect=>$c->url_for('oauth-login', site=>$conflict)),},"переключиться"), " на этот профиль."),
        ),
        #~ h4('Внешние профили (', scalar keys %$ou, ')'),
        oauth_profile({'data-profile'=>"profile"}, ''),
      ),
    ),
  ),
),






#~ ul({},
  #~ map  {
    #~ my $oauth = $ou->{$_->{name}};# по имени сайта
    #~ $oauth->{profile} = $c->app->json->decode($oauth->{profile})
      #~ and delete(@$oauth{qw(ts profile_ts site_name site_id)})
      #~ and delete (@{$oauth->{profile}}{qw(user_id access_token expires_in token_type refresh_token)})
      #~ if $oauth;
    #~ li({-class=>$oauth ? 'site_joined' : '',},

#~ div({-class=>"card teal darken-1",},
  #~ div({-class=>"card-content white-text",},
  
    #~ div({-class=>"card-title",},
      #~ a({-class=>"btn-floating ".($oauth ? 'grey' : $_->{btn_class} || 'white'), -href=>$oauth ? 'javascript:"только_одна_авторизация"' : $c->url_for('oauth-login', site=> $_->{name}), -title=>$oauth ? 'уже есть авторизация этого сайта' : 'присоединить в профиль вход через этот сайт', -style=>"line-height: normal;"},
        #~ img({-src=>"/img/logo/$_->{name}.png", -style=>"width: 100%; vertical-align: middle;", -alt=>"$_->{name} logo",}, ''),
      #~ ),
      #~ span($_->{title} || $_->{name}),
    #~ ),
    
    #~ $oauth ? div({-style=>"white-space: pre-wrap; overflow-wrap: break-word;"}, $c->dumper($oauth)) : '',
    
  #~ ),
  #~ $oauth && div({-class=>"card-action",},
    #~ a({-class=>"waves-effect waves-light btn". ($oauth ? '' : ' disabled'), -href=>$c->url_for('oauth-detach', site=> $_->{name}),},
      #~ i({-class=>"material-icons left",}, 'remove_circle_outline'),
      #~ 'Отсоединить',
    #~ ),
  #~ ),
#~ ),

  #~ ); } grep($_->{id}, values %{$c->oauth2->providers})# @{$c->stash('oauth')}

#~ ),

