package Controll::Nomen;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Nomen'}};

sub list {
  my $c = shift;
  $c->render(json=>$c->model->список());
}

1;