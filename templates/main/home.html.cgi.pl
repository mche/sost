my $uid = $c->auth_user->{id}
  if $c->is_user_authenticated;

$c->layout('main', handler=>'ep', 'header-title' => 'Начало');

h1($uid ? 'Главная страница' : 'Добро пожаловать'),

div({},
  a({-class=>"left-side", 'data-activates'=>"left-side-top-nav", -href=>"javascript:",},
      i({-class=>"material-icons",}, 'menu'),
      span("Навигация системы"),
  ),
),

#~ div({}, a({-href=>$c->url_for('waltex'), -class=>"btn-large"}, 'Движение денежных средств')),

#~ ($uid || ()) 
#~ && ul(

  #~ li({}, a({-class=>"btn", -href=>$c->url_for('табель рабочего времени'),}, i({-class=>"material-icons",}, 'tab'), 'Табель рабочего времени на объектах и в подразделениях', ), ),
  
#~ ),

