my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

$c->layout('main', handler=>'ep', 'header-title' => 'Начало');

h1('Добро пожаловать'),

#~ div({}, a({-href=>$c->url_for('waltex'), -class=>"btn-large"}, 'Движение денежных средств')),

#~ ($uid || ()) 
#~ && ul(
  
  #~ 0
  #~ ? li({-class=>"inline",},
    #~ a({-href=>$c->url_for('заявки на мой транспорт')->query(s=>10), -class=>"btn-large green darken-2",}, "Новые заявки на мой транспорт ()"),
  #~ ) : (),
  
#~ ),

