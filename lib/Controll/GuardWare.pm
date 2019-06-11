package Controll::GuardWare;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Спецодежда'}};
has model_access => sub {shift->app->models->{'Access'}};

sub index {
  my $c = shift;
  return $c->render('спецодежда/index',
    handler=>'ep',
    #~ title=>'',
    'header-title' => 'Спецодежда и СИЗ',
    assets=>["спецодежда.js",],
    );

}

sub profiles {
  my $c = shift;
  #~ $c->render(json=>$c->model->сотрудники());
  $c->render(json=>$c->model_access->пользователи('без логинов'=>1,));
}

sub список_спецодежды {
  my $c = shift;
  
  $c->render(json=>$c->model->список_спецодежды());
}

sub спецодежда_сотрудника {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>[]);
}

sub сохранить {
  my $c = shift;
  my $data = $c->req->json;
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  $c->render(json=>{save=>$c->model->сохранить($data)});
}

sub удалить {
  my $c = shift;
  my $data = $c->req->json;
  return $c->render(json=>{error=>"Нет ИД записи"})
    unless $data->{id};
  $c->render(json=>{remove=>$c->model->удалить($data)});
}

1;