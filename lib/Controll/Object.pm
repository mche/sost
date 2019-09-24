package Controll::Object;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Object'}};

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

1;