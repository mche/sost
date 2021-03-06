package Model::TMC;
use Mojo::Base 'Model::Base';
use Util;

our $DATA = ['TMC.pm.dict.sql'];

#~ has sth_cached => 1;
#~ has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};
has model_transport => sub {shift->app->models->{'Transport'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сохранить_заявку {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  my $prev = ref $_[0] && shift;
  
  $prev ||= $self->позиция_заявки($data->{id})
    if ($data->{id});
  
  delete $data->{uid}
    if $prev && $prev->{uid};
  
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/заявки', ["id"], $data);
  
  my %ref = ();#
  map {# прямые связи
    my $id = $data->{"$_/id"} || $data->{$_};
    my $r = $self->связь( $id, $r->{id})
      if $id;
    $ref{"$r->{id1}:$r->{id2}"}++
      if $r;
  } qw(объект );#номенклатура привязывается снаб не здесь
  map {
    my $id1 = $prev->{"$_/id"};
    $self->связь_удалить(id1=>$id1, id2=>$r->{id})
      unless $ref{"$id1:$r->{id}"};
  }  qw(объект )#номенклатура привязывается снаб не здесь
    if $prev;

  #~ my $pos = $self->позиция_заявки($r->{id});
  #~ $self->app->log->error($self->app->dumper($pos));
  #~ return $pos;
  return $r;
}

sub сохранить_тмц {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  my $expr = ref $_[0] ? shift : {};
  
  my $prev = ref $_[0] && shift;
  $prev ||= $self->позиция_тмц($data->{id})
    if $data->{id};
  
  #~ delete $data->{uid}
    #~ if $prev && $prev->{uid};
  
  $data->{'цена'} = Util::money($data->{'цена'});
  
  my $bind = {map {($_=>$data->{$_})} grep {defined $data->{$_}} (qw(id uid количество наименование цена коммент количество/принято дата/принято принял списать), 'простая поставка')};
  my $r = $data->{id} ? $self->обновить($self->{template_vars}{schema}, "тмц", ["id"], $bind, $expr)
    : $self->вставить($self->{template_vars}{schema}, "тмц", ["id"], $bind, $expr);
  
  # связь с номен
  if (my $nom = $data->{"номенклатура"} || $data->{"номенклатура/id"}) {
    my $nid = ref $nom ? $nom->{id} : $nom;
    
    #~ $self->app->log->error($self->app->dumper([
    #~ $prev,
    $prev && $prev->{'номенклатура/id'} && $nid ne $prev->{'номенклатура/id'}
      ? $self->связь_обновить({id1=>$prev->{'номенклатура/id'}, id2=>$r->{id}}, {id1=>$nid}) #where set # сменилась номенклатура
      : $self->связь($nid, $r->{id})
    #~ ]))
    ;# новая
  }
  
  # связь с объектом
  if (my $obj = $data->{"объект"} || $data->{"объект/id"}) {
    my $oid = ref $obj ? $obj->{id} : $obj;
    $prev && $prev->{'тмц/объект/id'} &&  $obj ne $prev->{'тмц/объект/id'}
      ? $self->связь_обновить({id1=>$prev->{'тмц/объект/id'}, id2=>$r->{id}}, {id1=>$oid})#where set ## сменил
      : $self->связь($oid, $r->{id});# новая
  }
  
  # связь с заявкой
  if (my $zid = $data->{'тмц/заявка/id'} || $data->{'$тмц/заявка'} && $data->{'$тмц/заявка'}{id}) {
    $prev && $prev->{'тмц/заявка/id'} && $prev->{'тмц/заявка/id'} ne $zid
      ? $self->связь_обновить({id1=>$prev->{'тмц/заявка/id'}, id2=>$r->{id}}, {id1=>$zid})#where set #
      : $self->связь($zid, $r->{id});
  }
  
  # связь позиции перемещения с закупочной позицией
  if (my $zid = $data->{'тмц/закупка/id'}) {
    $prev && $prev->{'тмц/закупка/id'} && $prev->{'тмц/закупка/id'} ne $zid
      ? $self->связь_обновить({id1=>$prev->{'тмц/закупка/id'}, id2=>$r->{id}}, {id1=>$zid})#where set #
      : $self->связь($zid, $r->{id});
  }
  
  #~ return $self->позиция_тмц($r->{id});
  return $r;
}

sub сохранить_снаб {# обработка снабжения + перемещения сохраняются в транспортную заявку
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  my $tz_prev = ref $_[0] && shift;
  
  $tz_prev ||= $self->model_transport->позиция_заявки($data->{id}, {join_tmc=>1,})
    if $data->{id};
  return "Редактирование отклонено: транспорт везет тмц"
    if $tz_prev && $tz_prev->{'транспорт/id'};
  
  delete $data->{uid}
    if $tz_prev && $tz_prev->{uid};
  delete $data->{'снабженец'}
    if $tz_prev && $tz_prev->{'снабженец'};
  
  my $bind = {map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец", "без транспорта")};# "заказчики/id", "грузоотправители/id"
  my $r = $data->{id} ? $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $bind)
    : $self->вставить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $bind);
  
  # обработать связи
  my %ref = (); # кэш сохраненных связей
  $r->{"заказчики"}=undef;#[];
  $r->{"грузоотправители"}=undef;#[];
  $r->{"c объекта"}=undef;#[];
  $r->{"на объект"}=undef;#[];
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"заказчики"} ||= []}, $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } grep {$_} @{$data->{"заказчики/id"}}
    if $data->{"заказчики/id"};
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"грузоотправители"} ||= []}, $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } grep {$_} @{$data->{"грузоотправители/id"}}
    if $data->{"грузоотправители/id"};
  map {
    my $rr = $self->связь($_, $r->{id});
    $r->{"на объект"} = $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } ($data->{"на объект/id"},)
    if $data->{"на объект/id"};
  map {
    my $rr = $self->связь($_, $r->{id});
    $r->{"с объекта"} = $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } ($data->{"с объекта/id"},)
    if ($data->{"с объекта/id"});
  
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}, "заказчики"=>$r->{"заказчики"}, "грузоотправители"=>$r->{"грузоотправители"}, "на объект"=>$r->{'на объект'}, "с объекта"=>$r->{'с объекта'},});
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'@заказчики/id'}}
    if $tz_prev;
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'@грузоотправители/id'}}
    if $tz_prev;
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } grep {$_} ($tz_prev->{"с объекта/id"}, $tz_prev->{"на объект/id"},)
    if $tz_prev;
  #~ my $r = eval {$self->model_transport->сохранить_заявку(
    #~ (map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "заказчики/id", "грузоотправители/id", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец")),
  #~ )};
  #~ return $@
    #~ unless ref $r;
  
  my @pos = grep {$_->{id}} @{$data->{'$позиции'} || $data->{'@позиции тмц'}}
    or return "Нет позиций ТМЦ";
  
 
  map {# связать все позиции с одной транспортной заявкой
    my $r = $self->связь($_->{id}, $r->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } @pos; 
  
  map {
    #~ $self->связь_удалить(id1=>$_, id2=>$r->{id})
    $self->_удалить_строку('тмц', $_)
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'позиции тмц/id'}}
    if $tz_prev;
  
  #~ $self->app->log->error($self->app->dumper($r));
  #~ $r->{'позиции'} = $self->позиции_снаб($r->{id});

  #~ $self->model_transport->позиция_заявки($r->{id}, {join_tmc=>1,});
  return $r;
}

