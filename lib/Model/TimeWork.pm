package Model::TimeWork;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'табель';
#~ has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};


sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  
  return $self;
}
sub init {
  my $self = shift;
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  
}

sub объекты {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_},); # ид профиля
  $self->model_obj->список($param);
  #~ $self->dbh->selectall_arrayref($self->sth('объекты'), {Slice=>{},},);
  
}

sub доступные_объекты {
  my ($self, $uid, $param) = (shift, shift, ref $_[0] ? shift : {@_},); # ид профиля
  $self->model_obj->доступные_объекты($uid, undef, $param);
  #~ $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, (($uid) x 2, (undef, undef)));
  
}

sub бригады {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_},); # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('бригады', select => $param->{select} || '*',), {Slice=>{},}, (undef, undef));
  
}

sub данные {# для формы
  my ($self, $oid, $month, $param) = (shift, shift, shift, ref $_[0] ? shift : {@_},); # ид объекта
  my $data = {"значения" => {}, "месяц табеля закрыт"=>$self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $month, $oid),};
  
  my %profiles = ();
  my %hidden = ();
  
  map {
    
    if ($_->{"значение"} eq '_не показывать_') {
      $hidden{$_->{"профиль"}}++;
      $_->{"значение"} = '';
      delete $data->{"значения"}{$_->{"профиль"}};
      delete $profiles{$_->{"профиль"}};
    }
    elsif ($_->{"значение"} eq '_добавлен_') {
      $profiles{$_->{"профиль"}}++
        unless $profiles{$_->{"профиль"}};
      $_->{"значение"} = '';
    }
    elsif (!$hidden{$_->{"профиль"}} && $_->{"значение"} ~~ [qw(КТУ1 КТУ2 КТУ3 Примечание Начислено Сумма Суточные Суточные/ставка), 'Доп. часы замстрой']) {
      $profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}};
      $profiles{$_->{"профиль"}}{$_->{"значение"}} = $_;
    } # кту ставит на участке
    elsif ( !$hidden{$_->{"профиль"}} ) {$profiles{$_->{"профиль"}}++ unless $profiles{$_->{"профиль"}};}

    $data->{"значения"}{$_->{"профиль"}}{$_->{"дата"}} = $_
      unless $hidden{$_->{"профиль"}} || $_->{"значение"} ~~ [qw(Ставка)] || ref $profiles{$_->{"профиль"}} && defined $profiles{$_->{"профиль"}}{$_->{"значение"}}; # $_->{"значение"} ~~ [qw(Ставка Начислено)] || 
    
  #~ } grep {
    #~ $_->{"значение"} eq '_не показывать_' ? !++$hidden{$_->{"профиль"}} : !$hidden{$_->{"профиль"}};
  } @{$self->dbh->selectall_arrayref($self->sth('значения за месяц'), {Slice=>{},}, $month, ($oid) x 2, (undef) x 4)};
  
  my $prev_month = $self->dbh->selectrow_array($self->sth('профили за прошлый месяц'), undef, ([keys %hidden], $month, '1 month', $oid,)) || [];# кроме скрытых в этом мес 
  
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (1, [keys %profiles, @$prev_month]));
  
  map {
    my $p = $_;
    my $profile = $profiles{$_->{id}};
    if ($profile && ref $profile) {
      @$_{keys %$profile} = values %$profile;
    }
    
    $_->{'Суточные/начислено'} ||= $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $_->{id}, (0) x 2, ($month, undef), ('Суточные/начислено', undef)));
    $_->{'месяц табеля/закрыт'} ||= $data->{'месяц табеля закрыт'};
    
    #~ $_->{'Ставка'} ||= $self->dbh->selectrow_hashref($self->sth('значение на дату'), undef, ($_->{id}, $oid, ($month, undef), 'Ставка'));
    
  } @{$data->{"сотрудники"}};
  
  return $data;
  
}

sub строка_табеля {
  my $self = shift; #
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $data = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_hashref($self->dict->render('строка табеля'), undef, ($data->{id}, $data->{'профиль'}, ($data->{'объект'}) x 2, ($data->{'дата'}) x 2, ($data->{'значение'}) x 2), $cb // ());
  
}

=pod
sub сотрудники_объекта {
  my ($self, $oid) = @_; # ид объекта
  
  $self->dbh->selectall_arrayref($self->sth('сотрудники объекта'), {Slice=>{},}, ($oid, 'Сотрудники'));
  
}

sub должности_сотрудника {
  my ($self, $pid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('должности сотрудника'), {Slice=>{},}, ($pid));
}

=cut

sub профили {# просто список для добавления строк в табель
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_},); # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('профили', select => $param->{select} || '*',), {Slice=>{},}, (undef, undef));
}

sub сохранить {# из формы и отчета
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->model_obj->доступные_объекты($data->{uid}, ref $data->{"объект"} ? $data->{"объект"} : [$data->{"объект"}])->[0] 
    or $self->app->log->error($self->app->dumper($data))
    and return "Объект недоступен";
    
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено Отпускные/ставка Отпускные/сумма Отпускные/начислено РасчетЗП Переработка/ставка Переработка/сумма Переработка/начислено), 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено',]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка уже начислена"
      if $pay && $pay->{'коммент'};
    }
    
  unless ($data->{'значение'} ~~ [qw(Сумма КТУ2 Ставка Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено Отпускные/ставка Отпускные/сумма Отпускные/начислено РасчетЗП Переработка/ставка Переработка/сумма Переработка/начислено), 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено',]) {
    return "Табель закрыт после 10-го числа"
      if $self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $data->{'дата'}, $data->{"объект"});
  }
  
  unless ($data->{'значение'} ~~ [qw(РасчетЗП)]) {# заблокировать 
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, (0) x 2, ($data->{'дата'}, undef), ('РасчетЗП', undef)));
    return "Расчет ЗП уже закрыт ".$self->app->dumper($pay)
      if $pay && $pay->{'коммент'};
  }
  
  #~ return "Нельзя начислить" форму ограничил в контроллере
    #~ if $data->{'значение'} eq 'Начислено' && !$r->{'разрешить начислять'};
  ;
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  
  my $r = ($data->{'значение'} =~ /^\d/ && $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^\d')))# ^(\d+\.*,*\d*|.{1})$
    || $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{id},  $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), ($data->{'значение'}, undef))
  ;
  if ($r) {
    $data->{id} = $r->{id};
    $r = $self->_update($self->{template_vars}{schema}, $main_table, ["id"], $data);
  } #elsif() {} 
  else {
    $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  }
  $self->связь($data->{"профиль"}, $r->{id});
  $self->связь($data->{"объект"}, $r->{id})
    if $data->{"объект"}; # 0 - все объекты
  
  if ($data->{'значение'} eq '_добавлен_') {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('_не показывать_', undef)));
    $self->_удалить($self->{template_vars}{schema}, "табель", ["id"], {id=>$r->{id}})
      if $r->{id};
  }
  if ($data->{'значение'} eq '_не показывать_') {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('_добавлен_', undef)));
    $self->_удалить($self->{template_vars}{schema}, "табель", ["id"], {id=>$r->{id}})
      if $r->{id};
  }
  
  $tx_db->commit;
  return $r;
}

