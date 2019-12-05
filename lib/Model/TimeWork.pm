package Model::TimeWork;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['TimeWork.pm.dict.sql'];

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
  
  my ($where, @bind) = $self->SqlAb->where({
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $month ],
    ' og.id ' => $oid,
  });
  
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
    elsif (!$hidden{$_->{"профиль"}} && $_->{"значение"} ~~ [qw(КТУ1 КТУ2 КТУ3 Примечание Начислено Ставка Сумма Суточные Суточные/начислено Суточные/сумма Суточные/ставка Переработка/ставка Переработка/сумма Переработка/начислено Отпускные/ставка Отпускные/сумма Отпускные/начислено ), 'Доп. часы замстрой', 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено']) {
      $profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}};
      $profiles{$_->{"профиль"}}{$_->{"значение"}} = $_;
    } # кту ставит на участке
    elsif ( !$hidden{$_->{"профиль"}} ) {$profiles{$_->{"профиль"}}++ unless $profiles{$_->{"профиль"}};}

    $data->{"значения"}{$_->{"профиль"}}{$_->{"дата"}} = $_
      unless $hidden{$_->{"профиль"}} || (ref $profiles{$_->{"профиль"}} && defined $profiles{$_->{"профиль"}}{$_->{"значение"}}); # $_->{"значение"} ~~ [qw(Ставка Начислено)] || 
    
  #~ } grep {
    #~ $_->{"значение"} eq '_не показывать_' ? !++$hidden{$_->{"профиль"}} : !$hidden{$_->{"профиль"}};
  } @{$self->dbh->selectall_arrayref($self->sth('значения за месяц', where=>$where), {Slice=>{},}, @bind)};
  
  my $prev_month = $self->dbh->selectrow_array($self->sth('профили за прошлый месяц'), undef, ([keys %hidden], $month, '1 month', $oid,)) || [];# кроме скрытых в этом мес 
  
  #~ $self->app->log->error($self->app->dumper($prev_month));
  
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (1, [keys %profiles, @$prev_month]));
  #~ $self->app->log->error($self->app->dumper($data->{"сотрудники"}));
  
  my $sth = $self->sth('строка табеля',  where=>' WHERE p.id=? and "формат месяц2"(t."дата")="формат месяц2"(?::date) and t."значение"=?; ');
  
  map {
    my $p = $_;
    my $profile = $profiles{$_->{id}};
    if ($profile && ref $profile) {
      @$_{keys %$profile} = values %$profile;
    }
    
    $_->{'Суточные/начислено'} ||= $self->dbh->selectrow_hashref($sth, undef, ($_->{id}, $month, 'Суточные/начислено'));#(undef, $_->{id}, (0) x 2, ($month, undef), ('Суточные/начислено', undef))
    $_->{'месяц табеля/закрыт'} ||= $data->{'месяц табеля закрыт'};
    
    #~ $_->{'Ставка'} ||= $self->dbh->selectrow_hashref($self->sth('значение на дату'), undef, ($_->{id}, $oid, ($month, undef), 'Ставка'));
    
  } @{$data->{"сотрудники"}};
  
  return $data;
  
}

sub строка_табеля {
  my $self = shift; #
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $data = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' t.id ' => $data->{id})
      : (
        ' p.id ' => $data->{'профиль'},
        $data->{'объект'} ? (' og.id ' => $data->{'объект'} ) : (),
        -or => [' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ], ' t."дата" ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],],
        -or => [' t."значение" ' => $data->{'значение'}, ' t."значение" ' => { ' ~ ', $data->{'значение'}},],
      )
  });
  
  $self->dbh->selectrow_hashref($self->dict->render('строка табеля',  where=>$where), undef, @bind, $cb // ());#($data->{id}, $data->{'профиль'}, ($data->{'объект'}) x 2, ($data->{'дата'}) x 2, ($data->{'значение'}) x 2)
  
}

