my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

my $nav = $c->include('menu-nav', format=>'html', handler=>'cgi.pl',);

my $nav_items = $c->stash('пункты навигации');

return  $c->redirect_to($nav_items->[0]{url_for},) # если один пункт навигации сразу на него
  if $nav_items && @$nav_items eq 1 && $c->match->endpoint && $c->match->endpoint->name ne $nav_items->[0]{url_for};

#~ $c->app->log->error($c->stash('пункты навигации'));

$c->layout('main', format=>'html', handler=>'ep', 'header-title' => 'Начало');

h1({-class=>'center',}, $uid ? 'Главная страница' : 'Добро пожаловать'),

(!$uid || '') && div({-class=>"row", "ng-app"=>"Форма авторизации", "ng-controller"=>"Controll as ctrl",}, 

  div({-class=>"col s12 m6 l4 offset-m3 offset-l4   "},
    #~ h4('Авторизация/регистрация'),
      #~ form({-id00=>"formAuth", -class=>"", -method=>"post", -action000=>$c->url_for("обычная авторизация/регистрация"), },
        #~ div({'ng-hide'=>"ctrl.ready", 'ng-include'=>" 'progress/load' ",}, ''),
        #~ div({'ng-if'=>"ctrl.ready", 'ng-include'=>" 'profile/form-auth' "}, ''),
        form_auth({'ng-if'=>"ctrl.ready", 'data-param'=> 'param'}, ''),
      #~ ),
  ),
  div({-class=>"row"},
  #~ div({-class=>"col l4 m12 s12"},
    #~ form_oauth({'ng-if'=>"ctrl.ready",}, ''),
    div({-class=>"col s12 m6 offset-m3 animated slideInUp slow",},
      img({-src=>"/i/logo/welcome.png", -alt=>"welcome img", -style=>"width:100%;",}),
    ),
  ),
),

div({-class=>"teal-lighten-5 animated slideInUp",}, $nav || ''),


