package Controll::Chem;
use Mojo::Base 'Mojolicious::Controller';
use Util;

has model => sub { $_[0]->app->models->{'Химия'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };


sub index {
  my $c = shift;
  return $c->render('химия/index',
    handler=>'ep',
    'header-title' => 'Химия',
    assets=>["химия.js", "uploader.css"],
    );
}

sub сырье_таблица {#поступление на дату
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->поступление_сырья(select0000=>'jsonb_agg(q order by q.id desc)', "дата"=>$param->{"дата"}));
}

sub сырье_остатки {# или текущие или на дату
  my $c = shift;
  my $param = shift || $c->req->json;
  $c->render(json=>$c->model->сырье_остатки("дата"=>$param->{"дата"}));
}

sub номенклатура {# справочник
  my $c = shift;
  my $param = $c->req->json;
  $param->{select} = 'jsonb_agg(n order by n.title)';
  $c->render(json=>$c->model->номенклатура($param)->[0]);
}

sub сохранить_сырье {
  my $c = shift;
  my $data = $c->req->json;
  delete $data->{uid};
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  $data->{'номенклатура'}{uid} = $c->auth_user->{id}
    unless $data->{'номенклатура'}{id};
  $data->{'номенклатура'}{parent_id} ||= $c->model->номенклатура(title=>'★ сырьё ★')->[0]{id}
    or die "Нет родителя номенклатуры";
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  $data->{'номенклатура/id'}=$c->model->сохранить_номенклатуру($data->{'номенклатура'})->{id};
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  my $r = $c->model->сохранить_сырье($data);
  
  $tx_db->commit;
  $c->model->почистить_номенклатуру();
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
}

sub продукция_таблица {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->производство_продукции("дата"=>$param->{"дата"}));
}

sub сохранить_продукцию {
    my $c = shift;
  my $data = $c->req->json;
  #~ return $c->render(json=>{error=>"Не заполнен "})
    #~ unless (scalar grep($data->{$_}, qw(наименование))) eq 3;
    
  $data->{'номенклатура'}{uid} = $c->auth_user->{id}
    unless $data->{'номенклатура'}{id};
  $data->{'номенклатура'}{parent_id} ||= $c->model->номенклатура(title=>'★ продукция ★')->[0]{id}
    or die "Нет родителя номенклатуры";
  
  my $prev = $c->model->производство_продукции(id=>$data->{id})->[0]
    if $data->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  #~ my $k = $c->model_contragent->сохранить_контрагент($data->{'контрагент'});
  
  #~ return $c->render(json=>{error=>"Нет контрагента"})
    #~ unless $k->{id};
  
  #~ $data->{'контрагент/id'} = $k->{id};
  
  $data->{'номенклатура/id'}=$c->model->сохранить_номенклатуру($data->{'номенклатура'})->{id};
  
  $data->{'@продукция/сырье'} = [map {
    my $stock = $_;
    
    return $c->render(json=>{error=>"Не указано сырье"})
      unless $stock->{'сырье/id'};
    
    return $c->render(json=>{error=>"Не указано количество сырья"})
      unless (scalar grep($stock->{$_}, qw(количество))) eq 1;
    
    $stock->{$_} = &Util::numeric($stock->{$_})
      for grep defined $stock->{$_}, qw(количество);
    
    $stock->{uid} = $c->auth_user->{id}
      unless $stock->{uid};
      
    #~ $c->log->error($c->dumper($stock));
    $c->model->сохранить_сырье_производство($stock);# строка 
    
  } grep {$_->{'сырье/id'}} @{ $data->{'@продукция/сырье'} }];
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  #~ $c->log->error($c->dumper($data->{'@продукция/сырье'}));
  my $r = $c->model->сохранить_продукцию($data, $prev);
  
  $tx_db->commit;
  #~ $c->model_contragent->почистить_таблицу();# только после связей!{uid=>$c->auth_user->{id}}
  $c->model->почистить_номенклатуру();
  
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
  
}

sub отгрузка_таблица {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>[]);#$c->model->отгрузка("дата"=>$param->{"дата"})
}

sub контрагенты {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->контрагенты($param));
  
}
sub продукция_остатки {# или текущие или на дату
  my $c = shift;
  my $param = shift || $c->req->json;
  $c->render(json=>$c->model->продукция_остатки("дата"=>$param->{"дата"}));
}

1;