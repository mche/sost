my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

my $nav = $c->include('menu-nav',);

my $nav_items = $c->stash('пункты навигации');

return  $c->redirect_to($nav_items->[0]{url_for},) # если один пункт навигации сразу на него
  if $nav_items && @$nav_items eq 1 && $c->match->endpoint && $c->match->endpoint->name ne $nav_items->[0]{url_for};

$c->app->log->error($c->stash('пункты навигации'));

$c->layout('main', handler=>'ep', 'header-title' => 'Начало');

h1($uid ? 'Главная страница' : 'Добро пожаловать'),

#~ div({},
  #~ a({-class=>"left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      #~ i({-class=>"material-icons",}, 'menu'),
      #~ span("Навигация системы"),
  #~ ),
#~ ),

($nav || ''),

#~ div({}, a({-href=>$c->url_for('waltex'), -class=>"btn-large"}, 'Движение денежных средств')),

#~ ($uid || ()) 
#~ && ul(

  #~ li({}, a({-class=>"btn", -href=>$c->url_for('табель рабочего времени'),}, i({-class=>"material-icons",}, 'tab'), 'Табель рабочего времени на объектах и в подразделениях', ), ),
  
#~ ),

