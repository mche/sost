package Controll::GuardWare;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Спецодежда'}};

sub index {
  my $c = shift;
  return $c->render('спецодежда/index',
    handler=>'ep',
    #~ title=>'',
    'header-title' => 'Спецодежда и СИЗ',
    assets=>["спецодежда.js",],
    );

}

1;