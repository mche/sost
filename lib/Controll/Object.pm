package Controll::Object;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Object'}};

sub объекты_проекты {
  my $c = shift;
  $c->render(json=>$c->model->объекты_проекты());
  
}

1;