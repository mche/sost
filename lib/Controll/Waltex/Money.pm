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
  
  my $rc = $c->сохранить_контрагент($data->{"контрагент"});
  #~ return $c->render(json=>{error=>$rc})
    #~ unless ref $rc;
  
  $rc = $c->сохранить_категорию($data->{"категория"});
    return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  $rc = $c->сохранить_кошелек($data->{"кошелек"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  if (exists($data->{"кошелек2"}) && $data->{"кошелек2"} && !$data->{"кошелек2"}{id}) {# внутренние дела
    $data->{"кошелек2"}{'проект'} = $data->{'проект'} || $data->{'проект/id'};
    my $rc = $c->сохранить_кошелек($data->{"кошелек2"});
    return $c->render(json=>{error=>$rc})
      unless ref $rc;
    }
  
  return $c->render(json=>{error=>"Не указан ЕЩЕ кошелек "})
    unless !exists($data->{"кошелек2"}) || ($data->{"кошелек2"} && ($data->{"кошелек2"}{id} || ($data->{"кошелек2"}{new} && $data->{"кошелек2"}{new}{id})));
  
  $rc = eval{$c->model->сохранить((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id сумма дата примечание)),
    "кошелек"=>$data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id},
    "кошелек2"=>$data->{"кошелек2"}{id} || $data->{"кошелек2"}{new}{id},
    "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    "категория"=>$data->{"категория"}{id})}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>"Ошибка: $@"});
  
  $tx_db->commit;
  
  $c->model_category->кэш(3) #!!! тошлько после успешной транз!
    if @{$data->{"категория"}{newPath}};
  
  $c->render(json=>{success=>$rc});# $c->model->позиция($rc->{id}, defined($data->{"кошелек2"}))
}

sub сохранить_категорию {
  my ($c, $cat) = @_;
  my @new_category = grep $_->{title}, @{$cat->{newPath} || []};
  
  $cat->{newPath} = [];# сбросить обязательно для кэша
  
  return "нет категории"
    unless ($cat->{selectedItem} && $cat->{selectedItem}{id}) || @new_category;
  
  my $parent = ( $cat->{selectedItem} && $cat->{selectedItem}{id} )
    // 3;
  
  for (@new_category) {
    $_->{parent} = $parent;# для проверки
    my $new= eval {$c->model_category->сохранить_категорию($_)}
      or $c->app->log->error($@)
      and return "Ошибка: $@";
    $parent = $new->{id};
    push @{$cat->{selectedPath} ||= []}, $new;
    push @{$cat->{newPath}}, $new;# для проверки и кэшировагния
  }
  
  $cat->{selectedItem} = $cat->{selectedPath}[-1]
    if @new_category;
    #~ unless $cat->{selectedItem} && $cat->{selectedItem}{id};
  
  $cat->{id} = $cat->{selectedItem}{id};
  
  #~ $c->model_category->кэш($c, 3) !!! тошлько после успешной транз!
    #~ if @new_category;
  
  
  return $cat;
  
}

sub сохранить_кошелек {
  my ($c, $wal) = @_;
  return $wal
    if $wal && $wal->{id};
  return "Не указан кошелек/проект"
    unless $wal && $wal->{'проект'} && $wal->{'title'};
    
  $wal->{new} = eval{$c->model_wallet->сохранить($wal)}
    or $c->app->log->error($@)
    and return "Ошибка: $@";
  
  return $wal;
  
}

sub сохранить_контрагент {
  my ($c, $data) = @_;
  return $data
    if $data && $data->{id};
  return $data #"Не указан контрагент"
    unless $data && $data->{'title'};
  
  my $model = $c->model_contragent;
  
  $data->{new} = eval{$model->сохранить($data)}
    or $c->app->log->error($@)
    and return "Ошибка: $@";
  
  return $data;
  
}

sub data {
  my $c = shift;
  
  my $id = $c->vars('id')
    or return $c->render(json => {});
  
  my $wallet2 = $c->vars('кошелек2');
  #~ $c->app->log->error("кошелек2 ", $wallet2);
  
  my $data = eval{$c->model->позиция($id, $wallet2)}
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"});
  
  return $c->render(json => $data);
  
}

sub list {
  my $c = shift;
  
  my $projct = $c->vars('project')
    or return $c->render(json => {error=>"Не указан проект"});
  
  my $json =  $c->req->json;
  
  my $data = eval{$c->model->список($projct, $json)}
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"});
  
  return $c->render(json => $data);
}

sub delete {
  my $c = shift;
  
  my $id = $c->vars('id')
    or return $c->render(json => {error=>"Не указан ИД записи удаления"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $data = eval{$c->model->удалить($id)}
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"});
  
  eval{$c->model->связи_удалить(id1=>$id, id2=>$id)}# все почикать
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"});
  
  $tx_db->commit;
  
  return $c->render(json => {success=>$data});
  
}


1;