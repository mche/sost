package Controll::Waltex::Money;
use Mojo::Base 'Mojolicious::Controller';
use Util;


has model_project => sub { $_[0]->app->models->{'Project'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_wallet => sub { $_[0]->app->models->{'Wallet'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_contragent => sub { $_[0]->app->models->{'Contragent'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model => sub { $_[0]->app->models->{'Money'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_category => sub { $_[0]->app->models->{'Category'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };

sub index {
  my $c = shift;
  return $c->render('waltex/index',
    handler=>'ep',
    title=>'Движение ДС',
    'header-title' => 'Денежные средства',
    assets=>["waltex/money.js",],
    );

}

sub save {
  my $c = shift;
  my $data =  $c->req->json
    or return $c->render(json=>{error=>"нет данных"});

  my $prev = ref $data eq 'HASH' && $data->{id} && $c->model->позиция($data->{id});
    #~ if $data->{id};
  #~ ($data->{$_} && $data->{$_} =~ s/[a-zа-я\-\s]+//gi,
  #~ $data->{$_} && $data->{$_} =~ s/\./,/g)
    #~ for qw(приход расход);
  
  my $tx_db = $c->model->dbh->begin;
    local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
    #~ for qw(model_category model_wallet model_contragent model);
  
  if (ref $data eq 'ARRAY') {# это подтвержденный пакет
    my @r = map {
      my $data = $_;
      $_->{uid} = $c->auth_user->{id};

      my $r = eval {$c->model->сохранить(
        (map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(uid сумма дата примечание)),
        "кошелек"=>$_->{"кошелек/id"},
        "контрагент"=>$_->{"контрагент/id"},
        "категория"=>$_->{"категория/id"},
        $_->{'объект/id'} ? ("объект" => $_->{'объект/id'}) : (),
        {},
      )};
      
      $r ||= $@
        and $c->app->log->error($r)
        and return $c->render(json=>{error=>"Ошибка пакетной записи ДС: $r"})
        unless ref $r && $r->{id};

      $c->model->позиция($r->{id});
      
    } @$data;
    
    $tx_db->commit;
    return $c->render(json=>{success=>\@r});
  }
  
  return $c->render(json=>{error=>"Не указана категория"})
    unless $data->{"категория"} && ($data->{"категория"}{selectedItem}{id} || $data->{"категория"}{newItems}[0] && $data->{"категория"}{newItems}[0]{title});
  
  my $rc = $c->model_category->сохранить_категорию($data->{"категория"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  #~ $c->app->log->error($c->dumper($data->{"категория"}, $rc));
  
  return $c->render(json=>{error=>"Не указан кошелек"})
    unless $data->{"кошелек"} && $data->{"кошелек"}{title};
  
  $rc = $c->сохранить_кошелек($data->{"кошелек"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  if ($data->{'пакетная закачка'}) {
    return $c->render(json=>{error=>"Не указаны строки пакетной закачки"})
      unless $data->{"пакет"};
    my @data = ();
    #~ my $sth_k = $c->model_contragent->sth('контрагент/ИНН');
    for my $line (split /\r?\n/, $data->{'пакет'}) {
      my @val = map s/(^\s+|\s+$)//gr, split /\t/, $line, -1;#дата | ИНН контрагента | сумма | коммент | прочие
      #~ $c->log->error(scalar @val, $line =~ s/\t/|/gr, $line);#
      map s/[^\d.,]//g, @val[0..2]; # только три осн колонки
      #~ my $r = $c->model_contragent->dbh->selectrow_hashref($sth_k, undef, $val[1]);
      # обратный порядок перед прочими колонками
      #~ splice(@val, 3, 0, $data->{"примечание"});
      splice(@val, 3, 0, $data->{'$объект'} && $data->{'$объект'}{id});
      splice(@val, 3, 0, $data->{"категория"}{id});
      splice(@val, 3, 0, $data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id});
      
      #~ push @val, $data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id};
      #~ push @val, $data->{"категория"}{id};
      #~ push @val, $data->{'$объект'} && $data->{'$объект'}{id};
      #~ push @val, $data->{"примечание"};
      push @data, \@val;
    }
    my $r = $c->model->пакетная_закачка(\@data);
    #~ $c->log->error($c->dumper(\@data));#
    return $c->render(json=>{error=>"Ошибка пакетных данных"})
      if ref $r eq 'Mojo::Exception';
    
    $tx_db->commit;# новые кошелек и категория
    return $c->render(json=>{"пакет"=>$r});
  }  else {
  
    $data->{"сумма"} = $data->{"приход"} || ($data->{"расход"} && '-'.$data->{"расход"})
      || return $c->render(json=>{error=>"Не указан приход/расход"});
    
    return $c->render(json=>{error=>"Не указана дата"})
      unless $data->{"дата"};
    
    return $c->render(json=>{error=>"Не указан контрагент"})
      unless ($data->{"профиль"} && $data->{"профиль"}{id}) || ($data->{"кошелек2"} && $data->{"кошелек2"}{title}) || ($data->{"контрагент"} && $data->{"контрагент"}{title});
      
    return $c->render(json=>{error=>"Не указан кошелек перемещения"})
      unless ($data->{"профиль"} && $data->{"профиль"}{id}) || ($data->{"контрагент"} && $data->{"контрагент"}{title}) || ($data->{"кошелек2"} && $data->{"кошелек2"}{title});
    
    return $c->render(json=>{error=>"Не указан сотрудник"})
      unless  ($data->{"контрагент"} && $data->{"контрагент"}{title}) || ($data->{"кошелек2"} && $data->{"кошелек2"}{title}) || ($data->{"профиль"} && $data->{"профиль"}{id});
  }
    
  #~ if ($data->{move}{id} eq 1 || $data->{move}{id} eq 0) {
  if ($data->{"контрагент"} && $data->{"контрагент"}{title}) {
    my $rc = $c->model_contragent->сохранить_контрагент($data->{"контрагент"});
    return $c->render(json=>{error=>$rc})
      unless ref $rc;
  }
  
  # внутренние дела
  if ($data->{"кошелек2"} && $data->{"кошелек2"}{title}) {
    $data->{"кошелек2"}{'проект'} = $data->{'проект'} || $data->{'проект/id'};
    my $rc = $c->сохранить_кошелек($data->{"кошелек2"});
    return $c->render(json=>{error=>$rc})
      unless ref $rc;
  }
  
  $data->{uid} = $c->auth_user->{id}
      unless $data->{id};

  $rc = eval {$c->model->сохранить((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id uid сумма дата примечание)),
    "кошелек"=>$data->{"кошелек"}{id} || $data->{"кошелек"}{new}{id},
    "кошелек2"=>$data->{"кошелек2"}{id} || $data->{"кошелек2"}{new}{id},
    $data->{"контрагент"} && $data->{"контрагент"}{'договор аренды/id'}
      ? ('договор аренды'=>$data->{"контрагент"}{'договор аренды/id'})
      : ("контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id})),
    "профиль"=>$data->{"профиль"} && $data->{"профиль"}{id},# сотрудник
    "категория"=>$data->{"категория"}{id},
    "объект" => $data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}) && $data->{'$объект'} && $data->{'$объект'}{id},
    $prev || {},
    )};
  $rc ||=$@
    and $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка записи ДС: $rc"})
    unless ref $rc;
  
  $tx_db->commit;
  
  my $r = $c->model->позиция($rc->{id});
  $r->{rc} = $rc;
  
  #~ $c->model_category->кэш(3) #!!! тошлько после успешной транз!
    #~ if @{$data->{"категория"}{newItems}};
  $c->model_contragent->почистить_таблицу();#uid=>$c->auth_user->{id}
  $c->render(json=>{success=>$r});# $c->model->позиция($rc->{id}, defined($data->{"кошелек2"}))
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

=pod
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
=cut

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
  $data ||= $@
    and $c->app->log->error($data)
    and return $c->render(json => {error=>"Ошибка: $data"})
    unless ref $data;
  
  #~ my $rc = eval{$c->model->связи_удалить(id1=>$id, id2=>$id)};# || $@;# все почикать
  #~ $c->app->log->error($@)
    #~ and return $c->render(json => {error=>"Ошибка: $@"})
    #~ unless ref $rc;
  
  $tx_db->commit;
  $c->model_contragent->почистить_таблицу();#uid=>$c->auth_user->{id}
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