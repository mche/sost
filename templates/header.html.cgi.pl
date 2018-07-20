my $profile = $c->auth_user
  if $c->is_user_authenticated;
my $uid = $profile->{id}
  if $profile;

my $nav = $c->include('menu-nav',);

my $login_li = !$uid && $c->match->endpoint && $c->match->endpoint->name ne 'profile'
  ? li({},
      a({-class=>"btn-large000 ", -href=>$c->url_for('profile')->query(from=>$c->url_for->path), -title=>"Вход/Регистрация",},#btn-large000 black-text000 teal000 lighten-1000
        #~ i({-class=>"material-icons",}, 'exit_to_app'),
        i({-class=>"icon-login",}, ''),
        span({-class=>"hide-on-small-only",}, 'Вход',),
        
      ),
    )
    : '';



header(
div({-class=>"header clearfix",},

nav({-class=>"top", -style=>"box-shadow: none;"},
div({-class=>"nav-wrapper valign-wrapper",},
  div({-class=>"logo left",},
    a({-href000=>"/", -class=>"brand-logo1 btn-floating btn-large white left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      img({-src=>"/apple-touch-icon.png", -alt=>"", -style=>"width:100%; vertical-align: middle;"}),
    ),
  ),
  
  a({-class=>"left-side-nav", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
    h1({-class=>"left--- white-text fw500 font-effect-3d-float", -style000=>"margin-left:5rem; min-height:58px;",},
    #i({-class=>"material-icons",}, 'menu'),
      $c->stash('header-title') || $c->title || $c->config('Проект'),
    ),
  ),
  
  #~ div({-class=>"form-search right", -style=>"width: 55%; margin-right: 0;"}, $c->include('forms/search',),),
  
  ($login_li && ul({-class=>"fixed-action-btn horizontal click-to-toggle", -style=>"position:absolute; top: 5px; right: 5px;",},#hide-on-med-and-down0100
    
    #~ $uid
    #~ ? li({-class=>"notifications-container", }, 
      #~ a({-class=>"button-collapse000 btn-floating btn-large black right-side full hide-on-large-only000", -style=>"", 'data-activates'=>"right-side-top-nav", -href=>"javascript:", },#'cachedAjaxScript'=>"/js/materialize/sideNav.js",
        #~ (0 || '') && span({-class=>"notifications-container", },
         #~ span({-class=>"notifications-icon overlay grow infinite yellow darken-2 white-text ", -style=>"right: 10px; top: 10px;"}, ''),#span({-class=>"notifications-icon-count"},'!')
         #~ span({-class=>"notification-inner",},    )
        #~ ),
        #~ i({-class=>"material-icons teal lighten-1 black-text",},'menu'),#
      #~ ),
    
    #~ )
    $login_li,
  )),
  
  #~ $c->stash("контент в верхней навигации") && div({-class=>"right"}, $c->stash("контент в верхней навигации")),
#~ div({-class=>"left-side-hover transparent", -style=>"z-index:100; position: fixed; height:100%; width:10px;", -onmouseover=>q|$('a.left-side-nav').sideNav('show');|}, ''),# наводка откроет навигацию

div({-id=>"left-side-top-nav", -class=>"side-nav", },
  
  ul({-style=>"margin:0;",},#jq-dropdown-menu
  
  li({-class=>"teal-text"}, a({-class00=>"", -href=>$c->url_for('home'),}, i({-class=>"material-icons",}, 'home'), span('Начало системы'), span({-class=>"chip000 padd-0-05-000 right grey-text", -style=>"margin:0;", -title=>"версия системы"}, $c->config('версия') || ''), ), ),
  
  ($nav || '') && li({-style00=>"white-space: pre;", -title=>""}, $nav),

  
  ($uid || '') && li({-class=>"black-text",}, a({-class00=>"", -href=>$c->url_for('profile')->query(from=>$c->url_for->path),}, i({-class=>"icon-user",}, ''), 'Профиль', span({-class=>"hide",-id=>"session-default-expiration"}, ($c->app->config->{'сессия'} || $c->app->config->{'session'})->{default_expiration}),), ),
  
  ($uid || '') && li({-class=>"red-text",}, a({-class00=>"", -href=>$c->url_for('logout')->query(from=>$c->url_for->path),}, i({-class=>"icon-logout",}, ''), 'Выход', )),
  
  $login_li,
  
  li(
    a({-class=>"dropdown-button", -href=>"#!", 'data-activates'=>"dropdown123"}, 'Еще ...',
      i({-class=>"material-icons right000",}, 'arrow_drop_down'),
    ),
  ),
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

