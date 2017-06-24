my $profile = $c->auth_user
  if $c->is_user_authenticated;;
my $uid = $profile->{id}
  if $profile;

my $level;# для навигационого цикла
=pod
my $nav = '<ul class="nav-tree collapsible00 collapsible-accordion000">'.
    join "\n", map {
      
      my $li = 
       (($level && $level < $_->{level}) ? qq'<ul class="collapsible-body000">' : '')
      .($level && $level eq $_->{level} ? '</li>' : '')
      .($level && $level > $_->{level} ? (qq'</li></ul>' x ($level - $_->{level})) . qq'</li>' : '')
      .qq'<li class="bold"><a class="collapsible-header000 waves-effect00 waves-teal00">$_->{name}</a>'
      #~ li({-class=>"bold",}, a({-class=>"collapsible-header waves-effect waves-teal",}, ))
      ;
      $level = $_->{level};
      $li; # return
      
    } @{$c->app->models->{'Access'}->навигация([map $_->{id}, grep !$_->{disable}, @{$profile->roles}])}
  
  if $profile;
$nav .= (qq'</li></ul>' x ($level - 1)) . qq'</li></ul>'
  if $nav;
#~ $c->app->log->error($nav);
=cut
my $nav = ul({},
  map {
    my $r  = $_;
    li({}, a({}, map(span({-class=>"breadcrumb black-text", -title=>}, $r->{parents_name}[$_]), (1..$#{$_->{parents_name}})), span({-class=>"breadcrumb black-text",}, $_->{name}),));
    
  } @{$c->app->models->{'Access'}->навигация([map $_->{id}, grep !$_->{disable}, @{$profile->roles}])},
)
  if $profile;

my $login_li = !$uid && $c->match->endpoint && $c->match->endpoint->name ne 'profile'
  ? li({},
      a({-class=>"btn-large000 black-text000 teal000 lighten-1000", -href=>$c->url_for('profile')->query(from=>$c->url_for->path), -title=>"Вход/Регистрация",},#btn-large000 black-text000 teal000 lighten-1000
        i({-class=>"material-icons",}, 'exit_to_app'),
        span({-class=>"hide-on-small-only",}, 'Вход',),
        
      ),
    )
    : '';

header(
div({-class=>"header clearfix",},

nav({-class=>"top"},
div({-class=>"nav-wrapper",},
  div({-class=>"logo left",},
    a({-href000=>"/", -class=>"brand-logo1 btn-floating btn-large white left-side", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      img({-src=>"/apple-touch-icon.png", -alt=>"", -style=>"width:70%; vertical-align: middle;"}),
    ),
    #~ a({-href000=>"/", -class=>"brand-logo1 btn-floating btn-large white left-side", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      #~ i({-class=>"material-icons teal-text text-darken-4",}, 'menu'),
    #~ ),
  ),#$c->config('Проект') <i class="material-icons">album</i>
  
  a({-class=>"left-side", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},h1({-class=>"left white-text"},
    i({-class=>"material-icons",}, 'menu'),
    $c->stash('header-title') || $c->title || $c->config('Проект')
  ),),
  
  #~ div({-class=>"form-search right", -style=>"width: 55%; margin-right: 0;"}, $c->include('forms/search',),),
  
  ($login_li && ul({-class=>"fixed-action-btn horizontal click-to-toggle", -style=>"position:absolute; top: 0px; right: 0px;",},#hide-on-med-and-down0100
    
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

div({-id=>"left-side-top-nav", -class=>"side-nav", },
  
  ul({-style=>"margin:0;",},#jq-dropdown-menu
  
  li({}, a({-class00=>"", -href=>$c->url_for('home'),}, i({-class=>"material-icons",}, 'home'), 'Начало системы', ), ),
  
  #~ ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('движение ДС'),}, i({-class=>"material-icons",}, 'account_balance'), 'Движение денег', ), ),
  
  #~ ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('отчет ДС'),}, i({-class=>"material-icons",}, 'report'), 'Отчет по деньгам', ), ),
  
  #~ ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('табель рабочего времени'),}, i({-class=>"material-icons",}, 'tab'), 'Табель', ), ),
  
  #~ ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('табель рабочего времени/отчет'),}, i({-class=>"material-icons",}, 'tab'), 'Отчет по табелю рабочего времени', ), ),
  
  li({-style00=>"white-space: pre;", -title=>""}, $nav),

  
  ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('profile')->query(from=>$c->url_for->path),}, i({-class=>"material-icons",}, 'person'), 'Профиль', ), ),
  
  ($uid || '') && li({}, a({-class00=>"", -href=>$c->url_for('logout')->query(from=>$c->url_for->path),}, i({-class=>"material-icons",}, 'lock_outline'), 'Выход', )),
  
  $login_li,
  
  li(
    a({-class=>"dropdown-button", -href=>"#!", 'data-activates'=>"dropdown123"}, 'Еще ...',
      i({-class=>"material-icons right000",}, 'arrow_drop_down'),
    ),
  ),
  ul({-id=>'dropdown123', -class=>'dropdown-content',},
    li(a({-href=>"#!",}, 'Первый туда'),),
    li(a({-href=>"#!",}, 'Второй сюда'),),
    li(a({-href=>"#!",}, 'Третий оттуда'),),
  ),
  #~ map {li({}, a({-href=>"#$_", -class=>"waves-effect waves-teal",}, "еще пункт...$_"))} (3..10),
),
#~ div({'ng-if'=>"ctrl.ready", 'ng-include'=>" 'sidenav/main' "}, ''),
),

),
),

),
),

