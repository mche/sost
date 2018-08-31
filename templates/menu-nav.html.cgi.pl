my $profile = $c->auth_user
  if $c->is_user_authenticated;

$c->stash('пункты навигации', $c->app->models->{'Access'}->навигация([map $_->{id}, grep !$_->{disable}, @{$profile->roles}]))
  if $profile && !$c->stash('пункты навигации');

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
my $nav = ul({-class=>"menu-nav"},
  (map {
    my $r  = $_;
    $r->{config} ||= {};
    map {$r->{parents_descr}[$_] =~ s/(\{.+\})//s and my $json = eval {$c->app->json->decode($1)} || {}; @{$r->{config}}{ keys %$json } = values %$json;} (0..$#{$r->{parents_descr}});
    $r->{descr} =~ s/(\{.+\})//s
      and my $json = eval {$c->app->json->decode($1)} || {}; #$c->app->log->error($1, $2);
    @{$r->{config}}{ keys %$json } = values %$json;
    $r->{config}{"icon-class"} ||= '';
    #~ $c->app->log->error(&Text::Balanced::extract_codeblock($r->{descr}, '<>', ));
    my $li = li({-class=>$r->{config}{"li-class"} || "black-text"}, a({-href=>$c->url_for($r->{url_for}), 'data-url-for'=>$r->{url_for}, -class=>"text-inherit nowrap",},
      
      i({-class=>$r->{config}{"icon-class"} || "material-icons", }, $r->{config}{"icon-text"} || (!$r->{config}{"icon-class"} || ($r->{config}{"icon-class"} =~ /material-icons/)  ? 'label_outline' : '')),
      
      (map {
        span({-class=>"breadcrumb ". ($prev_item && $prev_item->{parents_name}[$_] eq $r->{parents_name}[$_] ? "black-text000" : "black-text000"), -title=>$r->{parents_descr}[$_]}, $r->{parents_name}[$_],);
      } (1..$#{$_->{parents_name}})),
      span({-class=>"breadcrumb black-text000", -title=>$_->{descr},}, $_->{name}),
      #~ span({-class=>"breadcrumb black-text",}, $r->{icon}),
    ),);
    
    $prev_item = $r;
    
    $li;
    
  } @{$c->stash('пункты навигации')}),
  
  li({-class=>"black-text"},
    a({-class=>" nowrap", -href=>"tel:+79223361468"}, #$c->url_for()
      i({-class=>"material-icons", }, 'phone'),
      span({-class=>""}, "Вопросы и замечания? "),
      span({-class=>"bold"}, "8-922-336-14-68 Михаил"),
    ),
  ),
  
  li({-class=>"black-text"},
    a({-class=>" nowrap", -href=>"tel:+79223361468"}, #$c->url_for()
      i({-class=>"material-icons", }, 'phone'),
      span({-class=>""}, "Вопросы и замечания? "),
      span({-class=>"bold"}, "8-922-336-14-68 Михаил"),
    ),
  ),
)
  if $profile;

$nav || '',