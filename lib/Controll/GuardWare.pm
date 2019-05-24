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
  $c->render(json=>[]);
}

1;