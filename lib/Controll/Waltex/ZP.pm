package Controll::Waltex::ZP;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Деньги::ЗП'}};
#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};
has model_money => sub {shift->app->models->{'Money'}};
#~ has model_category => sub {shift->app->models->{'Category'}};


sub index {
  my $c = shift;
  return $c->render('waltex/zp',
    handler=>'ep',
    title=>'Конверты ЗП',
    'header-title' => 'Денежные средства',
    assets=>["waltex/zp.js",],
    );

}

sub конверты_данные {
  my $c = shift;
  my $param = $c->req->json
    or return $c->render(json=>{error=>"нет параметров"});
  
  $param->{select} = ' row_to_json(t) ';
  my $r = $c->model->конверты_данные($param);
  $c->render(json=>$r);
}

sub конверт_сохранить {
  my $c = shift;
  my $data = $c->req->json;
  
  if (my $id = $data->{remove}) {
    my $rc = $c->model_money->удалить($id, $c->auth_user->{id});
    return $c->render(json=>{remove=>$rc});
  }
  
  my $save = {};
  $save->{uid} = $c->auth_user->{id};
  $save->{id} = $data->{id};
  $save->{'категория'} = 569;#select * from "категории" where title ~* 'з\/п';
  $save->{'кошелек'} = ( $data->{'кошелек'} || {} )->{id}
      || return $c->render(json=>{error=>'нет кошелька'});
  $save->{'дата'} = $data->{'дата1'}
      || return $c->render(json=>{error=>'нет даты'});
  $save->{'сумма'} = '-'.$data->{'расчет ЗП округл'}
      || return $c->render(json=>{error=>'нет суммы расчет ЗП'});
  $save->{'профиль'} = $data->{'pid'}
      || return $c->render(json=>{error=>'нет профиля'});
  $save->{'примечание'} = $data->{'примечание'};
  
  #~ $c->app->log->error($c->dumper($save));
  
  my $prev = $data->{id} && $c->model_money->позиция($data->{id});
    #~ if $data->{id};
  
  my $tx_db = $c->model->dbh->begin;
    local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $rc = $c->model_money->сохранить($save, $prev || {});
  return $c->render(json=>{error=>'Ошибка сохранения: '.$rc})
    unless ref $rc;
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$rc});
}

1;