package Controll::Waltex::Report::UK;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
has model_waltex => sub {shift->app->models->{'Waltex::Report'}};
#~ has model => sub {shift->app->models->{'Waltex::Report::Wallets'}};

sub index {
  my $c = shift;
  return $c->render('waltex/report/упр компания.html.ep',
    handler=>'ep',
    'header-title' => 'Поступления и расходы по объектам УК',
    assets=>["деньги/отчет/ук.js",],
    );
  
}


1;