sub строка_расчета_зп {
  my $self = shift; #
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $data = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' t.id ' => $data->{id})
      : (
        ' p.id ' => $data->{'профиль'},
        ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
        ' t."значение" ' => 'РасчетЗП',
      )
  });
  
  $self->dbh->selectrow_hashref($self->dict->render('строка табеля', where=>$where), undef, @bind, $cb // ());#($data->{id}, $data->{'профиль'}, ($data->{'объект'}) x 2, ($data->{'дата'}) x 2, ($data->{'значение'}) x 2)
  
}


sub профили {# просто список для добавления строк в табель
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_},); # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('профили', select => $param->{select} || '*',), {Slice=>{},}, (undef, undef));
}

sub сохранить {# из формы и отчета
  my ($self, $data) = @_; #
  # проверка доступа к объекту НЕ ТУТ
  #~ $self->model_obj->доступные_объекты($data->{uid}, ref $data->{"объект"} ? $data->{'объект'} : [$data->{"объект"}])->[0] 
    #~ or $self->app->log->error("Объект [$data->{'объект'}] недоступен", $self->app->dumper($data))
    #~ and return "Объект [$data->{'объект'}] недоступен";
    
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено Отпускные/ставка Отпускные/сумма Отпускные/начислено РасчетЗП Переработка/ставка Переработка/сумма Переработка/начислено), 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено',]) {# заблокировать сохранение если Начислено по объекту
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      ' og.id ' => $data->{'объект'},
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => 'Начислено',
    });
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where,), undef, @bind);#(undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef))
    return "Табельная строка уже начислена"
      if $pay && $pay->{'коммент'};
    }
    
  unless ($data->{'значение'} ~~ [qw(Сумма КТУ2 Ставка Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено Отпускные/ставка Отпускные/сумма Отпускные/начислено РасчетЗП Переработка/ставка Переработка/сумма Переработка/начислено), 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено',]) {
    return "Табель закрыт после 10-го числа"
      if $self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $data->{'дата'}, $data->{"объект"});
  }
  
  unless ($data->{'значение'} ~~ [qw(РасчетЗП)]) {# заблокировать расчитано
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => 'РасчетЗП',
    });
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#(undef, $data->{"профиль"}, (0) x 2, ($data->{'дата'}, undef), ('РасчетЗП', undef))
    return "Расчет ЗП уже закрыт ".$self->app->dumper($pay)
      if $pay && $pay->{'коммент'};
  }
  
  #~ return "Нельзя начислить" форму ограничил в контроллере
    #~ if $data->{'значение'} eq 'Начислено' && !$r->{'разрешить начислять'};
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  
  $data->{'значение'} =~ /^\s+|\s+$/g;
  $data->{'коммент'} =~ /^\s+|\s+$/g
    if $data->{'коммент'};
  
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' t.id ' => $data->{id})
    : (
    ' p.id ' => $data->{'профиль'},
    ' og.id ' => $data->{'объект'},#четко по объекту
    ' t."дата" ' => $data->{'дата'} ,
    ' t."значение" ' => { ' ~ ', '^(\d+[.,]?\d*|.{1,3})$'},
    )
  });
  
  my $r = ($data->{'значение'} =~ /^(\d+[,.]?\d*|.{1,3})$/ && $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind))# $data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^(\d+\.*,*\d*|.{1,3})$')
    || (
        ($where, @bind) = $self->SqlAb->where({
          $data->{id} ? (' t.id ' => $data->{id})
          : (
          ' p.id ' => $data->{'профиль'},
          $data->{'объект'} ? (' og.id ' => $data->{'объект'} ) : (),
          ' t."дата" ' => $data->{'дата'},
          ' t."значение" ' => $data->{'значение'},
          )
        })
    )
    && $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#$data->{id},  $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), ($data->{'значение'}, undef)
  
  if ($r) {
    $data->{id} = $r->{id};
    $r = $self->_update($self->{template_vars}{schema}, $main_table, ["id"], $data);
  } #elsif() {} 
  else {# новая запись
    $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
    $self->связь($data->{"профиль"}, $r->{id});
    $self->связь($data->{"объект"}, $r->{id})
      if $data->{"объект"}; # 0 - все объекты
  }
  
  if ($data->{'значение'} eq '_добавлен_') {
    
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      $data->{'объект'} ? (' og.id ' => $data->{'объект'} ) : (),
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => '_не показывать_',
    });
    
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#(undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('_не показывать_', undef))
    $self->_удалить($self->{template_vars}{schema}, "табель", ["id"], {id=>$r->{id}})
      if $r->{id};
  }
  if ($data->{'значение'} eq '_не показывать_') {
    
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      $data->{'объект'} ? (' og.id ' => $data->{'объект'} ) : (),
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => '_добавлен_',
    });
    
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#(undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('_добавлен_', undef))
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
    
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      ' og.id ' => $data->{'объект'},
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => 'Начислено',
    });
    
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#(undef, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef))
    return "Табельная строка часов начислена"
      if $pay && $pay->{'коммент'};
  }
  
  unless ($data->{'значение'} ~~ [qw(Сумма КТУ2 Ставка Начислено Примечание Суточные/ставка Суточные/сумма Суточные/начислено РасчетЗП)]) {
    return "Табель закрыт после 10-го числа"
      if $self->dbh->selectrow_array($self->sth('месяц табеля закрыт'), undef, $data->{'дата'}, $data->{"объект"});
  }
  
  unless ($data->{'значение'} ~~ [qw(РасчетЗП)]) {# заблокировать 
    
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $data->{'профиль'},
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
      ' t."значение" ' => 'РасчетЗП',
    });
    
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind);#(undef, $data->{"профиль"}, (0) x 2, ($data->{'дата'}, undef), ('РасчетЗП', undef))
    return "Расчет ЗП уже закрыт".$self->app->dumper($pay)
      if $pay && $pay->{'коммент'};
  }
  
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' t.id ' => $data->{id})
    : (
      ' p.id ' => $data->{'профиль'},
      ' og.id ' => $data->{'объект'},
      ' t."дата" ' => $data->{'дата'},
      ' t."значение" ' => { ' ~ ', '^(\d+[.,]?\d*|.{1,3})$'},
    ),
  });
  
  my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind)#$data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^(\d+[.,]?\d*|.{1,3})$')
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
    #~ my @bind = (
      #~ ($param->{'общий список'}  || 1 ? undef : ($param->{'объект'} && $param->{'объект'}{id})) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0,#<< для сводка за месяц/суммы
      #~ ($param->{'месяц'}) x 7,
    #~ );
    
  
    
    my $oid = $param->{'объект'} && $param->{'объект'}{id};
    #~ $self->app->log->debug($self->app->dumper([map {$_->{id}} @{}]));
    my $access_all_obj = $self->model_obj->доступ_все_объекты($param->{uid});
    
    my ($where, @bind) = $self->SqlAb->where({ # для табель/join
      $param->{'общий список'} || !$oid ? () : (' og.id ' => $oid),
      ' t."значение" ' => { ' ~ ', '^\d+[.,]?\d*$'},
      ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
      $param->{'отключенные объекты'} ? (' og."disable" ' => !!$param->{'отключенные объекты'}) : (),
    });
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц', join=>'табель/join'), {Slice=>{},}, @bind)
      #~ unless $param->{'общий список'} || $param->{'общий список бригад'} || $param->{'бригада'};
    
    return $self->dbh->selectall_arrayref($self->sth('сводка за месяц/общий список', select=>$param->{select} || '*', join_access_obj=>!$access_all_obj, where=>$where, union_double_profiles=>!!$access_all_obj), {Slice=>{},},# join=>'табель/join', 
      $access_all_obj ? () : ($param->{uid}),# для join_access_obj (доступные объекты)
      @bind,# для табель/join
      $access_all_obj ? ($param->{'месяц'}) : (), # для двойников @@ сводка за месяц/суммы
      ($param->{'месяц'}) x 20,#6+5+8 left + 4 full
    );
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
    
    my ($where, @bind) = $self->SqlAb->where({
      $data->{id} ? (' t.id ' => $data->{id})
      : (
        ' p.id ' => $data->{'профиль'},
        $data->{"объект"} ? (' og.id ' => $data->{'объект'}) : (),
        ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
        ' t."значение" ' => $data->{'значение'},
      ),
    });
    
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind)#($data->{id}, $data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef))
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
    
    my ($where, @bind) = $self->SqlAb->where({
      $data->{id} ? (' t.id ' => $data->{id})
      : (
        ' p.id ' => $data->{'профиль'},
        $_ ? (' og.id ' => $_) : (),
        ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $data->{'дата'} ],
        ' t."значение" ' => $data->{'значение'},
      ),
    });
    
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля', where=>$where), undef, @bind)#($data->{id}, $data->{"профиль"}, ($_) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef),)
      || { %$data };#
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
  
  my ($where, @bind) = $self->SqlAb->where({
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
    ' p.id ' => $param->{'профиль'},
    ' t."значение" ' => \[ ' ~ ?::text ', '^(\d+[.,]?\d*|.{1,3}|КТУ\d*|Примечание|Доп\. часы замстрой|Суточные)$' ],
  });
  
  map {
    if ($_->{'значение'} =~ /^(?:КТУ|Примечание|Доп\. часы замстрой|Суточные)/) {
      $data->{$_->{'объект'}}{$_->{'значение'}} = $_;
    } else {
      $data->{$_->{'объект'}}{$_->{'дата'}} =  $_;
    }
  
  } @{ $self->dbh->selectall_arrayref($self->sth('значения за месяц', where=>$where, order_by=>"order by og.name"), {Slice=>{}}, @bind) };
  
  return $data;
}

