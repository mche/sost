my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

my $nav = $c->include('menu-nav', format=>'html', handler=>'cgi.pl',);

my $nav_items = $c->stash('пункты навигации');

return  $c->redirect_to($nav_items->[0]{url_for},) # если один пункт навигации сразу на него
  if $nav_items && @$nav_items eq 1 && $c->match->endpoint && $c->match->endpoint->name ne $nav_items->[0]{url_for};

#~ $c->app->log->error($c->stash('пункты навигации'));

$c->layout('main', format=>'html', handler=>'ep', 'header-title' => 'Начало ★ UniOST');

h1({-class=>'center',}, $uid ? 'Главная страница' : 'Добро пожаловать'),
# катринка в модуле formAuth

(!$uid || '') && div({-class000=>"row", "ng-app"=>"formAuth", "ng-controller"=>"formAuthControll as ctrl",}, 

  div({-class0000=>"col l4 m6 s12"},
    #~ h4('Авторизация/регистрация'),
      #~ form({-id00=>"formAuth", -class=>"", -method=>"post", -action000=>$c->url_for("обычная авторизация/регистрация"), },
        div({'ng-hide'=>"ctrl.ready", 'ng-include'=>" 'progress/load' ",}, ''),
        #~ div({'ng-if'=>"ctrl.ready", 'ng-include'=>" 'profile/form-auth' "}, ''),
        form_auth({'ng-if'=>"ctrl.ready", 'data-param'=> 'param'}, ''),
      #~ ),
  ),
  #~ div({-class=>"col l4 m12 s12"},
    #~ form_oauth({'ng-if'=>"ctrl.ready",}, ''),
  #~ ),
),

div({-class=>"teal-lighten-5 animated slideInUp",}, $nav || ''),