sub удалить_значение {# из формы
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->model_obj->доступные_объекты($data->{uid}, $data->{"объект"})->[0]
    or return "Объект недоступен";# eval
  
  unless ($data->{'значение'} ~~ [qw(Начислено Суточные/сумма Суточные/начислено Примечание РасчетЗП)]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка часов начислена"
      if $pay && $pay->{'коммент'};
  }
  
  unless ($data->{'значение'} ~~ [qw(Сумма КТУ2 Ставка Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено РасчетЗП)]) {
    return "Табель закрыт после 10-го числа"
      if $self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $data->{'дата'}, $data->{"объект"});
  }
  
  unless ($data->{'значение'} ~~ [qw(РасчетЗП)]) {# заблокировать 
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, (undef, $data->{"профиль"}, (0) x 2, ($data->{'дата'}, undef), ('РасчетЗП', undef)));
    return "Расчет ЗП уже закрыт".$self->app->dumper($pay)
      if $pay && $pay->{'коммент'};
  }
  
  my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^(\d+[.,]?\d*|.{1,3})$'))
    or return "Запись табеля не найдена";
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  $r = $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], $r);
  $self->связь_удалить(id1=>$data->{"профиль"}, id2=>$r->{id});
  $self->связь_удалить(id1=>$data->{"объект"}, id2=>$r->{id});
  
  $tx_db->commit;
  return $r;
}


sub данные_отчета {
  my ($self, $param) = @_; #
  
  #~ if ($param->{'общий список'} || $param->{'объект'}) {
    my @bind = (($param->{'общий список'}  || 1 ? undef : ($param->{'объект'} && $param->{'объект'}{id})) x 2, $param->{'месяц'}, ($param->{'отключенные объекты'}) x 2, ($param->{'месяц'}) x 7,);
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц', join=>'табель/join'), {Slice=>{},}, @bind)
      #~ unless $param->{'общий список'} || $param->{'общий список бригад'} || $param->{'бригада'};
    
    return $self->dbh->selectall_arrayref($self->sth('сводка за месяц/общий список', select=>$param->{select} || '*', join=>'табель/join'), {Slice=>{},}, @bind);
  #~ }
  #~ if ($param->{'общий список бригад'} || $param->{'бригада'}) {
    #~ my @bind = (($param->{'общий список бригад'} ? undef : ($param->{'бригада'} && $param->{'бригада'}{id})) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0, ($param->{'месяц'}) x 7,);
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц', join=>'табель/бригады/join'), {Slice=>{},}, @bind)
      #~ unless $param->{'общий список бригад'};
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц/общий список', join=>'табель/бригады/join'), {Slice=>{},}, @bind);
  #~ }
}

sub пересечение_объектов {#за весь месяц по всем сотр
  my ($self, $param) = @_; #доп проверка пересечения на объектах в один день
  $self->dbh->selectall_hashref($self->sth('пересечение объектов', select000=>$param->{select} || '*',), 'pid', undef, $param->{'месяц'});
}

sub пересечение_объектов_сохранение {# для одного профиля в один день
  my ($self, $param) = @_; #доп проверка пересечения на объектах в один день
  $self->dbh->selectrow_hashref($self->sth('пересечение объектов/сохранение'), undef, @$param{qw'дата профиль объект дата'});
}

sub сохранить_значение {# из отчета
  my ($self, $data) = @_; #
  
  #~ $data->{'значение'} = 'Ставка';
  #~ $data->{'коммент'} = $data->{'Ставка'};
  
  if (defined $data->{"объект"}) {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef)))
      || $data;
    $r->{'коммент'} = $data->{'коммент'};
    $r->{'коммент'} = undef
      if $r->{'коммент'} eq '';
    $r->{'объект'} = $data->{"объект"};
    #~ $r->{'разрешить начислять'} = 1;
    return $self->сохранить($r);
  }
  my @ret = ();
  my $i = 0;
  for (@{$data->{"объекты"} || []}) {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{id}, $data->{"профиль"}, ($_) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef),))
      || { %$data };
    $r->{'коммент'} = $data->{'коммент'}[$i++];
    $r->{'коммент'} = undef
      if $r->{'коммент'} eq '';
    $r->{"объект"} = $_;
    #~ $r->{'разрешить начислять'} = 1;
    push @ret, $self->сохранить($r);
  }
  
  return \@ret;
  
}

sub детально_по_профилю {
  my ($self, $param) = @_; #
  my $data = {};
  #~ my $object = 'объект';
  #~ utf8::encode($object);
  map {
    if ($_->{'значение'} =~ /^(?:КТУ|Примечание|Доп. часы замстрой|Суточные)/) {
      $data->{$_->{'объект'}}{$_->{'значение'}} = $_;
    } else {
      $data->{$_->{'объект'}}{$_->{'дата'}} =  $_;
    }
    
  } @{ $self->dbh->selectall_arrayref($self->sth('значения за месяц', order_by=>"order by og.name"), {Slice=>{}}, $param->{'месяц'}, (undef) x 2, ($param->{'профиль'}) x 2, ('^(\d+[.,]?\d*|.{1,3}|КТУ\d*|Примечание|Доп. часы замстрой|Суточные)$') x 2) };
  
  return $data;
}

sub данные_отчета_сотрудники_на_объектах {
  my ($self, $param) = @_; #
  #~ my @bind = (($param->{'общий список'} && 0) // ($param->{'объект'} && $param->{'объект'}{id})) x 2
  $self->dbh->selectall_arrayref($self->sth('сотрудники на объектах'), {Slice=>{},}, (0)x2, $param->{'месяц'},);
}