sub сохранить_инвентаризацию {
  my ($self)= (shift, shift);
  my $data = ref $_[0] ? shift : {@_};
  my $prev = ref $_[0] && shift;
  
  $prev ||= $self->позиция_инвентаризации($data->{id})
    if $data->{id};
    
  delete $data->{uid}
    if $prev && $prev->{uid};
  
  my $bind = {map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "коммент",)};
  my $r = $data->{id} ? $self->обновить($self->{template_vars}{schema}, "тмц/инвентаризации", ["id"], $bind)
    : $self->вставить($self->{template_vars}{schema}, "тмц/инвентаризации", ["id"], $bind);
  
  my %ref = (); # кэш сохраненных связей
  
  map {# связать с объектом
    $prev && $_ ne $prev->{'объект/id'}
      ? $self->связь_обновить({id1=>$prev->{'объект/id'}, id2=>$r->{id}}, {id1=>$_}) #where set #
      : $self->связь($_, $r->{id});
    
  } ($data->{'$объект'}{id}); #($data->{"объект/id"} || $data->{"объект"});
  

  map {# связать все позиции 
    my $r = $self->связь($r->{id}, $_->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } @{$data->{'@позиции тмц'} || die "Нет позиций ТМЦ"}; 
  
  map {
    #~ $self->связь_удалить(id1=>$r->{id}, id2=>$_)
    $self->_удалить_строку('тмц', $_)
      unless $ref{"$r->{id}:$_"};
  } @{$prev->{'@позиции тмц/id'}} if $prev;


  return $r;
  
}