sub данные_отчета_сотрудники_на_объектах {
  my ($self, $param) = @_; #
  #~ my @bind = (($param->{'общий список'} && 0) // ($param->{'объект'} && $param->{'объект'}{id})) x 2
  my $oid = $param->{'объект'} && $param->{'объект'}{id};
    
  my ($where, @bind) = $self->SqlAb->where({
    $param->{'общий список'} || !$oid ? () : (' og.id ' => $oid),
    ' t."значение" ' => { ' ~ ', '^\d+[.,]?\d*$'},
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
    $param->{'отключенные объекты'} ? (' og."disable" ' => !!$param->{'отключенные объекты'}) : (),
  });
  
  $self->dbh->selectall_arrayref($self->sth('сотрудники на объектах', where=>$where), {Slice=>{},}, @bind,);
}

sub квитки_начислено {
  my ($self, $param, $uid) = @_;
  
  my $oid = $param->{'объект'} && $param->{'объект'}{id};
    
  my ($where, @bind) = $self->SqlAb->where({
    $param->{'общий список'} || !$oid ? () : (' og.id ' => $oid),
    ' t."значение" ' => { ' ~ ', '^\d+[.,]?\d*$'},
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
    $param->{'отключенные объекты'} ? (' og."disable" ' => !!$param->{'отключенные объекты'}) : (),
  });
  
  $self->dbh->selectall_arrayref($self->sth('квитки начислено', select=>$param->{select} || '*', where=>$where), {Slice=>{},}, #join=>'табель/join', 
    @bind,
    #($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0, #<< для сводка за месяц/суммы
    #~ ($param->{'месяц'}) x 1, без двойников
    $uid
  );
};