sub квитки_начислено {
  my ($self, $param, $uid) = @_; 
  $self->dbh->selectall_arrayref($self->sth('квитки начислено', select=>$param->{select} || '*', join=>'табель/join'), {Slice=>{},}, ($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, (undef) x 2, ($param->{'месяц'}) x 2, $uid);
};

sub квитки_расчет {
  my ($self, $param, $uid) = @_; 
  $self->dbh->selectall_arrayref($self->sth('квитки расчет', select=>$param->{select} || '*', join=>'табель/join'), {Slice=>{},}, ($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, (undef) x 2, ($param->{'месяц'}) x 8);# параметры для сводка за месяц/общий список (+1 мпесяц)
};

sub расчеты_выплаты {# по профилю и месяцу
  my ($self, $pid, $month, ) = (shift, shift, shift,);
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectall_arrayref($self->sth('расчеты выплаты', {$param->{Async} ? (Async=>1) : ()}, select=>$param->{select} || '*',), {Slice=>{}, $param->{Async} || $cb ? (Async=>1) : (),}, undef, $pid, $month, $cb // ());#
  $self->dbh->selectall_arrayref($self->dict->render('расчеты выплаты', select=>$param->{select} || '*',), {Slice=>{}, $param->{Async} || $cb ? (Async=>1) : (),}, undef, $pid, $month, $cb // ());#
  #~ $self->app->pg->db->query($self->dict->render('расчеты выплаты', select=>$param->{select} || '*',), $pid, $month, $cb // ());#
  #~ $self->app->pg->db->query('select ?::json as foo', {json => {bar => 'baz'}}, $cb // ());
  
}

sub расчеты_выплаты_других_месяцев {# по профилю и не этому месяцу (закрытые месяцы)
  my ($self, $pid, $month, $cb) = @_; 
  #~ $self->dbh->selectall_arrayref($self->sth('расчеты выплаты не в этом месяце', $cb ? {Async=>1} : ()), {Slice=>{},$param->{Async} || $cb ? (Async=>1) : (),}, $pid, $month, $cb // ());
  $self->dbh->selectall_arrayref($self->dict->render('расчеты выплаты не в этом месяце'), {Slice=>{},}, $pid, $month, $cb // ());
  #~ $self->app->pg->db->query($self->dict->render('расчеты выплаты не в этом месяце'), $pid, $month, $cb // ());
  
}

sub статьи_расчетов000 {# автоподстановка поля
  my $self = shift;
  $self->dbh->selectcol_arrayref($self->sth('статьи расчетов'));
  
}

sub сумма_начислений_месяца {
  my ($self, $pid, $month, $cb) = @_; 
  #~ $self->dbh->selectrow_hashref($self->sth('сумма начислений месяца', $cb ? {Async=>1} : ()), undef, $pid, $month, $cb // ());
  $self->dbh->selectrow_hashref($self->dict->render('сумма начислений месяца'), undef, $pid, $month, $cb // ());
  
}

sub сумма_выплат_месяца {
  my ($self, $pid, $month, $cb) = @_; 
  #~ $self->dbh->selectrow_hashref($self->sth('сумма выплат месяца',), undef, $pid, $month, $cb // ());
  $self->dbh->selectrow_hashref($self->dict->render('сумма выплат месяца',),  undef, $pid, $month, $cb // ());
  #~ $self->app->pg->db->query($self->dict->render('сумма выплат месяца'), $pid, $month, $cb // ());
  
}

sub расчеты_выплаты_сохранить {
  my ($self, $data) = @_;
  my $prev = $self->dbh->selectrow_hashref($self->sth('расчеты выплаты'), undef, $data->{id}, undef, undef)
    if $data->{id};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "движение денег", ["id"], $data, {"дата"=>"date_trunc('month', ?::date) + interval '1 month' - interval '1 day' ", "сумма"=>"text2numeric(?)"});# конец месяца
  
  $prev ||= $self->dbh->selectrow_hashref($self->sth('расчеты выплаты'), undef, $r->{id}, undef, undef);
  
  $self->связь($r->{id}, $data->{"профиль"}, );
  
  map {# прямые связи
    #~ if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    #~ } else {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    #~ }
  } qw(категория);

  return $r;
}

sub расчеты_выплаты_удалить {
  my ($self, $data) = @_;
  my $prev = $self->dbh->selectrow_hashref($self->sth('расчеты выплаты'), undef, $data->{id}, undef, undef)
    or return "Не найдена запись дополнительных расчетов ЗП в движении денег";
  
  $self->связь_удалить(id1=>$prev->{"категория/id"}, id2=>$data->{id});
  $self->связь_удалить( id2=>$data->{id}, id1=>$data->{"профиль"},);
  
  $self->_delete($self->{template_vars}{schema}, "движение денег", ["id"], $data);
}

sub расчет_зп_сводка {
  my ($self, $param) = @_; #

  my @bind = (($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, ($param->{'отключенные объекты'}) x 2, ($param->{'месяц'}) x 7,); #((undef) x 2, $param->{'месяц'}, ($param->{'отключенные объекты'}) x 2, ($param->{'месяц'}) x 2,);
  $self->dbh->selectall_arrayref($self->sth('сводка расчета ЗП', select=>$param->{select} || '*', join=>'табель/join'), {Slice=>{},}, @bind)
}

sub месяц_табеля_закрыт {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_}); #
  return $self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $param->{'дата'} || $param->{'месяц'}, $param->{"объект"})
    if ($param->{'дата'} || $param->{'месяц'}) && $param->{"объект"};
  $self->dbh->selectrow_array($self->sth('месяц табеля закрыт/interval'));
}

sub открыть_месяц {
  my ($self, $oid, $month, $uid) = @_; #
  $self->dbh->selectrow_array($self->sth('открыть месяц объекта'), undef,  $oid, $month, $uid);
}

sub чистка_дублей_табеля {
  my ($self) = @_; #
  return;
  
  @{$self->dbh->selectall_arrayref($self->sth('чистка дублей табеля'), {Slice=>{},})}
    or return
    while (1);
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  ---"объект" int not null, -- таблица roles
  "дата" date not null, --
  ----"сотрудник" int not null, -- таблица  профили
  "значение" text not null,
  "коммент" text
);


CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам" ON "табель" ("формат месяц"("дата"));
CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам2" ON "табель" ("формат месяц2"("дата"));
CREATE INDEX IF NOT EXISTS "табель/значение/индекс" on "табель"("значение");
CREATE INDEX IF NOT EXISTS "табель/коммент/индекс" ON "табель"("коммент");
CREATE INDEX IF NOT EXISTS "табель/коммент/индекс/not null" ON "табель"(("коммент" IS NOT NULL));
------------
CREATE OR REPLACE FUNCTION "формат месяц"(date) RETURNS text AS $$ 
  select to_char($1, 'YYYY-MM');
$$ LANGUAGE SQL IMMUTABLE STRICT;
------------
CREATE OR REPLACE FUNCTION "формат месяц2"(date) RETURNS date AS $$ 
  select date_trunc('month', $1)::date;
$$ LANGUAGE SQL IMMUTABLE STRICT;

--------------
CREATE OR REPLACE FUNCTION "формат даты"(date) RETURNS text AS $$ 
  select array_to_string(array[
    to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    to_char($1, 'TMmon'),
    case when date_trunc('year', now())=date_trunc('year', $1) then '' else to_char($1, 'YYYY') end
  ]::text[], ' ');
$$ LANGUAGE SQL IMMUTABLE STRICT;
-------------------
update "разное" set val='{}'  where key='месяц табеля закрыт/interval';---на умолчание в функции
---- update "разное" set val='{"2": "2 month 10 days"}'  where key='месяц табеля закрыт/interval';---для каждого объекта своя блокировка

DROP FUNCTION IF EXISTS "месяц табеля закрыт"(date);
CREATE OR REPLACE FUNCTION "месяц табеля закрыт"(date, int) RETURNS boolean AS $$ 
select (date_trunc('month', $1) + coalesce(t.val->>($2::text), '1 month 10 days')::interval) < now() or $1>now()
from "разное" t
where t.key='месяц табеля закрыт/interval'
;
$$ LANGUAGE SQL IMMUTABLE STRICT;
--------------------

@@ функции
CREATE OR REPLACE FUNCTION text2numeric(text)
/*
*/
RETURNS numeric
AS $func$
DECLARE
  r text;
BEGIN
  r:=regexp_replace($1, '(\S\s*)-+', '\1', 'g'); -- минусы внутри
  r:=regexp_replace(r, '[^\-\d,\.]+', '', 'g'); -- шелуха
  r:=regexp_replace(r, ',', '.', 'g'); --- запятые в точки
  ---r:=regexp_replace(r, '(\.)(?=.*\1)', '', 'g'); --- одна точка последняя это не работает
  r:=regexp_replace(r, '\.+(\S+\.)', '\1', 'g'); --- одна точка последняя
  RETURN case when r='' then null else r::numeric end;
END
$func$ LANGUAGE plpgsql;


CREATE OR REPLACE VIEW "должности" AS
select g1.*
from roles g1
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

where n.g_id is null --- нет родителя топовой группы
;

DROP VIEW IF EXISTS "табель/начисления/объекты" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/объекты" AS
--- для отчета по деньгам
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  ---row_to_json(og) as "$объект/json",
  og.name as "объект",
  og.id as "объект/id",
  pr.name as "проект", pr.id as "проект/id",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  array_to_string(coalesce(c."примечание", array[]::text[]), E'\n') || ' (' || to_char(t."дата", 'TMmonth') || ': ' || og.name || ')' as "примечание"
from
---  {%###= $dict->render('табель/join') %}
  "табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join roles og on og.id=ro.id1 -- группы-объекты
  join refs rpr on og.id=rpr.id2
  ---join "проекты/объекты" po on og.id=po."объект/id"
  join "проекты" pr on pr.id=rpr.id1
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
  left join ( --- сборка примечание за все начисления месяца
    select
      rp.id1 as pid,
      ro.id1 as oid,
      date_trunc('month', t."дата") as "месяц",
      array_agg(t."коммент") as "примечание" --- || ' (' || og.name || ')'
    from
      "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join refs ro on t.id=ro.id2 -- на объекты
      join roles og on og.id=ro.id1 -- группы-объекты
      ---join "профили" p on p.id=rp.id1
    where "значение"='Примечание'
      and "коммент" is not null and "коммент"<>''
    group by rp.id1, ro.id1, date_trunc('month', t."дата")
  ) c on 
    p.id=c.pid
    and og.id=c.oid
    and date_trunc('month', t."дата")=c."месяц"
where t."значение"='Начислено'
  and t."коммент" is not null and t."коммент"<>''

union

select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  og.name as "объект",
  og.id as "объект/id",
  po."проект", po."проект/id",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '(доп. часы на '||og.name || ')' as "примечание"
from
---  {%###= $dict->render('табель/join') %}
  "табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join roles og on og.id=ro.id1 -- группы-объекты
  join "проекты/объекты" po on og.id=po."объект/id"
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1

where t."значение"='Доп. часы замстрой/начислено'
  and t."коммент" is not null and t."коммент"<>''

;

CREATE OR REPLACE VIEW "табель/начисления/переработка" AS
--- для отчета по деньгам
--- переработка одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMmonth') || ': переработка сверх 11 часов)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Переработка/начислено'
  and t."коммент" is not null and "коммент"<>''
;

---DROP VIEW IF EXISTS "табель/начисления/суточные" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/суточные" AS
--- для отчета по деньгам
--- суточные одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMmonth') || ': суточные)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Суточные/начислено'
  and t."коммент" is not null and "коммент"<>''
;

---DROP VIEW IF EXISTS "табель/начисления/отпускные" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/отпускные" AS
--- для отчета по деньгам
--- отпускные одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMmonth') || ': отпускные)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Отпускные/начислено'
  and t."коммент" is not null and "коммент"<>''
;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "движение денег/расчеты ЗП"(int, int, date)
/*
  1 - id строки "движение денег" (или null)
  или 
  2 - ИД профиля(или null все профили)
  3 - месяц (обязательно)
*/
RETURNS TABLE("id" int, ts timestamp without time zone, "сумма" money, "дата" date, "примечание" text, "категория/id" int, "категории" int[], "категория" text[])
AS $func$

select m.*,
  c.id as "категория/id",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория"

from refs rp -- к профилю
  join "движение денег" m on m.id=rp.id1
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1

where 
  (m.id=$1 --
  or (($2 is null or rp.id2=$2) -- профиль
    and date_trunc('month', m."дата") = date_trunc('month', $3::date)
    )
  ) and not exists (--- движение по кошелькам не нужно
    select w.id
    from "кошельки" w
      join refs r on w.id=r.id1
    where r.id2=m.id
  )
;

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date, integer);
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date,integer,integer);
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date,integer,integer,integer);
CREATE OR REPLACE FUNCTION "табель/пересечение на объектах"(date, int, int, int)
/*
  Если работал/отпуск на двух и более объектах в один день
  1 - дата, проверка только в этом одном месяце
  2 - ИД профиля (null - все)
  3 - ИД объекта (null - все) минус ИД - исключить этот объект, плюс ИД - только этот объект
  4 - группировка count>=$3 (null - 1)
*/
RETURNS TABLE("дата" date, "профиль/id" int, "профиль/names" text[], "часы" text[], "объекты/json" json[], "объекты/id" int[] )
AS $func$