sub сохранить_списание {# копипаста сохранить_инвентаризацию
  my ($self,)= (shift, );
  my $data = ref $_[0] ? shift : {@_};
  my $prev = ref $_[0] && shift;
  
  $prev ||= $self->позиция_списания($data->{id})
    if $data->{id};
    
  delete $data->{uid}
    if $prev && $prev->{uid};
  
  my $bind = {map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "коммент",)};
  my $r = $data->{id} ? $self->обновить($self->{template_vars}{schema}, "тмц/списания", ["id"], $bind)
    : $self->вставить($self->{template_vars}{schema}, "тмц/списания", ["id"], $bind);
  
  my %ref = (); # кэш сохраненных связей
  
  map {# связать с объектом
    $prev && $_ ne $prev->{'объект/id'}
      ? $self->связь_обновить({id1=>$prev->{'объект/id'}, id2=>$r->{id}}, {id1=>$_}) #where set #
      : $self->связь($_, $r->{id});
    
  } ($data->{'$объект'}{id}); #($data->{"объект/id"} || $data->{"объект"});
  

  map {# связать все позиции 
    my $r = $self->связь($r->{id}, $_->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } @{$data->{'@позиции тмц'} || die "Нет позиций ТМЦ"}; 
  
  map {
    #~ $self->связь_удалить(id1=>$r->{id}, id2=>$_)
    $self->_удалить_строку('тмц', $_)
      unless $ref{"$r->{id}:$_"};
  } @{$prev->{'@позиции тмц/id'}} if $prev;


  return $r;
  
}

sub сохранить_принятие_списания {# одна позиция
  my ($self, $data) = @_;
  $self->обновить($self->{template_vars}{schema}, "тмц", ["id"], {map {($_=>$data->{$_})} qw(id принял)}, {"дата/принято"=>'now()'});
}

sub сохранить_позицию_инвентаризации {# и позиции списания
  my ($self, $data, $prev) = @_; 
    
  #~ my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "тмц/инвентаризации", ["id"], {map {($_=>$data->{"тмц/инвентаризация/$_"})} grep {defined $data->{"тмц/инвентаризация/$_"}} qw(id uid дата1 коммент)});
  #~ $self->связь($data->{'тмц/инвентаризация/объект/id'}, $r->{id});
  
  grep {defined $data->{$_} || return "Не указано [$_]"} qw( количество );#цена дата1
  
  $data->{'номенклатура'} = $self->model_nomen->сохранить_номенклатуру($data->{nomen} || $data->{Nomen})->{id}
    or return "Ошибка сохранения номенклатуры";
  
  $prev ||= $self->позиция_тмц($data->{id})#инвентаризация_позиция_строка($data->{id})
      if $data->{id};
    
  delete @$data{(qw(ts количество/принято дата/принято принял списать объект), 'простая поставка')};
    #~ delete $data->{uid};
      #~ unless $prev &&  $prev->{uid};
  my $expr = {};
  my $pos  = $self->сохранить_тмц($data, $expr, $prev)
    or $self->app->log->error($self->app->dumper($data))
    and return "не сохранилась строка ТМЦ";
    
  #~ $pos = $self->позиция_тмц($pos->{id}); # надо обновить
  
  #~ $self->связь($r->{id}, $pos->{id});
  
  #~ $pos->{'тмц/инвентаризация/id'} = $r->{id};
  

  #~ $self->model_nomen->удалить_концы();
  return $pos;
}
 
sub удалить_снаб {
  my ($self, $data, $prev) = @_; 
  
  $prev ||= $self->model_transport->позиция_заявки($data->{id}, {join_tmc=>1,})
    or return "Нет записи для удаления"
    if $data->{id};

#~ $self->app->log->error($self->app->dumper($r));
  
  my $rc = $self->_удалить_строку('транспорт/заявки', $data->{id});
  $self->_удалить_строку('тмц', $_)
    for @{ $prev->{'позиции тмц/id'} || []};
  return $rc;
}

sub удалить_инвентаризацию {
  my ($self, $data, $prev) = @_; 
  
  $prev ||= $self->позиция_инвентаризации($data->{id})
    || return "нет инвентаризации id=$data->{id}"
    if $data->{id};
  
  #~ $self->app->log->error($self->app->dumper($r));
  
  my $rc = $self->_удалить_строку('тмц/инвентаризации', $data->{id});
  $self->_удалить_строку('тмц', $_)
    for @{ $prev->{'@позиции тмц/id'} || []};
  return $rc;
}

sub удалить_списание {
  my ($self, $data, $prev) = @_; 
  
  $prev ||= $self->позиция_списания($data->{id})
    || return "нет списания id=$data->{id}"
    if $data->{id};
  
  #~ $self->app->log->error($self->app->dumper($r));
  
  my $rc = $self->_удалить_строку('тмц/списания', $data->{id});
  $self->_удалить_строку('тмц', $_)
    for @{ $prev->{'@позиции тмц/id'} || []};
  return $rc;
}