sub квитки_расчет {
  my ($self, $param, $cb) = @_;
  
  my $oid = $param->{'объект'} && $param->{'объект'}{id};
    
  my ($where1, @bind1) = $self->SqlAb->where({# для табель/join
    #~ $param->{'общий список'} || !$oid ? () : (' og.id ' => $oid),
    ' t."значение" ' => { ' ~ ', '^\d+[.,]?\d*$'},
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
    #~ $param->{'отключенные объекты'} ? (' og."disable" ' => !!$param->{'отключенные объекты'}) : (),
  });
  
  my  ($where, @bind) = $self->SqlAb->where({# для всего запроса
    q| coalesce("РасчетЗП/флажок", '')  | => {'<>' => ''},
    defined $param->{'офис'} ? (q| array_to_string("объекты/name", ' ') | => {($param->{'офис'} ? ' ' : ' !').'~* ' => '\mофис'}) : (),
  });
  
  return $cb
    ? $self->dbh->pg->db->query($self->dict->render('квитки расчет', select=>$param->{select} || '*', where1=>$where1, where=>$where), @bind1, ($param->{'месяц'}) x 21, @bind, $cb)
    : $self->dbh->selectall_arrayref($self->sth('квитки расчет', select=>$param->{select} || '*', where1=>$where1, where=>$where), {Slice=>{},},
    #($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, (undef) x 2,
    @bind1,# для табель/join
    #~ $param->{'месяц'}, # двойников
    ($param->{'месяц'}) x 21,# параметры для сводка за месяц/общий список (+1 месяц)
    @bind,)
  ;
}