select t."дата", p.id, p.names,
  ---count(t.*), 
  array_agg(t."значение" order by t.id), array_agg(row_to_json(o) order by t.id), array_agg(o.id order by t.id)
from "табель" t
  join refs ro on t.id=ro.id2
  join "проекты/объекты" o on o.id=ro.id1
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1

where (t."значение"~'^\d+[.,]?\d*$' or lower(t."значение")='о')
  and date_trunc('month', t."дата")=date_trunc('month', $1)
  and ($2 is null or p.id=$2)
  and case when $3<0 then o.id<>(-$3) when $3>0 then o.id=$3 else true end

group by t."дата", /*o.id,*/ p.id
having count(t.*)>=coalesce($4, 1)
--order by 1,3
;

$func$ LANGUAGE SQL;

/****************************************************************************/
/******************************     ЗАПРОСЫ     *********************************/
/****************************************************************************/

@@ бригады
---  для отчета без контроля доступа
select {%= $select || '*' %} from (select g2.*
from {%= $dict->render('бригады/join') %}
where 
  (?::int is null or g2.id=any(?::int[])) -- 
order by g2.name
) b
;

@@ бригады/join
  -- к бригадам
  roles g1
  join refs r1 on g1.id = r1.id1 and g1."name"='Бригады'
  join roles g2 on g2.id=r1.id2 and not coalesce(g2."disable", false)

@@ табель/join
"табель" t
  left join (--- на объект
    select og.*, ro.id2 
    from refs ro
      join roles og on og.id=ro.id1 -- группы-объекты
  ) og on t.id=og.id2
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1

@@ табель/бригады/join
-- для отчета по бригадам
"табель" t
   -- на профили
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1
  -- на группы-бригады
  join refs ro on p.id=ro.id2 
  join roles og on og.id=ro.id1 -- это бригады
  join refs rb on og.id=rb.id2
  join roles bg on bg.id=rb.id1 and bg.name='Бригады'

@@ значения за месяц
-- по объекту или профилю
select t.*, og.id as "объект", p.id as "профиль"
from {%= $dict->render('табель/join') %}
where "формат месяц"(?::date)="формат месяц"(t."дата")
  and (?::int is null or og.id=?) -- объект
  and (?::int is null or p.id=?) -- профиль
  and (?::text is null or t."значение" ~ ?::text) -- регулярку типа '^.{1,2}$' только часы
{%= $order_by %}
;


