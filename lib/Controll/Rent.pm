package Controll::Rent;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Аренда'}};
#~ has model_nomen => sub {shift->app->models->{'Номенклатура'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  return $c->render('аренда/index',
    handler=>'ep',
    'header-title' => 'Аренда помещений',
    assets=>["аренда.js",],
    );
}

1;