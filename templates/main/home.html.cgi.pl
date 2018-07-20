my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

my $nav = $c->include('menu-nav', format=>'html', handler=>'cgi.pl',);

my $nav_items = $c->stash('пункты навигации');

return  $c->redirect_to($nav_items->[0]{url_for},) # если один пункт навигации сразу на него
  if $nav_items && @$nav_items eq 1 && $c->match->endpoint && $c->match->endpoint->name ne $nav_items->[0]{url_for};

#~ $c->app->log->error($c->stash('пункты навигации'));

$c->layout('main', format=>'html', handler=>'ep', 'header-title' => 'Начало');

h1($uid ? 'Главная страница' : 'Добро пожаловать'),

($nav || ''),