sub квитки_расчет_доп_расчеты {
  my ($self, $param, $cb) = @_;
  return $cb
    ? $self->dbh->pg->db->query($self->dict->render('доп расчеты ЗП'), $param->{'месяц'}, $cb)
    : $self->dbh->selectall_hashref($self->dict->render('доп расчеты ЗП'), 'pid', undef, $param->{'месяц'});
}

sub расчет_ЗП {# по профилю
  my ($self, $профиль, $дата) = @_; 
  
  $self->dbh->selectrow_hashref($self->dict->render('расчет ЗП'), undef, $профиль, $дата);
}

sub расчеты_выплаты {# по профилю и месяцу
  my ($self, $pid, $month, ) = (shift, shift, shift,);
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectall_arrayref($self->sth('расчеты выплаты', {$param->{Async} ? (Async=>1) : ()}, select=>$param->{select} || '*',), {Slice=>{}, $param->{Async} || $cb ? (Async=>1) : (),}, undef, $pid, $month, $cb // ());#
  $self->dbh->selectall_arrayref($self->dict->render('расчеты выплаты', select=>$param->{select} || '*', order_by=>"order by m.ts"), {Slice=>{}, $param->{Async} || $cb ? (Async=>1) : (),}, undef, $pid, $month, $cb // ());#
  #~ $self->app->pg->db->query($self->dict->render('расчеты выплаты', select=>$param->{select} || '*',), $pid, $month, $cb // ());#
  #~ $self->app->pg->db->query('select ?::json as foo', {json => {bar => 'baz'}}, $cb // ());
  
}

sub расчеты_выплаты_других_месяцев {# по профилю и не этому месяцу (закрытые месяцы)
  my ($self, $param, $cb) = @_; 
  #~ $self->dbh->selectall_arrayref($self->sth('расчеты выплаты не в этом месяце', $cb ? {Async=>1} : ()), {Slice=>{},$param->{Async} || $cb ? (Async=>1) : (),}, $pid, $month, $cb // ());
  $self->dbh->selectrow_hashref($self->dict->render('расчеты выплаты не в этом месяце', select=>' jsonb_agg(t order by t."дата" desc, t.id desc) '), undef, $param->{"профиль"}, $param->{"месяц"}, $cb // ());
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
  my $prev = $data->{id} && $self->dbh->selectrow_hashref($self->sth('расчеты выплаты'), undef, $data->{id}, undef, undef);
    #~ if $data->{id};
  
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

  #~ my @bind = (($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0, ($param->{'месяц'}) x 7,); #((undef) x 2, $param->{'месяц'}, ($param->{'отключенные объекты'}) x 2, ($param->{'месяц'}) x 2,);
  my $oid = $param->{'объект'} && $param->{'объект'}{id};
    
  my ($where, @bind) = $self->SqlAb->where({# для табель/join
    $param->{'общий список'} || !$oid ? () : (' og.id ' => $oid),
    ' t."значение" ' => { ' ~ ', '^\d+[.,]?\d*$'},
    ' "формат месяц2"(t."дата") ' => \[ ' = "формат месяц2"(?::date) ', $param->{'месяц'} ],
    $param->{'отключенные объекты'} ? (' og."disable" ' => !!$param->{'отключенные объекты'}) : (),
  });
  $self->dbh->selectall_arrayref($self->sth('сводка расчета ЗП', select=>$param->{select} || '*', where=>$where), {Slice=>{},}, 
    @bind,
    #~ $param->{'месяц'}, #без двойников
    ($param->{'месяц'}) x 20,
  );
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
  
  @{$self->dbh->selectall_arrayref($self->sth('чистка дублей табеля'), {Slice=>{},})}
    or return
    while (1);
}

1;


__DATA__
