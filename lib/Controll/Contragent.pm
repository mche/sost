package Controll::Contragent;
use Mojo::Base 'Mojolicious::Controller';

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };
#~ has category_count => sub {$model->category_count};# hashref
has model => sub {shift->app->models->{'Contragent'}};

sub data {
  my $c= shift;
  
  #~ return $c->render(json=>[{id=>1, title=>'касса'},{id=>2, title=>"счет 2"}]);
  my $param={select=>' row_to_json(k) '};
  return $c->render(json=>$c->model->список($param));
}

sub замена {
  my $c = shift;
  return $c->render('контрагенты/замена',
    handler=>'ep',
    'header-title' => 'Замена контрагентов-двойников',
    assets=>["контрагенты/замена.js",],
    );
  
}

sub заменить_контрагента {
  my $c = shift;
  my $data = $c->req->json;
  return $c->render(json=>{error=>"Не указаны контрагенты"})
    unless ref($data) eq 'ARRAY' && $data->[0] && $data->[0]{id} && $data->[1] && $data->[1]{id};
  #~ 
  push @$data, $c->auth_user->{id} ;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = $c->model->заменить_контрагента($data);
  #~ $c->log->error($c->dumper($r));
  $c->model->почистить_таблицу(uid=>$c->auth_user->{id});
  $tx_db->commit;
  
  $c->render(json=>{success=>$r || {}});
}

1;