sub позиция_заявки {
  my ($self, $id) = @_; #
  
   my ($where1, @bind) = $self->SqlAb->where({#основное тело запроса
     " m.id "=>$id,
   });
  
  my $sth = $self->sth('заявки/список или позиция', where1=>$where1,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);
  
}

sub позиция_тмц {
  my ($self, $id) = @_; #
  
  my ($where, @bind) = $self->SqlAb->where({
    " id "=> $id,
  });
  
  my $sth = $self->sth('тмц/список или позиция', where=>$where,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);# (undef) x 2
  
}

sub позиция_инвентаризации {
  my ($self, $id,) = (shift, shift); #
  my $param = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    " id "=> $id,
  });
  
  my $sth = $self->sth('инвентаризация/список или позиция', select=>$param->{select} || '*',  join_tmc=>$param->{join_tmc} // 1, where=>$where,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);
  
}

sub позиция_списания {
  my ($self, $id,) = (shift, shift); #
  my $param = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    " id "=> $id,
  });
  
  my $sth = $self->sth('списания/список или позиция', select=>$param->{select} || '*',  join_tmc=>$param->{join_tmc} // 1, where=>$where,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);
  
}
#~ sub позиции_снаб {
  #~ my ($self, $id) = @_; # id - трансп заявка
  
  #~ my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{}}, (undef) x 2, (undef) x 2, ([$id]) x 2,);
  
#~ }

my %type = ("дата1"=>'date',"дата отгрузки"=>'date', "наименование"=>'text');
sub список_заявок {
  my ($self, $param, @bind) = @_;
  my $oid = (ref $param->{объект} ? $param->{объект}{id} : $param->{объект})
    // die "какой объект (или все=0)";

  
  my $cb = ref $bind[-1] eq 'CODE' && pop @bind;
  
  push @bind, @{$param->{bind}}
    if $param->{bind};
    
  my $where = $param->{where} || "";

  my ($where1, @bind1) = $self->SqlAb->where({#основное тело запроса
    $oid ? (" o.id " => $oid) : (),
    $param->{'транспорт/заявки/id'} ? (' tmc."транспорт/заявки/id" '=>{'&& ?::int[]'=>\['', ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}]]}) : (),
  });
  #~ my @bind = (($oid) x 2, (undef) x 2, ( && (ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}])) x 2,);
  push @bind, @bind1;
  
  while (my ($key, $value) = each %{$param->{filter} || {}}) {
    next
      unless ref($value) && ($value->{ready} || $value->{_ready}) ;
    
    if ($value->{id}) {
      $where .= ($where ? " and " :  "where ").qq| "$key/id"=? |;
      push @bind, $value->{id};
      next;
    } elsif ($value->{expr}){
      $where .= ($where ? " and " :  "where ").qq| $value->{expr} |;
      push @bind, ref $value->{bind} ? @{$value->{bind}} : ($value->{bind})
        if $value->{bind};
      next;
    } elsif ($value->{values} ) {
      my @values = @{$value->{values} || []};
      next
        unless @values;
      
      $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
      push @bind, map {s/,/./g; s/[^\d\-\.]//gr;}  @values;
    }  elsif ($type{$key} eq 'text') {
      $where .= ($where ? " and " :  "where ").qq| "$key" ~* ? |;
      push @bind, $value->{title};
      
    }
  }
  
  #~ my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} // 100) . " OFFSET " . ($param->{offset} // 0);
  push @bind, $param->{limit} || (), $param->{offset} || ();
  
  my $sql = $self->dict->render('заявки/список или позиция', select=>$param->{select} || '*', tmc=>$param->{'тмц'}, where1=>$where1, where=>$where,  order_by=>$param->{order_by} || $param->{'order by'} || '', limit=>!!$param->{limit}, offset=>!!$param->{offset});#limit_offset=>$limit_offset,
  #~ $sth->trace(1);
  push @bind, $param->{async}
    if $param->{async} && ref $param->{async} eq 'CODE';
  #~ $self->app->log->error($self->app->dumper(\@bind), );
      #~ $self->app->log->error($self->app->dumper($param));
  push @bind, $cb
    if $cb;
  my $r = $self->dbh->selectall_arrayref($sql, {Slice=>{}}, @bind);
  
}

sub удалить_заявку {
  my ($self, $id) = @_;
  #~ my $r = $self->_delete($self->{template_vars}{schema}, 'тмц/заявки', ["id"], {id=>$id});#
  #~ $self->связи_удалить(id2=>$r->{id});
  return $self->_удалить_строку('тмц/заявки', $id);
  #~ return $r;
  
};

