package Controll::Waltex::Report::Wallets;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
has model_wallet => sub { $_[0]->app->models->{'Wallet'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_waltex => sub { $_[0]->app->models->{'Waltex::Report'}->uid($_[0]->auth_user && $_[0]->auth_user->{id})};
has model => sub { $_[0]->app->models->{'Waltex::Report::Wallets'}->uid($_[0]->auth_user && $_[0]->auth_user->{id})};

sub index {
  my $c = shift;
  return $c->render('waltex/report/кошельки',
    handler=>'ep',
    #~ title=>'Движение ДС',
    'header-title' => 'Поступления и расходы по счетам',
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
  my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq 4 ; };

  #~ my $data = $c->model_wallet->кошельки_проекта($param->{'проект/id'}, sub {  $data[1] = $_[2]->hashes; $render->(); });#
  #~ $data->[$_]{'всего-сальдо'} = $c->model_waltex->всего_остатки_все_кошельки({'даты'=>['2019-03-01', $param->{'дата'}], 'кошелек'=>$data->[$_]{id}},)
    #~ for 0..$#$data;# sub { $data[1] = $_[2]->hash; $render->(); }
  #~ unshift @$data, 
  #~ $c->model_waltex->всего_остатки_все_кошельки({'даты'=>[($param->{'дата'}) x 2], 'проект'=>$param->{'проект/id'}}, sub {  $data[0] = $_[2]->hashes; $render->(); });
  $c->model->сальдо_по_кошелькам($param, sub {  $data[0] = $_[2]->hashes; $render->(); });
  #движение по всем кошелькам проекта детально
  $c->model->прямые_платежи($param, sub {  $data[1] = $_[2]->hashes; $render->(); });# $c->app->log->error($c->dumper(Mojo::Exception->new('Died ...')->frames));
  $param->{select} = ' row_to_json(m) ';
   $c->model->внутренние_перемещения($param, sub {  $data[2] = $_[2]->hashes; $render->(); });#
   $data[3] = $c->model->not_wallets;
  
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  #~ $c->render(json=>$data);
}

1;