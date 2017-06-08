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
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/form.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub объекты {
  my $c = shift;
  
  my $data = $c->model->объекты($c->auth_user->{id});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub data {
  my $c = shift;
  my $data = $c->req->json;
  
  my $data = $c->model->данные($data->{'объект'}{id}, $data->{'месяц'});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

1;