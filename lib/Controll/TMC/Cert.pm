package Controll::TMC::Cert;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'TMC::Cert'}};
#~ has model_nomen => sub {shift->app->models->{'Номенклатура'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};

sub index {
  my $c = shift;
  return $c->render('тмц/сертификаты',
    handler=>'ep',
    'header-title' => 'Сертификаты ТМЦ',
    assets=>["тмц/сертификаты.js",],
    );
}

1;