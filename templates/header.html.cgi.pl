my $signed = $c->auth_user->{id}
  if $c->is_user_authenticated;

header(
div({-class=>"header clearfix",},

nav({-class=>"top"},
div({-class=>"nav-wrapper",},
  div({-class=>"logo left",},
    a({-href=>"/", -class=>"brand-logo1 btn-floating btn-large white",},
      #~ img({-src=>"/i/truck-48-237857.png", -alt=>"", -style=>"width:70%; vertical-align: middle;"}),
      img({-src=>"/apple-touch-icon.png", -alt=>"", -style=>"width:70%; vertical-align: middle;"}),
      #~ i({-class=>"material-icons  black-text",}, 'home'),
    ),
  ),#$c->config('Проект') <i class="material-icons">album</i>
  
  h1({-class=>"left white-text"}, $c->stash('header-title') || $c->title || $c->config('Проект')),
  
  #~ div({-class=>"form-search right", -style=>"width: 55%; margin-right: 0;"}, $c->include('forms/search',),),
  
  ul({-class=>"fixed-action-btn horizontal click-to-toggle", -style=>"position:absolute; top: 0px; right: 0px;",},#hide-on-med-and-down0100
    
    $signed
    ? li({-class=>"notifications-container", }, a({-class=>"button-collapse000 btn-floating btn-large black right-side full hide-on-large-only000", -style=>"", 'data-activates'=>"right-side-top-nav", -href=>"javascript:", },#'cachedAjaxScript'=>"/js/materialize/sideNav.js",
      (0 || '') && span({-class=>"notifications-container", },
       span({-class=>"notifications-icon overlay grow infinite yellow darken-2 white-text ", -style=>"right: 10px; top: 10px;"}, ''),#span({-class=>"notifications-icon-count"},'!')
       span({-class=>"notification-inner",},    )
      ),
      i({-class=>"material-icons teal lighten-1 black-text",},'menu'),#
    ),
    
  )
    : $c->match->endpoint && $c->match->endpoint->name ne 'profile'
      ? li({},
          a({-class=>"btn-large000 black-text000 teal000 lighten-1000", -href=>$c->url_for('profile')->query(from=>$c->url_for->path), -title=>"Вход/Регистрация",},#btn-large000 black-text000 teal000 lighten-1000
            i({-class=>"material-icons",}, 'exit_to_app'),
            span({-class=>"hide-on-small-only",}, 'Вход',),
            
          ),
        )# icon 
        
      : (),
  ),
  
  #~ $c->stash("контент в верхней навигации") && div({-class=>"right"}, $c->stash("контент в верхней навигации")),

($signed || '') && div({-id=>"right-side-top-nav", -class=>"side-nav", },
  
  ul({-style=>"margin:0;",},#jq-dropdown-menu
  
  li({}, a({-class00=>"", -href=>$c->url_for('движение ДС'),}, i({-class=>"material-icons",}, 'account_balance'), 'Движение денег', ), ),
  
  li({}, a({-class00=>"", -href=>$c->url_for('отчет ДС'),}, i({-class=>"material-icons",}, 'report'), 'Отчет по деньгам', ), ),
  
  li({}, a({-class00=>"", -href=>$c->url_for('profile')->query(from=>$c->url_for->path),}, i({-class=>"material-icons",}, 'person'), 'Профиль', ), ),
  
  li({}, a({-class00=>"", -href=>$c->url_for('logout')->query(from=>$c->url_for->path),}, i({-class=>"material-icons",}, 'lock_outline'), 'Выход', )),
  
  
  
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

