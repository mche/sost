package Controll::Waltex::Report::Rent;
#~ use Mojo::Base 'Mojolicious::Controller';
use Mojo::Base 'Controll::Waltex::Report';

#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
#~ has model_waltex => sub {shift->app->models->{'Waltex::Report'}};
#~ has controll_report => sub { Controll::Waltex::Report->new(app=>shift->app); };
has model => sub { $_[0]->app->models->{'Waltex::Report::Rent'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {#пока нет
  my $c = shift;
  return $c->render('waltex/report/аренда.html.ep',
    handler=>'ep',
    'header-title' => 'Отчет по аренде',
    assets=>["деньги/отчет/аренда.js",],
    );
  
}

sub data {
  my $c = shift;
  my $param = $c->req->json;
  #~ return $c->to_xls($param)
    #~ if $param->{'data'} || $param->{'строки'} || $param->{'колонки'};
  
  delete $param->{'все контрагенты'};
  $param->{'контрагенты'} = $c->model->контрагенты();
  $param->{'аренда'}  = 1;
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

sub движение_ДС_xlsx {
  my $c = shift;

  my $param =  $c->req->json || {};

  require Excell;
  
  my $data = $c->model->движение_арендатора($param);
  #~ $c->log->error("движение_арендатора", $c->dumper($data));
  # короч, посчитать баланс без обеспечительного платежа
  my $r = {'сальдо'=>0, 'обеспечительный платеж'=>0};
  map {
    if ($_->{"категории"}[-1] eq 929979) {#~ "категории" => [3,121952, 929979], это обеспечительный платеж
      $r->{'обеспечительный платеж'} += $_->{"приход/num"} || 0;
      $r->{'обеспечительный платеж'} -= $_->{"расход/num"} || 0;
    } else {
      $r->{'сальдо'} += $_->{"приход/num"} || 0;
      $r->{'сальдо'} -= $_->{"расход/num"} || 0;
    }
    
  } @$data;
      
  my $tmp = Excell::сальдовка($data);
  #~ return $fdata;
  #~ $c->render(json=>{'xlsx'=>$xlsx});
  # Render data from memory as file
  #~ $c->render_file('filepath' => "static/$xlsx", 'filename' => 'выписка по арендатору.xlsx', format=>'xlsx');
  return $c->render(json=>{file=>$tmp->basename, filename => 'выписка по арендатору.xlsx', format=>'xlsx', "балансы"=>$r, });
}

sub реестр_долгов_xls {
  my $c = shift;
  my $param =  $c->req->json || {};
  #~ my ($month, $month2, $project, $contract_ids) = split /:/, $c->param('args');
  #~ require Excell;
  my $data = $c->model->долги($param);
  #~ my $file = Excell::долги_по_аренде($data);
  #~ return $c->render(json=>{file=>$file->basename, filename => 'реестр долгов.xlsx', format=>'xlsx', });
  return $c->render(json=>{data=>$data});
}




1;