=pod
/*** поиск объекта в адресе (потом может пригодится)
and exists ( --- объект-куда
  select id
  from (----- развернуть два уровня jsonb-массива "куда"
    select jsonb_array_elements(jsonb_array_elements("куда"))::text as ob, id
    from "транспорт/заявки"
    where id=t.id
  ) ob
  where ob.ob=\?::text
)***/

=cut

sub список_снаб {#обработанные позиции(трансп заявки)
  my ($self, $param, $cb) = @_;
  my $filter = $param->{filter} || {};
  my $id = $param->{id} || $filter->{id};# одна позиция
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта"
    unless $id;
  
  my ($where, @bind) = $self->SqlAb->where({
    $oid ? (' ?::int ' => \[ ' = any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id") ', $oid ]) : (),
    $id ? ( ' "id" ' => $id ) : (),
  });

  #~ $param->{where} = <<END_SQL;#' and jsonb_array_elements(jsonb_array_elements("куда"))::text=?::text'
#~ where (coalesce(?::int, 0)=0 or ?::int=any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id"))
#~ @{[ $param->{where}  || '']}
#~ END_SQL
  #~ unshift @{ $param->{bind} ||=[] }, ($oid) x 2; #qq|"#$oid"|
  $param->{where} = $where;
  unshift @{ $param->{bind} ||=[] }, @bind;
    #~ if $oid;
  $param->{join_tmc} = 1;
  $param->{order_by} = ' order by "дата1" desc, id desc ';
  #~ $param->{select} = ' jsonb_agg(t)';
  $self->model_transport->список_заявок($param, $cb);
}

sub список_инвентаризаций {#
  my ($self, $param, $cb) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  
  my $filter = $param->{filter} || {};
  #~ my $where_tmc = $param->{where_tmc} || '';
  my $id = $param->{id} || $filter->{id};# одна позиция
  my $date1 = $filter->{'дата1'} && $filter->{'дата1'}{ready} && $filter->{'дата1'}{values};
  
  my ($where, @bind) = $self->SqlAb->where({#основное тело запроса
    $oid ? (' "объект/id" ' => $oid) : (),
    $id ? ( ' "id" ' => $id ) : (),
    $date1 ? ( ' "дата1" ' => { -between => $date1 },) : (),
  });
  
  my $nomen = $filter->{'тмц/номенклатура'};
  my ($where_tmc, @bind_tmc) = $self->SqlAb->where({#строки тмц
    $nomen && $nomen->{ready} ? (' '=>\[q{EXISTS ( select np.id from "номенклатура/родители"(n.id) np where  ((case when np.parents_id = array[null]::int[] then array[]::int[] else np.parents_id end | np.id) @@ ?::query_int)::boolean ) } => ($nomen->{id})]) : (),
  });
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} // 0);
  
  $self->dbh->selectall_arrayref($self->sth('инвентаризация/список или позиция', select=>$param->{select} || '*', join_tmc=> 1, where=>$where, where_tmc => $where_tmc, limit_offset=>$limit_offset, order_by=>$param->{order_by} || $param->{'order by'} || ''), {Slice=>{}}, @bind_tmc, @bind, $cb // ());
  
}

