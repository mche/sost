my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

my $nav = $c->include('menu-nav', format=>'html', handler=>'cgi.pl',);

my $nav_items = $c->stash('пункты навигации');

return  $c->redirect_to($nav_items->[0]{url_for},) # если один пункт навигации сразу на него
  if $nav_items && @$nav_items eq 1 && $c->match->endpoint && $c->match->endpoint->name ne $nav_items->[0]{url_for};

#~ $c->app->log->error($c->stash('пункты навигации'));

$c->layout('main', format=>'html', handler=>'ep', 'header-title' => 'Начало');

h1({-class=>'center',}, $uid ? 'Главная страница' : 'Добро пожаловать'),

(!$uid || '') && div({-class=>"row", "ng000-app"=>"Форма авторизации", "ng000-controller"=>"Controll as ctrl",}, 

  div({-class=>"col s12 m6 l4 offset-m3 offset-l4   "},
        #~ form_auth({'ng-if'=>"ctrl.ready", 'data-param'=> 'param'}, ''),
        app_auth(), # подхватит auth.js
  ),
  #~ div({-class=>"row"},
  #~ div({-class=>"col l4 m12 s12"},
    #~ form_oauth({'ng-if'=>"ctrl.ready",}, ''),
    #~ div({-class=>"col s12 m6 l4 offset-m3 offset-l4 animated slideInDown slow",},
      #~ img({-src=>"/i/logo/welcome.png", -alt=>"welcome img", -style=>"width:100%;", -class=>"card"}),
      #~ '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 900 600" class="card"><use xlink:href="/i/img.svg#welcome" /></svg>',
    #~ ),
  #~ ),
),

div({-class=>"card teal-lighten-5 animated slideInUp",}, $nav || ''),


