package Controll::Waltex::Report::Rent;
#~ use Mojo::Base 'Mojolicious::Controller';
use Mojo::Base 'Controll::Waltex::Report';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
#~ has model_waltex => sub {shift->app->models->{'Waltex::Report'}};
#~ has controll_report => sub { Controll::Waltex::Report->new(app=>shift->app); };
has model_report_rent => sub {shift->app->models->{'Waltex::Report::Rent'}};

sub index {#пока нет
  my $c = shift;
  return $c->render('waltex/report/аренда.html.ep',
    handler=>'ep',
    'header-title' => 'Отчпет по аренде',
    assets=>["деньги/отчет/аренда.js",],
    );
  
}

sub data {
  my $c = shift;
  my $param = $c->req->json;
  $param->{'контрагенты'} = $c->model_report_rent->контрагенты();
  #~ $c->log->error($c->dumper($param));
  $c->все_контрагенты($param);# там render
  #~ $param->{'место интервалов'} = 'строки';
  #~ $c->data($param);# там render
  #~ $c->log->error($c->dumper($c->snapshot_name));
  #~ $c->render(json=>$data);
}

sub row {
  my $c = shift;
  my $param = $c->req->json;
  #~ $param->{'все контрагенты'} = 1;
  $c->_строка_все_контрагенты($param);
  
}


1;