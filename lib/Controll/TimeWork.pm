package Controll::TimeWork;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'TimeWork'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/index',
    handler=>'ep',
    'header-title' => 'Табель учета рабочего времени',
    assets=>["timework/form.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub объекты_сотрудники {
  my $c = shift;
  
  $c->render(json=>[{name=>'Обект 1', "сотрудники"=>[]}, ]);
}

1;