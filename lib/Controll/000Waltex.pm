package Controll::Waltex;
use Mojo::Base 'Mojolicious::Controller';

#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
#~ has model_money => sub {shift->app->models->{'Money'}};
has model_category => sub {shift->app->models->{'Category'}};

sub index {
  my $c = shift;
  return $c->render('waltex/index',
    handler=>'ep',
    'header-title' => 'Денежные средства',
    assets=>["waltex/money.js",],
    );

}



1;

