package Controll::Rent;
use Mojo::Base 'Mojolicious::Controller';
use Util;

has model => sub {shift->app->models->{'Аренда'}};
#~ has model_nomen => sub {shift->app->models->{'Номенклатура'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  return $c->render('аренда/index',
    handler=>'ep',
    'header-title' => 'Аренда помещений',
    assets=>["аренда.js", "uploader.css"],
    );
}

sub объекты_список {
  my $c = shift;
  $c->render(json=>$c->model->список_объектов());
}


sub договоры_список {
  my $c = shift;
  $c->render(json=>$c->model->список_договоров());
}

sub сохранить_объект {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{'$объект'} && $data->{'$объект'}{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  map {
    my $room = $_;
    
    $data->{$_} = &Util::numeric($data->{$_})
    for qw(площадь);
    
    return $c->render(json=>{error=>"Не заполнен кабинет"})
      unless (scalar grep($room->{$_}, qw(номер-название этаж площадь))) eq 3;
    
    $room->{uid} = $c->auth_user->{id}
      unless $room->{id};
    
    $room->{id} = $c->model->сохранить_кабинет($room)->{id};
  } @{ $data->{'@кабинеты'}};
  
  $data->{uid} = $c->auth_user->{id}
      unless $data->{id};
  
  my $r = $c->model->сохранить_объект($data);
  
  $tx_db->commit
    if ref $r;
  
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
  
}

sub удалить_объект {
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->удалить_объект($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{remove=>$r});
}

sub сохранить_договор {
  my $c = shift;
  my $data = $c->req->json;
  return $c->render(json=>{error=>"Не заполнен договор"})
    unless (scalar grep($data->{$_}, qw(номер дата1 дата2))) eq 3;
  
  my $prev = $c->model->список_договоров({id=>$data->{id}})->[0]
    if $data->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $k = $c->model_contragent->сохранить_контрагент($data->{'контрагент'});
  
  return $c->render(json=>{error=>"Нет контрагента"})
    unless $k->{id};
  
  $data->{'контрагент/id'} = $k->{id};
  
  $data->{'@помещения'} = [map {
    my $room = $_;
    
    $room->{'сумма'} = undef
      if ($room->{'ставка|сумма'}) eq 'ставка';
      
    $room->{'ставка'} = undef
      if ($room->{'ставка|сумма'}) eq 'сумма';
    
    return $c->render(json=>{error=>"Не заполнена ставка или сумма аренды помещения"})
      unless (scalar grep($room->{$_}, qw(ставка сумма))) eq 1;
    
    $room->{$_} = &Util::money($room->{$_})
      for grep defined $room->{$_}, qw(ставка сумма);
    
    $room->{uid} = $c->auth_user->{id}
      unless $room->{uid};
    
    $c->model->сохранить_помещение_договора($room);# строка договора
    
  } grep {$_->{'помещение/id'}} @{ $data->{'@помещения'} }];
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  my $r = $c->model->сохранить_договор($data, $prev);
  
  $tx_db->commit;
  $c->model_contragent->почистить_таблицу();# только после связей!
  
  $c->render(json=>{success=>$r});
}

1;