sub список_списаний {#
  my ($self, $param, $cb) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";

  my $filter = $param->{filter} || {};
  #~ my $where_tmc = $param->{where_tmc} || '';
  my $id = $param->{id} || $filter->{id};# одна позиция
  my $date1 = $filter->{'дата1'} && $filter->{'дата1'}{ready} && $filter->{'дата1'}{values};
  
  my ($where, @bind) = $self->SqlAb->where({#основное тело запроса
    $oid ? (' "объект/id" ' => $oid) : (),
    $id ? ( ' "id" ' => $id ) : (),
    $date1 ? ( ' "дата1" ' => { -between => $date1 },) : (),
  });
  
  my $nomen = $filter->{'тмц/номенклатура'};
  my ($where_tmc, @bind_tmc) = $self->SqlAb->where({#строки тмц
    $nomen && $nomen->{ready} ? (' '=>\[q{EXISTS ( select np.id from "номенклатура/родители"(n.id) np where ((case when np.parents_id = array[null]::int[] then array[]::int[] else np.parents_id end | np.id) @@ ?::query_int)::boolean ) } => ($nomen->{id})]) : (),
  });
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} // 0);
  
  $self->dbh->selectall_arrayref($self->sth('списания/список или позиция', select=>$param->{select} || '*', join_tmc=>$param->{join_tmc} // 1, where=>$where, where_tmc => $where_tmc, limit_offset=>$limit_offset, order_by=>$param->{order_by} || $param->{'order by'} || ''), {Slice=>{}}, @bind_tmc, @bind, $cb // ());
  
}

#~ sub адреса_отгрузки {
  #~ my ($self, $id) = @_;
  #~ $self->dbh->selectcol_arrayref($self->sth('адреса отгрузки'), undef, $id);
#~ };

=pod
sub заявки_с_транспортом {
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  #~ $param->{where} = ' where  ?::int=any("позиции тмц/объекты/id"|| "базы/id") /*and "позиции тмц/id" is not null*/ and "транспорт/id" is not null ';
  $param->{where} = ' where ?::int=any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id") ';
  #~ $param->{where_tmc} = ' and (o1.id=? or o2.id=? or o.id=?) ';
  push @{ $param->{bind} ||=[] }, ($oid) x 1;
  $param->{join_tmc} = 1;
  $param->{join_transport} = '';
  $param->{order_by} = '';
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
}

sub заявки_перемещение {# без транспорта
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  $param->{where} = ' where ("с объекта/id"=?::int or "на объект/id"=?::int) /*and "позиции тмц/id" is not null*/ and "транспорт/id" is null ';
  push @{ $param->{bind} ||=[] }, ($oid) x 2;
  $param->{join_tmc} = 1;
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
  
}
=cut

sub текущие_остатки {# массив ИД  объектов
  my ($self, $uid, $oids, $param) = @_;
  #~ my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект});
  my @bind = (undef, $uid, $oids, undef);
  push @bind, $param->{async}
    if $param && $param->{async} && ref $param->{async} eq 'CODE';
  my $r = $self->dbh->selectall_arrayref($self->sth('текущие остатки', select=>$param->{select} || '*',), {Slice=>{}}, @bind);
  
}

sub движение_тмц {
  my ($self, $param) = @_;
  my $oid = $param->{'объект/id'} eq 0 ? undef : [$param->{'объект/id'}];
  my ($where1, @bind1) = $self->SqlAb->where({
     $param->{'объект/id'} ? (' "объект/id" ' => $param->{'объект/id'}) : (),
     $param->{'номенклатура/id'} ? (' "номенклатура/id" ' => $param->{'номенклатура/id'}) : (),
     ' d."движение" ' => {'!=', 'списание'},
  });
  unshift @bind1, $param->{uid}, $oid;# доступ к объектам
  
  my ($where2, @bind2) = $self->SqlAb->where({
     $param->{'объект/id'} ? (' o.id ' => $param->{'объект/id'}) : (),
     $param->{'номенклатура/id'} ? (' "номенклатура/id" ' => $param->{'номенклатура/id'}) : (),
  });
  unshift @bind2, $param->{uid}, $oid;# доступ к объектам
  
  $self->dbh->selectall_arrayref($self->sth('движение', select=>$param->{select} || '*', where_d=>$where1, where_inv=>$where2), {Slice=>{}},  @bind1, @bind2);
}

#~ sub удалить_перемещение {
  #~ my ($self, $id) = @_;
  #~ my $r = $self->_delete($self->{template_vars}{schema}, 'транспорт/заявки', ["id"], {id=>$id});
  #~ $self->связи_удалить(id1=>$r->{id}, id2=>$r->{id});
  #~ return $r;
#~ }

sub номенклатура_заявки {#обработка снаб
  my ($self, $zid) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    'id'=>$zid,
  });
  $self->dbh->selectrow_hashref($self->sth('тмц/заявки/номенклатура', where=>$where), undef, @bind);
}

sub сохранить_номенклатуру_заявки {
  my ($self, $data) = @_;
    # сохряняется связь, нужно проверить что это заявка ТМЦ и номенклатура
  my $z = $self->номенклатура_заявки($data->{'тмц/заявка/id'})
    or return "нет такой заявки";
  
  return $self->_delete($self->{template_vars}{schema}, "refs", ["id"], {"id"=> $z->{'тмц/заявка/номенклатура/refs/id'}})
    unless ($data->{'номенклатура/id'});
  
  my $n = $self->_select($self->{template_vars}{schema}, "номенклатура", ["id"], {"id"=>$data->{'номенклатура/id'}})
    or return "нет такой номенклатуры";
  
  if ($z->{'тмц/заявка/номенклатура/refs/id'}) {# уже связь
     $self->_update($self->{template_vars}{schema}, "refs", {"id"=>$z->{'тмц/заявка/номенклатура/refs/id'},}, {"id1"=>$n->{id}, })#"id2"=>$z->{id}
  } else {
    $self->_insert($self->{template_vars}{schema}, "refs", ["id"], {"id1"=>$n->{id}, "id2"=>$z->{id}});
  }
  
  return $self->номенклатура_заявки($data->{'тмц/заявка/id'});
}

