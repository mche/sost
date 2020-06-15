my $profile = $c->auth_user
  if $c->is_user_authenticated;
my $uid = $profile->{id}
  if $profile;

my $nav = $c->include('menu-nav', format=>'html', handler=>'cgi.pl',);

my $login_li = !$uid && $c->match->endpoint && $c->match->endpoint->name ne 'profile' && $c->match->endpoint->name ne 'home'
  ? li({},
      a({-class=>"btn-large000 hover-shadow3d white-text", -href=>$c->url_for('profile')->query(from=>$c->url_for->path), -title=>"Вход/Регистрация",},#btn-large000 black-text000 teal000 lighten-1000
        #~ i({-class=>"material-icons",}, 'exit_to_app'),
        i({-class=>"icon-login",}, ''),
        span({-class=>"hide-on-small-only",}, 'Вход',),
        
      ),
    )
    : '';



header(
div({-class=>"header clearfix animated slideInDown",},

nav({-class=>"top", -style=>"box-shadow: none;"},
div({-class=>"nav-wrapper valign-wrapper",},
  div({-class=>"logo left  animated slideInLeft slow",},
    #~ a({-href000=>"/", -class=>"brand-logo1 btn-floating btn-large white left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      #~ img({-src=>"/apple-touch-icon.png", -alt=>"", -style=>"width:100%; vertical-align: middle;"}),
    #~ ),
    a({-class=>"left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},#
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 152 152" style="height:3rem;" class="white circle animated rotatIng delay-1s-000 slower"><use xlink:href="/i/img.svg#logoU"></use></svg>',
    ),
  ),
  
  a({-class=>"left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
    h1({-class=>"left--- white-text fw500 font-effect-3d-float", -style=>"padding-left: 0.5rem;",},
    #i({-class=>"material-icons",}, 'menu'),
      span({-class=>"middle-000"}, $c->stash('header-title') || $c->title || ''),
      span({-class=>"teal-text-darken-1"}, '★'.$c->app->config('Проект')),#i({-class=>"material-icons"}, 'keyboard_arrow_right'), 
      
      #~ $uid ? span({-class=>"chip red-text animated slideInRight slower"}, 'восстановлено на 24 сентября!') : (),
    ),
  ),
  
  
  ($login_li && ul({-class=>"fixed-action-btn horizontal click-to-toggle", -style=>"position:absolute; top: 5px; right: 5px;",},#hide-on-med-and-down0100
    
    $login_li,
  )),
  
  #~ $c->stash("контент в верхней навигации") && div({-class=>"right"}, $c->stash("контент в верхней навигации")),
#~ div({-class=>"left-side-hover transparent", -style=>"z-index:100; position: fixed; height:100%; width:10px;", -onmouseover=>q|$('a.left-side-nav').sideNav('show');|}, ''),# наводка откроет навигацию

div({-id=>"left-side-top-nav", -class=>"side-nav white", },
  
  $nav || ul({-class=>"menu-nav", -style000=>"margin:0;",},#jq-dropdown-menu
  
  li({-class=>"teal-text"}, 
    ($uid || '') && a({-class=>"right", -href=>"javascript:location.reload(true);", -style=>"margin:0;", -title=>'обновить этот экран с очисткой кэша'}, i({-class=>"material-icons", -style=>"margin:0;", }, 'refresh'), ),#span('Обновить актуально'), 
    a({-class00=>"", -href=>$c->url_for('home'), -title=>'версия от '.$c->app->config('версия')}, i({-class=>"material-icons",}, 'home'), span('Начало системы'), ),
    
  
  ),#, span({-class=>"chip000 padd-0-05-000 right grey-text", -style=>"margin:0;", -title=>"версия системы"}, $c->app->config('версия'))
  #~ li({-class=>"grey-text"}, a({-class00=>"", -href=>"javascript:location.reload(true);", -title=>'этот экран с очисткой кэша'}, i({-class=>"material-icons",}, 'refresh'), span('Обновить актуально'), ), ),
  
  
  #~ ($nav || '') && li({-style00=>"white-space: pre;", -title=>""}, $nav),

  
  #~ ($uid || '') && li({-class=>"black-text",}, a({-class00=>"", -href=>$c->url_for('profile')->query(from=>$c->url_for->path),}, i({-class=>"icon-user",}, ''), 'Профиль', span({-class=>"hide",-id=>"session-default-expiration"}, ($c->app->config->{'сессия'} || $c->app->config->{'session'})->{default_expiration}),), ),
  
  #~ ($uid || '') && li({-class=>"red-text",}, a({-class00=>"", -href=>$c->url_for('logout')->query(from=>$c->url_for->path),}, i({-class=>"icon-logout",}, ''), 'Выход', )),
  
  $login_li,
  
  #~ li(
    #~ a({-class=>"dropdown-button", -href=>"#!", 'data-activates'=>"dropdown123"}, 'Еще ...',
      #~ i({-class=>"material-icons right000",}, 'arrow_drop_down'),
    #~ ),
  #~ ),
  #~ ul({-id=>'dropdown123', -class=>'dropdown-content',},
    #~ li(a({-href=>"#!",}, 'Первый туда'),),
    #~ li(a({-href=>"#!",}, 'Второй сюда'),),
    #~ li(a({-href=>"#!",}, 'Третий никуда'),),
  #~ ),
  #~ map {li({}, a({-href=>"#$_", -class=>"waves-effect waves-teal",}, "еще пункт...$_"))} (3..10),
),
#~ div({'ng-if'=>"ctrl.ready", 'ng-include'=>" 'sidenav/main' "}, ''),
),

),
),

),
),

