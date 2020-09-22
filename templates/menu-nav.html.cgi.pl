require Hash::Merge;
my $profile = $c->auth_user
  if $c->is_user_authenticated;

$c->stash('пункты навигации', $c->app->models->{'Access'}->навигация([map $_->{id}, grep !$_->{disable}, @{$profile->roles}]))
  if $profile && !$c->stash('пункты навигации');

#~ $c->log->error($c->dumper($c->stash('пункты навигации')));

=pod
my $level;# для навигационого цикла
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
my $prev_item;
my %uniq_nav_id = ();
my $nav = ul({-class=>"menu-nav"},

  li({-class=>"teal white-text"}, 
    a({-class=>"right", -href=>"javascript:location.reload(true);",  -style=>"margin:0;", -title=>'обновить этот экран с очисткой кэша'}, i({-class=>"material-icons", -style=>"margin:0;", }, 'refresh'),  ),#span('Обновить актуально'),
    a({-class=>"text-inherit", -href=>$c->url_for('home'), -title=>'версия от '.$c->app->config('версия')}, i({-class=>"material-icons",}, 'home'), span('Начало системы'), ), 
    
  
  ),#, span({-class=>"chip000 padd-0-05-000 right grey-text", -style=>"margin:0;", -title=>"версия системы"}, $c->app->config('версия'))
  #~ li({-class=>"grey-text"}, a({-class00=>"", -href=>"javascript:location.reload(true);", -title=>'этот экран с очисткой кэша'}, i({-class=>"material-icons",}, 'refresh'), span('Обновить актуально'), ), ),
  
  (map {
    my $r  = $_;
    $r->{config} ||= {};
    map {
      $r->{parents_descr}[$_] =~ s/(\{.+\})//s
        #~ and my $json = eval {$c->app->json->decode($1)} || {};
      #~ @{$r->{config}}{ keys %$json } = values %$json;
        and $r->{config} = Hash::Merge::merge(eval {$c->app->json->decode($1)} || {}, $r->{config});
    } (0..$#{$r->{parents_descr}});
    #~ $c->app->log->error($_->{id}, $_->{name}, $_->{descr});
    $r->{descr} =~ s/(\{.+\})//s
      #~ and my $json = eval {$c->app->json->decode($1)} || {}; #$c->app->log->error($1, $2);
        and $r->{config} = Hash::Merge::merge(eval {$c->app->json->decode($1)} || {}, $r->{config});
    #~ @{$r->{config}}{ keys %$json } = values %$json;
    $r->{config}{"icon-class"} ||= '';
    my $icon = $r->{config}{"icon"};
    
    #~ $c->app->log->error($_->{id}, $_->{name}, $c->dumper($r->{config}));#&Text::Balanced::extract_codeblock($r->{descr}, '<>', )
    my $li = li({-class=>($r->{config}{"li-class"} || " black-text ")." hoverable000 "}, a({-href=>$c->url_for($r->{url_for}), 'data-url-for'=>$r->{url_for}, -class=>"text-inherit nowrap",},
      
      $icon || i({-class=>$r->{config}{"icon-class"} || " material-icons ", }, $r->{config}{"icon-text"} || (!$r->{config}{"icon-class"} || ($r->{config}{"icon-class"} =~ /material-icons/)  ? 'label_outline' : '')),
      
      (map {
        span({-class=>" breadcrumb ". ($prev_item && $prev_item->{parents_name}[$_] eq $r->{parents_name}[$_] ? " black-text000 " : " black-text000 "), -title=>$r->{parents_descr}[$_]}, $r->{parents_name}[$_],);
      } (1..$#{$_->{parents_name}})),
      span({-class=>" breadcrumb black-text000 ", -title=>$_->{descr},}, $_->{name}),
      #~ span({-class=>"breadcrumb black-text",}, $r->{icon}),
    ),);
    
    $prev_item = $r;
    
    $li;
    
  } grep { !$uniq_nav_id{$_->{id}}++ } @{$c->stash('пункты навигации')}),
  
  
  
  li({-class=>"",}, a({-class=>" black-text ", -href=>$c->url_for('profile')->query(from=>$c->url_for->path),}, i({-class=>"icon-user fs14",}, ''), 'Профиль', span({-class=>"hide",-id=>"session-default-expiration"}, ($c->app->config->{'сессия'} || $c->app->config->{'session'})->{default_expiration}),), ),
  
  li({-class=>"",}, a({-class=>"red-text", -href=>$c->url_for('logout')->query(from=>$c->url_for->path),}, i({-class=>"icon-logout fs14",}, ''), 'Выход', )),
  
  li({-class=>"right-align white"},
    a({-class=>"grey-text nowrap", -href=>"tel:+79223361468"}, #$c->url_for()
      i({-class=>" material-icons ", }, 'phone'),
      span({-class=>""}, "Вопросы и замечания? "),
      span({-class=>"bold"}, "8-922-336-14-68 Михаил"),
    ),
  ),
  
)
  if $profile;

$nav || '',