@@ сотрудники объекта
select p.*
from refs r1
  join roles g1 on g1.id=r1.id2 -- вниз 1 ур
  join refs r3 on g1.id = r3.id1 -- к профилям
  join "профили" p on p.id=r3.id2

where r1.id1=? -- объект
  and g1.name=? -- жесткое название группы внутри каждого объекта
order by array_to_string(p.names, ' ')
;

@@ должности/join
---!!! refs r1
  join roles g1 on g1.id=r1.id1 -- это надо
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

@@ должности сотрудника
select g1.*
from refs r1
  {%= $dict->render('должности/join') %}
  
where r1.id2=? --- профиль
  and g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

order by g1.name
;

@@ профили
-- и должности/бригады
select {%= $select || '*' %} from (select pd.*, br."бригады/id"
from (
  select p.id, p.names, p.disable,
    array_agg(g1.name) as "должности",
    sum((g1.name='ИТР')::int) as "ИТР?"
  from
    "профили" p
  
    left join (--- должности сотрудника
      select g1.*, r1.id2 as pid
      from refs r1 
      {%= $dict->render('должности/join') %}
      where n.g_id is null --- нет родителя топовой группы
    ) g1 on p.id=g1.pid
  where 
    (? is null or p.id=any(?)) --- профили кучей
    ---and not coalesce(p.disable, false)
  group by p.id, p.names
) pd
  left join (-- бригады не у всех
    select r.id2 as profile_id, array_agg(b.id) as "бригады/id" ---array_agg(row_to_json(b)) as "бригады/json"
    from refs r
    join (select g2.* from {%= $dict->render('бригады/join') %}) b on b.id=r.id1
    group by r.id2
  ) br on pd.id=br.profile_id
order by pd.names
) p
;

@@ профили за прошлый месяц
-- и должности

select array_agg(distinct p.id)
from
  {%= $dict->render('табель/join') %}
  left join (
    select t.*, og.id as "объект/id"
    from "табель" t
    join (--- на объект
      select og.*, ro.id2 
      from refs ro
        join roles og on og.id=ro.id1 -- группы-объекты
    ) og on t.id=og.id2
    where t."значение"='_не показывать_'
  ) t2 on "формат месяц"(t."дата")="формат месяц"(t2."дата") and og.id=t2."объект/id"
where 
  not p.id=any(?) --- профили не скрытые
  and not coalesce(p.disable, false)
  and "формат месяц"((?::date - interval ?)::date)="формат месяц"(t."дата")
  and og.id=? -- объект
  and t2.id is null
;

@@ значение на дату
--- для ставки, КТУ
select t.*
from 
  {%= $dict->render('табель/join') %}
where p.id=?
  and ro.id1=? -- объект
  ---and extract(day from t."дата")=1
  and (t."дата"<=?::date or "формат месяц"(?::date)="формат месяц"(t."дата")) -- последнее значение (СТАВКА) или на этот месяц (КТУ)
  and t."значение" = ?
order by t."дата" desc
limit 1;

@@ значение на дату/все объекты
--- для ставки
--- если нет ставки по конкретному объекту взять последнюю ставку по любому объекту
select t.*
from 
  {%= $dict->render('табель/join') %}
where p.id=?
  ---and ro.id1= -- объект
  ---and extract(day from t."дата")=1
  and t."дата"<=?::date -- последнее значение (СТАВКА)
  and t."значение" = ? -- Ставка допустим
order by t."дата" desc, ts desc
limit 1;

@@ сводка за месяц/суммы
--- тут по объектам
select sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  sum(case when (coalesce(text2numeric(t."значение"), 0::numeric)>11::numeric)::boolean and og.id<>132389 /*километраж нет*/ then text2numeric(t."значение")-11::numeric else null end) as "переработка/часов",
  count(case when (coalesce(text2numeric(t."значение"), 0::numeric)>11::numeric)::boolean and og.id<>132389 /*километраж нет*/ then 1 else null end) as "переработка/смен",
  og.id as "объект", p.id as "профиль", p.names, og.name as "объект/name" ---, array_agg(g1.name) as "должности"
  , "формат месяц"(t."дата") as "формат месяц", date_trunc('month', t."дата") as "дата месяц",
  null::int as "профиль1/id"
from 
  {%= $dict->render($join) %}
where 
  (coalesce(?::int,0)=0 or og.id=?) -- объект
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" ~ '^\d+[.,]?\d*$' --- только цифры часов в строке
  and (?::boolean is null or coalesce(og."disable", false)=?::boolean) -- отключенные/не отключенные объекты
group by og.id, og.name,  p.id,  "формат месяц"(t."дата"), date_trunc('month', t."дата")        ---, p.names
---order by og.name, p.names

union all ---двойники (привязывать к объекту)

select 0, 0, 0, 0, o.id, p2.id, p2.names, o.name, "формат месяц"(?::date) as "формат месяц", date_trunc('month', ?::date) as "дата месяц",
  p1.id as "профиль1/id"
from 
  "профили" p1
  join refs r on p1.id=r.id1
  join "профили" p2 on p2.id=r.id2
  join refs ro on p2.id=ro.id2
  join "объекты" o on o.id=ro.id1
  ---join "roles" o on o.id=ro.id1
---where o.id=any(array[90152, 100194]::int[]) ---o.name=''

--- конец @@ сводка за месяц/суммы

@@ сводка за месяц
--- тут по объектам
select *,
  coalesce("_КТУ1", 1.0::numeric) as "КТУ1",
  coalesce("_КТУ2", coalesce("_КТУ1", 1.0::numeric)) as "КТУ2"
  ----(case when "_Ставка"='' then null else "_Ставка" end)::int "Ставка"
from (
select sum.*,
  text2numeric(k1."коммент") as "_КТУ1",
  text2numeric(k2."коммент") as "_КТУ2",
  text2numeric(st1."коммент") as "Ставка",
 --- text2numeric(coalesce(sm1."коммент", sm2."коммент")) as "Сумма",
  text2numeric(sm1."коммент") as "Сумма",
  text2numeric(pay."коммент") as "Начислено",
  text2numeric(dop."коммент") as "Доп. часы замстрой",
  text2numeric(dop_sum."коммент") as "Доп. часы замстрой/сумма",
  text2numeric(dop_pay."коммент") as "Доп. часы замстрой/начислено",
  ----day."Суточные",
  ---text2numeric(day_st."коммент") as "Суточные/ставка",
  ---day."Суточные" as "Суточные/смены",---умнож * sum."всего смен"
  descr."коммент" as "Примечание",
  p2.id as "профиль2/id", p2.names as "профиль2"
from (
  {%= $dict->render('сводка за месяц/суммы', join=>$join) %}
) sum
-------КТУ1--------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ1'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) k1 on true
--------КТУ2-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ2'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) k2 on true
--------Ставка по этому объекту или другим-----------
left join lateral (
select * from (
select t.*, og.id=sum."объект" as "этот объект"
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  ---and og.id=sum."объект" -- объект
  ---and  t."дата"<=\?::date
  and t."значение" = 'Ставка'
  and t."коммент" is not null
) t
order by t."этот объект" desc, t."дата" desc, t.ts desc
limit 1
) st1 on true
--------последняя Ставка по всем объектам-----------
/***left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and t."значение" = 'Ставка'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) st2 on true
***/
--------Сумма по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."формат месяц"="формат месяц"(t."дата")
  and t."значение" = 'Сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) sm1 on true
----------------Начислено по этому объекту---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Начислено'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) pay on true
-------- Доп. часы замстрой по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."формат месяц"="формат месяц"(t."дата")
  and t."значение" = 'Доп. часы замстрой'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) dop on true