sub сохранить_номенклатуру_закупки {
  my ($self, $data) = @_;
  my $n = $self->model_nomen->сохранить_номенклатуру($data->{nomen});#удалит если не указать $data->{'номенклатура/id'}
  return $n
    unless ref $n;
  
  my $rr = $self->связь_получить("номенклатура", $data->{id});
  if ($rr->[0]) {
    $self->связь_обновить($rr->[0]{id}, $n->{id});
  } else {
    $self->связь($n->{id}, $data->{id});
  }
  $self->model_nomen->удалить_концы();
  return $n;
}

sub сохранить_запрос_резерва_остатка {
  my ($self, $data) = @_;
  
  return $self->_удалить_строку('тмц/резерв', $data->{id})
    if $data->{id};
  
  my $r = $self->сохранить_номенклатуру_заявки($data);
  
  return $r unless ref $r;
  
  $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/резерв', ["id"], {"id"=>$data->{id}, "запросил"=>$data->{uid}, "количество"=>$data->{'тмц/заявка/количество'} > $data->{'остаток'} ? $data->{'остаток'} : $data->{'тмц/заявка/количество'}});
  
  $r->{'связь: тмц/заявка -> тмц/резерв'} = $self->связь($data->{'тмц/заявка/id'}, $r->{id});
  $r->{'связь: объект -> тмц/резерв'} = $self->связь($data->{'объект/id'}, $r->{id});
  
  return $r;
  
}

sub сохранить_резерв_остатка {
  my ($self, $data) = @_;
  
  my $r = $self->обновить($self->{template_vars}{schema}, 'тмц/резерв', ["id"], {"id"=>$data->{id}, "резервировал"=>$data->{'резервировал'}, "количество/резерв"=>$data->{'крыжик'}{val} ? $data->{'количество/резерв'} : undef, "коммент/резерв" => $data->{'коммент/резерв'}}, {'ts/резерв'=>'now()'});
}

sub позиция_заявки_резервы_остатков {
  my ($self, $id) = @_; # ид тмц/заявки
  my ($where, @bind) = $self->SqlAb->where({
    'm.id'=>$id,
  });
  $self->dbh->selectrow_hashref($self->sth('тмц/резервы остатков', where=>$where), undef, @bind);
}

sub инвентаризация_позиция_строка {
  my ($self, $id) = @_; # ид тмц
  my ($where, @bind) = $self->SqlAb->where({
    't.id'=>$id,
  });
  $self->dbh->selectrow_hashref($self->sth('тмц/инвентаризация/позиции-строки', where=>$where, order_by=>"order by t.id"), undef, @bind);
  
}

sub приходы_тмц {
  my ($self, $param) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    #~ ' "дата" ' => { -between => \["(now()-interval ?) AND now()", '1 month'] },#$param->{'за период'}
    $param->{'объект'} && $param->{'объект'}{id} ? (' "объект/id" ' => $param->{'объект'}{id}) : (),
  });
  unshift @bind, ('14 days') x 3;
  $self->dbh->selectall_hashref($self->sth('приходы тмц', SELECT0000=>'row_to_json(t)', scalar @bind ? (WHERE=>$where) : ()), 'nid', undef, @bind);
}

sub закрыть_заявку {
  my ($self, $data) = @_;
  return "Нет ИД заявки"
    unless $data->{id};
  $self->обновить($self->{template_vars}{schema}, "тмц/заявки", ["id"], {map {($_=>$data->{$_})} qw(id закрыл)});
}

sub накладная_docx {
  my ($self, $id) = @_;
  
  my $JSON = $self->app->json;
  my $model_ka = $self->app->models->{'Контрагенты'};
  
  my $r =  $self->model_transport->позиция_заявки($id, {join_tmc=>1, select_top_tmc=>' "транспорт/заявка/id", "позиции тмц/объекты/id"[1] as "позиции тмц/на первый объект/id", jsonb_agg(main) as pos, count(*) as len ',
    group_by_top_tmc => ' group by "транспорт/заявка/id",  "позиции тмц/объекты/id"[1] ',
    select_tmc=><<END_SQL
  "транспорт/заявка/id",
  t."номенклатура"[1] as "номенклатура/топ-группа",
  count(*) as len,
  array_agg(t.id order by t."номенклатура") as "позиции тмц/id",
  jsonb_agg(t order by t."номенклатура") as "\@позиции тмц",
  array_agg("объект/id" order by t."номенклатура") as "позиции тмц/объекты/id"
END_SQL
  , group_by_tmc=>'group by "транспорт/заявка/id", t."номенклатура"[1] '})
    or return "Позиция не найдена";

  #~ $self->app->log->error>($self->app->dumper($r));
  
  $r->{docx_out_file} = "static/tmp/накладная-$id.docx";
  
  $r->{python} = $self->dict->{'накладная.docx'}->render(
    docx_template_file=>"static/тмц-накладная.template.docx",
    docx_out_file=>$r->{docx_out_file},
    date=>$r->{'$дата1/json'}, #$JSON->decode(),
    profile=>$r->{'$снабженец/json'}, #$JSON->decode(),
    num=>$id,
    from=> $r->{'с объекта/id'} ? $self->model_obj->объекты_проекты($r->{'с объекта/id'})->[0] : $r->{'@грузоотправители/id'} && $r->{'@грузоотправители/id'}[0] ? $model_ka->позиция($r->{'@грузоотправители/id'}[0]) : {'title'=>'нет грузоотправителя?'},
    to=>$self->model_obj->объекты_проекты($r->{'на объект/id'} || $r->{'позиции тмц/на первый объект/id'})->[0] || {name=>'куда? ошибка'}, # ,
    pos=>$r->{pos},#{'@позиции тмц/json'},#$JSON->encode(
    len=>$r->{len},
    model=>$self,
  );
  
  return $r;#для отладки - коммент линию
}

