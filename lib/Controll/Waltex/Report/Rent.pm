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
  delete $param->{'все контрагенты'};
  $param->{'контрагенты'} = $c->model_report_rent->контрагенты();
  #~ $param->{'все проекты'} = 1;
  #~ $param->{'проект'} = {"id"=>0};
  #~ $c->log->error($c->dumper($param));
  $c->все_контрагенты($param);# там render
  #~ $param->{'место интервалов'} = 'строки';
  #~ $c->data($param);# там render
  #~ $c->log->error($c->dumper($c->snapshot_name));
  #~ $c->render(json=>$data);
}

sub строка {
  my $c = shift;
  my $param = $c->req->json;
  #~ $param->{'все контрагенты'} = 1;
  #~ $param->{'все проекты'} = 1;
  #~ $param->{'проект'} = {"id"=>0};
  #~ $param->{"место интервалов"} = "столбцы";
  #~ {"проект":{"id":0},"кошелек":{"без сохранения":true,"проект":{"id":0,"ready":true},"title":""},"кошелек2":{"без сохранения":true,"title":""},"контрагент":{"без сохранения":true},"профиль":{},"объект":{"проект":{"id":0,"ready":true}},"все проекты":true,"место интервалов":"столбцы","все контрагенты":true,"все кошельки":false,"все кошельки2":false,"все профили":false,"все объекты":false,"все пустое движение":false,}
  #~ $c->log->error($c->dumper($param));
  $c->row($param);
  
}


1;