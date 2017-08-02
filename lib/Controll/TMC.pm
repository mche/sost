package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'TMC'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('tmc/index',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

1;
