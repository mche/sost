package Controll::Waltex::Report::Wallets;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
has model_wallet => sub {shift->app->models->{'Wallet'}};
has model_waltex => sub {shift->app->models->{'Waltex::Report'}};
has model => sub {shift->app->models->{'Waltex::Report::Wallets'}};

sub index {
  my $c = shift;
  return $c->render('waltex/report/кошельки',
    handler=>'ep',
    #~ title=>'Движение ДС',
    'header-title' => 'ДС по счетам',
    assets=>["деньги/отчет/кошельки.js",],
    );
  
}

sub data {
  my $c = shift;
  $c->inactivity_timeout(10*60);
  my $param =  $c->req->json;
  $param->{select}=' row_to_json(m) ';
  
  my @data = ();
  $c->render_later;
  my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq 3 ; };

  #~ my $data = $c->model_wallet->кошельки_проекта($param->{'проект/id'}, sub {  $data[1] = $_[2]->hashes; $render->(); });#
  #~ $data->[$_]{'всего-сальдо'} = $c->model_waltex->всего_остатки_все_кошельки({'даты'=>['2019-03-01', $param->{'дата'}], 'кошелек'=>$data->[$_]{id}},)
    #~ for 0..$#$data;# sub { $data[1] = $_[2]->hash; $render->(); }
  #~ unshift @$data, 
  $c->model_waltex->всего_остатки_все_кошельки({'даты'=>[($param->{'дата'}) x 2], 'проект'=>$param->{'проект/id'}}, sub {  $data[0] = $_[2]->hashes; $render->(); });
  #движение по всем кошелькам проекта детально
  $c->model->прямые_платежи($param, sub {  $data[1] = $_[2]->hashes; $render->(); });# $c->app->log->error($c->dumper(Mojo::Exception->new('Died ...')->frames));
  $param->{select} = ' row_to_json(m) ';
   $c->model->внутренние_перемещения($param, sub {  $data[2] = $_[2]->hashes; $render->(); });#
  
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  #~ $c->render(json=>$data);
}

1;