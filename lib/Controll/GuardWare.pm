package Controll::GuardWare;
use Mojo::Base 'Mojolicious::Controller';

has model => sub { $_[0]->app->models->{'Спецодежда'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_access => sub { $_[0]->app->models->{'Access'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

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
  my $param = $c->req->json;
  my @data = ();
  $c->render_later;
  my $cnt = delete $param->{lookup} ? 2 : 1;
  my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq $cnt ; };
  
  $c->model->список_спецодежды($param, sub { $data[0] = $_[2]->hashes; $render->(); });
  $c->model->наименования_спецодежды(sub { $data[1] = $_[2]->sth->fetchrow_array; $render->(); })
    if $cnt eq 2;
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
}

#~ sub спецодежда_сотрудника {
  #~ my $c = shift;
  #~ my $param = $c->req->json;
  #~ $c->render(json=>$c->model->спецодежда_сотрудника($param));
#~ }

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

sub связь {# создать и удалить
  my $c = shift;
  my $data = $c->req->json;
  $c->render(json=>$c->model->связь_создать_или_удалить($data));
}

1;