-------- Доп. часы замстрой/сумма по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."формат месяц"="формат месяц"(t."дата")
  and t."значение" = 'Доп. часы замстрой/сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) dop_sum on true
---------------- Доп. часы замстрой/начислено по этому объекту---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Доп. часы замстрой/начислено'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) dop_pay on true
----------------Примечание---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Примечание'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) descr on true
----------------Суточные (теперь не по объектам)---------------------
/****left join lateral (
select sum(text2numeric(t."коммент")) as "Суточные"
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  ---and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные'
  ---and t."коммент" is not null
  and t."коммент" ~ '^\d+[.,]?\d*$'
---order by t."дата" desc
---limit 1
---group by p.id, "формат месяц"(t."дата")
) day on true
***/
----------------Суточные/ставка (теперь не по объектам)---------------------
/****left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные/ставка'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) day_st on true
***/

-------Двойники--------
left join lateral (-- профиль двойника
select p.*
from 
  refs r,
  "профили" p
where (sum."профиль"=r.id1 and p.id=r.id2) --- or (sum."профиль"=r.id2 and p.id=r.id1)
  and p.id <> sum."профиль"
--limit 1
) p2 on true

) q

--- конец @@ сводка за месяц

@@ сводка за месяц/общий список
--- сворачивает объекты
select {%= $select || '*' %} from (select coalesce(work."профиль", otp."профиль") as "профиль",
  coalesce(work.names, otp.names) as names,
  ---coalesce(work."дата месяц", otp."дата месяц") as "дата месяц",
  work."профиль2/id", work."профиль2",
  work."профиль1/id",
  coalesce(work."объекты", array[]::int[]) as "объекты",
  work."объекты/name",
  work."всего часов",
  work."всего смен",
  work."переработка/часов",
  work."переработка/смен",
  work."КТУ1",
  work."КТУ2",
  work."Ставка",
  coalesce(work."Сумма", array[]::numeric[]) as "Сумма",
  coalesce(work."Начислено", array[]::numeric[]) as "Начислено",
  coalesce(work."Доп. часы замстрой", array[]::numeric[]) as "Доп. часы замстрой",
  coalesce(work."Доп. часы замстрой/сумма", array[]::numeric[]) as "Доп. часы замстрой/сумма",
  coalesce(work."Доп. часы замстрой/начислено", array[]::numeric[]) as "Доп. часы замстрой/начислено",
  work."Суточные",
  work."Суточные/ставка",
  work."Суточные/смены",
  work."Суточные/сумма",
  work."Суточные/начислено",
  work."Переработка/ставка",
  work."Переработка/сумма",
  work."Переработка/начислено",
  otp."отпускных дней",
  otp."Отпускные/ставка",
  otp."Отпускные/сумма",
  otp."Отпускные/начислено",
  calc_zp."РасчетЗП",
  coalesce(work."Примечание", otp."Примечания") as "Примечание"
from (
  select sum."профиль", sum.names, sum."дата месяц", /* sum."формат месяц",*/ sum."профиль2/id", sum."профиль2", sum."профиль1/id",
    array_agg(sum."объект" order by sum."объект") as "объекты",
    array_agg(sum."объект/name" order by sum."объект") as "объекты/name",
    array_agg(sum."всего часов" order by sum."объект") as "всего часов",
    array_agg(sum."всего смен" order by sum."объект") as "всего смен",
    array_agg(sum."переработка/часов" order by sum."объект") as "переработка/часов",
    array_agg(sum."переработка/смен" order by sum."объект") as "переработка/смен",
    array_agg(sum."КТУ1" order by sum."объект") as "КТУ1",
    array_agg(sum."КТУ2" order by sum."объект") as "КТУ2",
    array_agg(sum."Ставка" order by sum."объект") as "Ставка",
    array_agg(sum."Сумма" order by sum."объект") as "Сумма",
    array_agg(sum."Начислено" order by sum."объект") as "Начислено",
    array_agg(sum."Доп. часы замстрой" order by sum."объект") as "Доп. часы замстрой",
    array_agg(sum."Доп. часы замстрой/сумма" order by sum."объект") as "Доп. часы замстрой/сумма",
    array_agg(sum."Доп. часы замстрой/начислено" order by sum."объект") as "Доп. часы замстрой/начислено",
    ---array_agg(sum."Суточные" order by sum."объект") as "Суточные",
    ---array_agg(sum."Суточные/ставка" order by sum."объект") as "Суточные/ставка",
    ---sum(sum."Суточные/смены") as "Суточные/смены",
    ---day_cnt."коммент" as "Суточные/смены",
    day."Суточные",
    day."Суточные" as "Суточные/смены",
    text2numeric(day_st."коммент") as "Суточные/ставка",
    text2numeric(day_sum."коммент") as "Суточные/сумма",
    text2numeric(day_money."коммент") as "Суточные/начислено",
    text2numeric(overwork_st."коммент") as "Переработка/ставка",
    text2numeric(overwork_sum."коммент") as "Переработка/сумма",
    text2numeric(overwork_money."коммент") as "Переработка/начислено",
    array_agg(sum."Примечание" order by sum."объект") as "Примечание"
  from (
    {%= $dict->render('сводка за месяц', join=>$join) %}
  ) sum
----------------Суточные (теперь не по объектам)---------------------
left join lateral (
  select sum(text2numeric(t."коммент")) as "Суточные"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and og.id=sum."объект" -- объект
    ---and  sum."формат месяц"="формат месяц"(t."дата") -- 
    and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Суточные'
    ---and t."коммент" is not null
    and t."коммент" ~ '^\d+[.,]?\d*$'
  ---order by t."дата" desc
  ---limit 1
  ---group by p.id, "формат месяц"(t."дата")
) day on true
----------------Суточные/ставка (теперь не по объектам)---------------------
left join lateral (--- этот месяц или предыдущий
select * from (
select t.*, sum."дата месяц"=date_trunc('month', t."дата") as "в этом месяце"
from 
  "табель" t
    join refs rp on t.id=rp.id2 -- на профили
    join "профили" p on p.id=rp.id1
where p.id=sum."профиль"
  ----and og.id=sum."объект" -- объект
  ---and sum."дата месяц"=date_trunc('month', t."дата")
  and t."значение" = 'Суточные/ставка'
  and t."коммент" is not null
) t
order by t."в этом месяце" desc, t."дата" desc
limit 1
) day_st on true

  ----------------Суточные/сумма (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
  "табель" t
    join refs rp on t.id=rp.id2 -- на профили
    join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and  sum."формат месяц"="формат месяц"(t."дата") -- 
    and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Суточные/сумма'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) day_sum on true
  ----------------Суточные/начислено (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Суточные/начислено'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) day_money on true

----------------Переработка/ставка (не по объектам)---------------------
  left join lateral (
  select * from (
  select t.*, sum."дата месяц"=date_trunc('month', t."дата") as "в этом месяце"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Переработка/ставка'
    and t."коммент" is not null
  ) t
  order by t."в этом месяце" desc, t."дата" desc
  limit 1
  ) overwork_st on true
----------------Переработка/сумма (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Переработка/сумма'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) overwork_sum on true
----------------Переработка/начислено (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Переработка/начислено'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) overwork_money on true
  
  group by sum."профиль", sum.names, day."Суточные", day_st."коммент", day_sum."коммент", day_money."коммент", sum."дата месяц", overwork_st."коммент", overwork_sum."коммент", overwork_money."коммент", /*sum."формат месяц", */ sum."профиль2/id", sum."профиль2", sum."профиль1/id"
) work

full outer join (
  select days.*,
    ----text2numeric(coalesce(st."коммент", st_prev."коммент")) as "Отпускные/ставка",
    text2numeric(st."коммент") as "Отпускные/ставка",
    text2numeric(sum."коммент") as "Отпускные/сумма",
    text2numeric(money."коммент") as "Отпускные/начислено"
  from 
    (----------------Отпускные дни (со всех объектов)---------------------
    select p.id as "профиль", p.names, ----"формат месяц"(t."дата") as "формат месяц", date_trunc('month', t."дата") as "дата месяц",
      count(distinct t."дата") as "отпускных дней",
      array_agg(t."коммент") as "Примечания"
    from {%= $dict->render($join) %}
    where 
      ---"формат месяц"(\?::date)="формат месяц"(t."дата")  --- парам месяц 1
      date_trunc('month', ?::date)=date_trunc('month', t."дата")
      and lower(t."значение") = 'о'-- заглавная
    group by p.id, p.names
    ) days
  ----------------Отпускные/ставка заданный месяц или другой (не по объектам)---------------------
  left join lateral (
  select * from(
  select t.*, date_trunc('month', ?::date)=date_trunc('month', t."дата") as "в этом месяце"
  from 
    {%= $dict->render($join) %}
  where p.id=days."профиль"
    ---and  days."формат месяц"="формат месяц"(t."дата") --- парам месяц 2
    ---and date_trunc('month', ?::date)=date_trunc('month', t."дата")
    and t."значение" = 'Отпускные/ставка'
    and t."коммент" is not null
  ) t
  order by t."в этом месяце" desc, t."дата" desc
  limit 1
  ) st on true
  ----------------Отпускные/сумма (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    {%= $dict->render($join) %}
  where p.id=days."профиль"
    ---and  days."формат месяц"="формат месяц"(t."дата") --- парам месяц 3
    and date_trunc('month', ?::date)=date_trunc('month', t."дата")
    and t."значение" = 'Отпускные/сумма'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) sum on true
  ----------------Отпускные/начислено (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    {%= $dict->render($join) %}
  where p.id=days."профиль"
    ----and  days."формат месяц"="формат месяц"(t."дата") --- парам месяц 4
    and date_trunc('month', ?::date)=date_trunc('month', t."дата")
    and t."значение" = 'Отпускные/начислено'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) money on true

) otp on work."профиль"=otp."профиль" ---and work."формат месяц"=otp."формат месяц"

-----------------Расчет ЗП (не по объектам)---------------------
/* после доп начислений и удержаний */
left join (
select p.id as "профиль", ---"формат месяц"(t."дата") as "формат месяц",
    array_to_string(array_agg(text2numeric(t."коммент")), '?!ошибка!?') as "РасчетЗП"
from 
  {%= $dict->render($join) %}
where ---p.id=sum."профиль"
  ---and  sum."формат месяц"="формат месяц"(t."дата") -- 
  "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" = 'РасчетЗП'
  and t."коммент" is not null
group by p.id
) calc_zp on calc_zp."профиль"=coalesce(work."профиль", otp."профиль")---- and coalesce(work."формат месяц", otp."формат месяц")=calc_zp."формат месяц"

/*** не катит - в отдельный запрос
left join lateral (
  select true as "пересечение объектов есть"
  where exists (select * from "табель/пересечение на объектах"(work."дата месяц"::date, work."профиль"))
)  as tpo on true
***/
/***left join lateral (
  select * from "табель/пересечение на объектах/exists"(work."дата месяц"::date, work."профиль")
) as tpo on true***/
) t
--- конец @@ сводка за месяц/общий список

@@ пересечение объектов
--- проверка что сотрудник был на двух и более объектах в один день
select {%= $select || '*' %} from (
select "профиль/id" as pid,
  array_agg(row_to_json(t)) as "пересечения/json"
from (
  select "профиль/id", "дата", timestamp_to_json("дата") as "$дата/json", "объекты/json", "часы"
  from "табель/пересечение на объектах"(?::date, null, null, 2) -- два и больше пересечения
) t
group by "профиль/id"
) t


@@ пересечение объектов/сохранение
--- проверка при сохранении из формы табеля
select *, timestamp_to_json("дата"::timestamp) as "$дата/json"
from "табель/пересечение на объектах"(?::date, ?::int, -(?::int), 1::int) -- минус - исключить этот объект
where "дата"=?::date
;


@@ строка табеля
---   для сохранения ставки
select t.*, p.id as "профиль", og.id as "объект"
from {%= $dict->render('табель/join') %}

where 
  t.id=?
  or 
  (
    p.id=?
    and (?::int = 0 or og.id=?)
    and ("формат месяц"(?::date)="формат месяц"(t."дата") or t."дата"=?::date)
    and (t."значение" = ? or  t."значение" ~ ?)
  )
--- нет точки -запятой! подзапрос

@@ сотрудники на объектах
--- для отчета спец-та по тендерам
select
  "профиль", "ФИО", "должности",
  array_agg("объект") as "объекты",
  array_agg("объект/название") as "объекты/название",
  array_agg("всего смен") as "всего смен",
  array_agg(array_to_string("дни", ', ')) as "дни"
from (
select              
---sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  array_agg(date_part('day', t."дата") order by date_part('day', t."дата") ) as "дни",
  og.id as "объект", og.name as "объект/название",
  p.id as "профиль", array_to_string(p.names, ' ') as "ФИО",
  g1."должности"
from 
  {%= $dict->render('табель/join') %}
  left join (--- должности 
    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2
  ) g1 on p.id=g1.pid
where 
  (?::int=0 or og.id=?) -- объект
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" ~ '^\d+[.,]?\d*$' --- только цифры часов в  строке
  ---and coalesce(og."disable", false)=Х::boolean -- отключенные/не отключенные объекты
group by p.id, g1."должности", og.id, og.name  ---, p.names
---order by p.names
) s
group by "профиль", "ФИО",  "должности"
order by "ФИО"
;

@@ квитки начислено
--- на принтер для табельщиков
select {%= $select || '*' %} from (select s.*, d."должности", o.id::boolean as "печать"
from (
select sum."профиль", sum.names, 
  array_agg(sum."объект") as "объекты",
  array_agg(sum."объект/name") as "объекты/name",
  array_agg(sum."всего часов") as "всего часов",
  array_agg(sum."всего смен") as "всего смен"
  ---array_agg(pay."начислено"::int::boolean) as "начислено"
  
from (
    {%= $dict->render('сводка за месяц/суммы', join=>$join) %}
  ) sum
/****  ----------------Начислено---------------------
  left join lateral (
  select text2numeric(t."коммент") as "начислено"
  from 
    {%= $dict->render($join) %}
  where p.id=sum."профиль"
    and og.id=sum."объект" -- объект
    and  sum."формат месяц"="формат месяц"(t."дата") -- 
    and t."значение" = 'Начислено'
    and t."коммент" is not null and "коммент"<>''
  order by t."дата" desc
  limit 1
  ) pay on true
***/
where sum."профиль1/id" is null --- без двойников
  group by sum."профиль", sum.names
) s 

left join (--- должности

    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2

) d on s."профиль" = d.pid

left join lateral ( --- установить крыжик печать для сотрудников доступных объектов
  select id
  from "доступные объекты"(?, s."объекты")
  limit 1
) o on true
order by s.names
) t;

@@ квитки расчет
--- на принтер для сергея
select {%= $select || '*' %} from (select s.*,
  g1."должности", g1."ИТР?",
  "строки расчетов"

from (
    {%= $dict->render('сводка за месяц/общий список', join=>$join) %}
  ) s

left join lateral (--- хитрая или нет агрегация строк как json
  select array_agg("json" order by  "сумма" desc) as "строки расчетов"
  from (
    select row_to_json(m) as "json", m.*
    from "движение денег/расчеты ЗП"(null::int, s."профиль", ?::date) m
    ---order by "сумма" desc;
  ) m
) calc_rows on true

left join lateral (--- должности сотрудника
  select array_agg(g1.name) as "должности", sum((g1.name='ИТР')::int) as "ИТР?"
  from refs r1 
    {%= $dict->render('должности/join') %}
  where r1.id2=s."профиль"
    and n.g_id is null --- нет родителя топовой группы
  group by r1.id2
) g1 on true

where s."РасчетЗП" is not null and s."РасчетЗП"<>'0' and s."РасчетЗП"<>''
  ---and s."профиль1/id" is null --- без двойников
order by s.names
) t;

@@ расчеты выплаты
-- из табл "движение денег"
select {%= $select || 'm.*' %}
from "движение денег/расчеты ЗП"(?, ?, ?) m
order by m.ts;

@@ сумма начислений месяца
-- по профилю
select sum("сумма") as "начислено", array_agg("примечание") as "примечания"
from "движение ДС/начисления по табелю"-- движение ДС/начисления сотрудникам --  view только  приходы по табелю
where "профиль/id"=?
  and date_trunc('month', "дата") = date_trunc('month', ?::date)
;

@@ сумма выплат месяца
-- по профилю
select sum("сумма") as "выплачено", array_agg('(' || "кошельки"[1][1] || ': ' || "кошельки"[1][2] || ') ' || coalesce("примечание", ''::text)) as "примечания"
from "движение ДС/по сотрудникам"
where "профиль/id"=?
  and date_trunc('month', "дата") = date_trunc('month', ?::date)
  and sign=-1
;


@@ сводка расчета ЗП
--- сворачивает объекты
select {%= $select || '*' %} from (select sum."профиль",
  sum."объекты",
  ---sum."объекты/name",
  sum."Сумма",
  sum."Начислено",
  sum."Доп. часы замстрой",
  sum."Доп. часы замстрой/сумма",
  sum."Доп. часы замстрой/начислено",
  sum."Суточные/сумма",
  sum."Суточные/начислено",
  sum."Отпускные/сумма",
  sum."Отпускные/начислено",
  sum."Переработка/сумма",
  sum."Переработка/начислено",

  sum."РасчетЗП",
  sum."Примечание"
from (
  {%= $dict->render('сводка за месяц/общий список', join=>$join) %}
) sum


where 
  0::numeric<any(sum."Начислено"||sum."Доп. часы замстрой/начислено"||sum."Отпускные/начислено"||sum."Переработка/начислено"||sum."Суточные/начислено")
  ---or coalesce(, 0::numeric)<>0::numeric
  ---or coalesce(, 0::numeric)<>0::numeric
  ---or coalesce(, 0::numeric)<>0::numeric
  /*** двойники в силе!  and not exists (
    select g1.*
    from refs r1 
    {%= $dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
      and sum."профиль"=r1.id2
      and g1.name='ИТР'
  ) ***/

---order by sum.names
) t
;

@@ месяц табеля закрыт
select "месяц табеля закрыт"(?::date, ?::int);

@@ месяц табеля закрыт/interval
-- вся запись о всех интервалах для объектов
select row_to_json(t)
from (
select t.* ---, t.val as "val/json"
from "разное" t
where t.key='месяц табеля закрыт/interval'
) t;

@@ открыть месяц объекта
-- ид объекта без пробелов
update "разное"
set val=('{"' || ?::text || '": " ' || (now()-date_trunc('month', ?::date)+'1 day'::interval)::text || ' "}')::jsonb,
  ts=default,
  uid=?
where key='месяц табеля закрыт/interval'
returning *
;

@@ расчеты выплаты не в этом месяце
---
select m.id, m.ts, m."дата", timestamp_to_json(m."дата"::timestamp) as "@дата", m."сумма",m."примечание", "формат даты"(m."дата") as "дата формат",
  sign("сумма"::numeric) as "sign", 
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория"
  ---array_to_string(p.names, ' ') as "профиль", p.id as "профиль/id",
  ---null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  ---array[[pr.id, null]]::int[][] as "кошельки/id",  --- проект 0 -- запись для всех проектов
  

from "движение денег" m
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  
  join refs rp on m.id=rp.id1
  join "профили" p on p.id=rp.id2
  
  /***left join (
    select p.*, r.id2
    from "проекты" p
      join refs r on p.id=r.id1
  ) pr on p.id=pr.id2
  ***/


where 
  p.id = ?
  and date_trunc('month', ?::date) <> date_trunc('month', m."дата")
  and exists (--- закрыли расчет привязали строки денег к строке расчета (табель)
    select t.*
      from refs rm 
        join "табель" t on t.id=rm.id2
        join refs rp on t.id=rp.id2
      
      where rm.id1= m.id
        and rp.id1=p.id -- профиль
        and date_trunc('month', t."дата") = date_trunc('month', m."дата")
        and t."значение"='РасчетЗП'
        and (t."коммент" is not null or t."коммент"::numeric<>0)
  )
order by m."дата" desc, m.id desc
;

@@ чистка дублей табеля
---непонятно, пока костыль
delete from "табель"
where id in (
select --- t."дата", p.id, o.id, 
  min(t.id)
from "табель" t
  join refs ro on t.id=ro.id2
  join "проекты/объекты" o on o.id=ro.id1
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1
where (t."значение"~'^\d+[.,]?\d*$' or lower(t."значение")='о')
  ----and date_trunc('month', t."дата")=date_trunc('month', '2018-04-05'::date)
group by t."дата", o.id, p.id
having count(t.*)>=2
)
returning *;
