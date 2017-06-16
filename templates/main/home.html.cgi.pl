my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

$c->layout('main', handler=>'ep', 'header-title' => 'Начало');

h1('Добро пожаловать'),



#~ div({}, a({-href=>$c->url_for('waltex'), -class=>"btn-large"}, 'Движение денежных средств')),

($uid || ()) 
&& ul(

  li({}, a({-class=>"btn", -href=>$c->url_for('табель рабочего времени'),}, i({-class=>"material-icons",}, 'tab'), 'Табель рабочего времени на объектах и в подразделениях', ), ),
  
  #~ 0
  #~ ? li({-class=>"inline",},
    #~ a({-href=>$c->url_for('заявки на мой транспорт')->query(s=>10), -class=>"btn-large green darken-2",}, "Новые заявки на мой транспорт ()"),
  #~ ) : (),
  
),