sub остатки_docx {#по одному объекту на дату
  my ($self, $param) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    #~ ' o."объект/id" '=>$param->{'объект/id'},
    $param->{'номенклатура/id'} ? (' ?::int = any(nom.parents_id) ' => { '' => \['', $param->{'номенклатура/id'}] },) : (),
    ' o."остаток" ' => { ' != ', 0 },
    
  });
  unshift @bind, 
    $param->{'дата'}, $param->{uid}, [$param->{'объект/id'}], $param->{'дата'};
  push @bind,
    $param->{'дата'}, $param->{'объект/id'}; 
  my $data = $self->dbh->selectrow_hashref($self->sth('остатки на дату', # там рендер ''текущие остатки',
      #~ select => q| "объект/id",  "номенклатура", "остаток" |,#"номенклатура/id", array_to_string("номенклатура", ' 〉') as 
      join => {$param->{'номенклатура/id'} ? ('номенклатура'=>1) : (),},
      where => $where,
      #~ order_by=>' ORDER BY 3 '
    ), undef, @bind);#{Slice=>{}}
  
  return 'Нет остатков или нет доступа по объекту'
    unless ref $data && $data->{val};
  #~ return $data;
  #~ $self->app->log->error($self->app->dumper($data));
  
  # для списаний
  ($where, @bind) = $self->SqlAb->where({
    ' o.id '=>$param->{'объект/id'},
    ' m."дата1" ' => { -between => \[" ?::date - interval '1 month' AND ?::date ", ($param->{'дата'}) x 2] },
    $param->{'номенклатура/id'} ? (' ?::int = any(nom.parents_id) ' => { '' => \['', $param->{'номенклатура/id'}] },) : (),
  });
  push @bind, $param->{'дата'};
  my $spis = $self->dbh->selectrow_hashref($self->sth('списания/список тмц', where=>$where), undef, @bind);
  #~ $self->app->log->error($self->app->dumper($spis));
  
  my $r = {};
  
  #~ $self->app->log->error($self->app->dumper($r->{'@позиции тмц'}));#
  my $obj = substr($data->{'объект'}, 0, 150);
  $r->{docx_file_name} = $param->{docx_file_name} || "остатки $obj на $data->{'дата'}.docx";
  $r->{docx_out_file} = $param->{docx_out_file} || "static/tmp/$r->{docx_file_name}";
  
  my $JSON = $self->app->json;
  $r->{python} = $self->dict->{'остатки на дату.docx'}->render(
    docx_template_file=>"static/тмц остатки.template.docx",
    docx_out_file=>$r->{docx_out_file},
    date=>$data->{'дата/json'},
    ts=>$data->{ts},
    object=>$data->{'объект/json'},
    profile=>join(' ', @{$param->{auth_user}{names}}),#$r->{'$снабженец/json'}
    num=>$data->{id},
    #~ from=> $r->{'с объекта/id'} ? $self->model_obj->объекты_проекты($r->{'с объекта/id'})->[0] : $r->{'@грузоотправители/id'} && $r->{'@грузоотправители/id'}[0] ? $model_ka->позиция($r->{'@грузоотправители/id'}[0]) : {'title'=>'нет грузоотправителя?'},
    #~ to=>$r->{'на объект/id'} ? $self->model_obj->объекты_проекты($r->{'на объект/id'})->[0] : $to_obj, # $r->{'@позиции тмц'}[0]{'объект'},
    pos=>$data->{val},#$JSON->encode($r->{'@позиции тмц'}),#
    len_pos=>10,#$data->{len},
    spis_pos => $spis->{val},
    len_spis_pos => $spis->{len},
    date0 => $spis->{'дата/json'},
    model=>$self,
  );
  
  return $r;#для отладки - коммент линию
}

1;

__DATA__
