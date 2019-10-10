package Controll::Object;
use Mojo::Base 'Mojolicious::Controller';


has model => sub { $_[0]->app->models->{'Object'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub объекты_проекты {
  my $c = shift;
  my $param = {select=>' row_to_json(o) '};
  $c->render(json=>$c->model->объекты_проекты([0], $param));
  
}

sub объекты {
  my $c = shift;
  my $param = {select=>' row_to_json(o) '};
  $c->render(json=>$c->model->список($param));
  
}

sub объекты_без_проектов {
  my $c = shift;
  $c->render(json=>$c->model->объекты_без_проектов());
}

sub доступные_объекты_без_проектов {
  my $c = shift;
  my $uid = $c->auth_user->{id};
  my $param = {select=>' json_agg(o order by o.name) '};
  $c->render(json=>$c->model->доступные_объекты_без_проектов($uid, undef, $param)->[0]);
}

1;