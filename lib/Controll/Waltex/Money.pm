package Controll::Waltex::Money;
use Mojo::Base 'Mojolicious::Controller';


has model_project => sub {shift->app->models->{'Project'}};
has model_wallet => sub {shift->app->models->{'Wallet'}};
has model => sub {shift->app->models->{'Money'}};
has model_category => sub {shift->app->models->{'Category'}};

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };


sub save {
  my $c = shift;
  my $data =  $c->req->json
    or return $c->render(json=>{error=>"нет данных"});
  
  my $tx_db = $c->model_category->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for qw(model_category model_wallet);
  
  my $rc = $c->сохранить_категорию($data->{"категория"});
  
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
    
  $rc = $c->сохранить_кошелек($data->{"кошелек"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  $data->{"сумма"} = $data->{"приход"} || -$data->{"расход"}
    || return $c->render(json=>{error=>"Не указан приход/расход"});
  
  return $c->render(json=>{error=>"Не указана дата"})
    unless $data->{"дата"};
  
  $rc = eval{$c->model->сохранить(map {($_=>$data->{$_})} grep {defined } qw(сумма дата примечание), "кошелек"=>$data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id}, "категория"=>$data->{"категория"}{id})}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>"Ошибка: $@"});
  
  $tx_db->commit;
  
  $c->model_category->кэш($c, 3) #!!! тошлько после успешной транз!
    if @{$data->{"категория"}{newPath}};
  
  $c->render(json=>{success=>$rc});
}

sub сохранить_категорию {
  my ($c, $cat) = @_;
  my @new_category = grep $_->{title}, @{$cat->{newPath} || []};
  
  $cat->{newPath} = [];# сбросить обязательно для кэша
  
  return "нет категории"
    unless $cat->{selectedItem} || @new_category;
  
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



1;