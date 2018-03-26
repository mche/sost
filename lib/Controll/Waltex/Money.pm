package Controll::Waltex::Money;
use Mojo::Base 'Mojolicious::Controller';


has model_project => sub {shift->app->models->{'Project'}};
has model_wallet => sub {shift->app->models->{'Wallet'}};
has model_contragent => sub {shift->app->models->{'Contragent'}};
has model => sub {shift->app->models->{'Money'}};
has model_category => sub {shift->app->models->{'Category'}};

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };


sub save {
  my $c = shift;
  my $data =  $c->req->json
    or return $c->render(json=>{error=>"нет данных"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for qw(model_category model_wallet model_contragent model);
  
  ($data->{$_} && $data->{$_} =~ s/[a-zа-я\s]+//gi,
  $data->{$_} && $data->{$_} =~ s/,|-/./g)
    for qw(приход расход);
  
  $data->{"сумма"} = $data->{"приход"} || -$data->{"расход"}
    || return $c->render(json=>{error=>"Не указан приход/расход"});
  
  return $c->render(json=>{error=>"Не указана дата"})
    unless $data->{"дата"};
    
  return $c->render(json=>{error=>"Не указан сотрудник"})
    if $data->{move}{id} eq 3 && !($data->{"профиль"} && $data->{"профиль"}{id});
  
  if ($data->{move}{id} eq 1 || $data->{move}{id} eq 0) {
    my $rc = $c->сохранить_контрагент($data->{"контрагент"});
    return $c->render(json=>{error=>$rc})
      unless ref $rc;
    }
  
  my $rc = $c->model_category->сохранить_категорию($data->{"категория"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  $rc = $c->сохранить_кошелек($data->{"кошелек"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  #~ if (exists($data->{"кошелек2"}) && $data->{"кошелек2"} && !$data->{"кошелек2"}{id}) {# внутренние дела
  if ($data->{move}{id} eq 2 || ($data->{move}{id} eq 0 && $data->{"кошелек2"} && ($data->{"кошелек2"}{id} || $data->{"кошелек2"}{title}))) {# между кошельками
    $data->{"кошелек2"}{'проект'} = $data->{'проект'} || $data->{'проект/id'};
    my $rc = $c->сохранить_кошелек($data->{"кошелек2"});
    return $c->render(json=>{error=>$rc})
      unless ref $rc;
  }
  
  #~ if ($data->{"кошелек2"} && ($data->{"кошелек2"}{id} || $data->{"кошелек2"}{new}{id}) &&  ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id})
  
  #~ return $c->render(json=>{error=>"Не указан ЕЩЕ кошелек "})
    #~ unless !exists($data->{"кошелек2"}) || ($data->{"кошелек2"} && ($data->{"кошелек2"}{id} || ($data->{"кошелек2"}{new} && $data->{"кошелек2"}{new}{id})));
  
  $rc = eval{$c->model->сохранить((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id сумма дата примечание)),
    "кошелек"=>$data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id},
    "кошелек2"=>$data->{"кошелек2"}{id} || $data->{"кошелек2"}{new}{id},
    "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    "профиль"=>$data->{"профиль"} && $data->{"профиль"}{id},# сотрудник
    "категория"=>$data->{"категория"}{id},
    )};
  $rc = $@
    if $@;
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка записи ДС: $rc"})
    unless ref $rc;
  
  $tx_db->commit;
  
  #~ $c->model_category->кэш(3) #!!! тошлько после успешной транз!
    #~ if @{$data->{"категория"}{newItems}};
  
  $c->render(json=>{success=>$rc});# $c->model->позиция($rc->{id}, defined($data->{"кошелек2"}))
}



sub сохранить_кошелек {
  my ($c, $wal) = @_;
  return $wal
    if $wal && $wal->{id};
  return "Не указан кошелек/проект"
    unless $wal && $wal->{'проект'} && $wal->{'title'};
    
  $wal->{new} = eval{$c->model_wallet->сохранить($wal)};# || $@;
  $c->app->log->error($@)
    and return "Ошибка: $@"
    unless ref $wal->{new};
  
  return $wal;
  
}

sub сохранить_контрагент {
  my ($c, $data) = @_;
  return $data
    if $data && $data->{id};
  return $data #"Не указан контрагент"
    unless $data && $data->{'title'};
  
  my $model = $c->model_contragent;
  
  $data->{new} = eval{$model->сохранить($data)};# || $@;
  $c->app->log->error($@)
    and return "Ошибка: $@"
    unless ref $data->{new};
  
  $data->{id}=$data->{new}{id};
  
  return $data;
  
}

sub data {# одна строка
  my $c = shift;
  
  my $id = $c->vars('id')
    or return $c->render(json => {});
  
  my $param =  $c->req->json;
  
  #~ my $wallet2 = $c->vars('кошелек2');
  #~ $c->app->log->error("кошелек2 ", $wallet2);
  
  my $data = $c->model->позиция($id, $param);# || $@;
  #~ $c->app->log->error($@)
    #~ and return $c->render(json => {error=>"Ошибка: $@"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
  
}

sub list {
  my $c = shift;
  
  my $projct = $c->vars('project') # 0 - все проекты (для зп)
    // return $c->render(json => {error=>"Не указан проект"});
  
  my $param =  $c->req->json;
  
  $c->inactivity_timeout(10*60);
  $param->{select}=' row_to_json(m) ';
  my $data = $c->model->список($projct, $param);# || $@;
  #~ $c->app->log->error($@)
    #~ and return $c->render(json => {error=>"Ошибка: $@"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
}

sub delete {
  my $c = shift;
  
  my $id = $c->vars('id')
    or return $c->render(json => {error=>"Не указан ИД записи удаления"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $data = eval{$c->model->удалить($id)};# || $@;
  $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"})
    unless ref $data;
  
  my $rc = eval{$c->model->связи_удалить(id1=>$id, id2=>$id)};# || $@;# все почикать
  $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"})
    unless ref $rc;
  
  $tx_db->commit;
  
  return $c->render(json => {success=>$data});
  
}

sub список_по_профилю {# история начислений и выплат сотрудника (когда нажал детализацию)
  my $c = shift;
  my $param = $c->req->json;
  
  $c->inactivity_timeout(10*60);
  
  $param->{select} = ' row_to_json(u) ';
  my $r = eval{$c->model->расчеты_по_профилю($param)};# || $@;
  $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    unless ref $r;
  
  $c->render(json=>$r);

}

sub баланс_по_профилю {# история начислений и выплат сотрудника (когда нажал детализацию)
  my $c = shift;
  my $param = $c->req->json;
  
  my $r = eval{$c->model->баланс_по_профилю($param)};# || $@;
  $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    unless ref $r;
  
  $c->render(json=>$r);

}

1;