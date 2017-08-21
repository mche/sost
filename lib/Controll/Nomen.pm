package Controll::Nomen;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Nomen'}};

sub list {
  my $c = shift;
  my $root = $c->vars('root');
  $c->render(json=>$c->model->список($root));
}

1;