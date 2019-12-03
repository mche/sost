package Model::Chem;
use Mojo::Base 'Model::Base';

our $DATA = ['Chem.pm.dict.sql'];

has "схема"=>'химия';

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  $self->dbh->do($self->sth('схема'));
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub номенклатура {# справочник
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{title} ? (' title ' => $param->{title}) : (),
    $param->{parent_title} ? (' "parents_title"[1] '=>$param->{parent_title}) : (),
    $param->{parent_id} ? (' "parents_id"[1] '=>$param->{parent_id}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('номенклатура', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
}

sub сохранить_сырье {
  my ($self, $data, $prev) = @_;
  $prev ||= $self->поступление_сырья(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->схема, 'сырье', ["id"], $data);
  #~ $self->app->log->error($self->app->dumper($data));

  $prev && $prev->{'номенклатура/id'} ne $data->{'номенклатура/id'}
    ? $self->_update($self->схема, 'связи', {"id1"=>$prev->{'номенклатура/id'}, "id2"=> $r->{id},}, {"id1"=>$data->{'номенклатура/id'}})
    : $self->получить_или_вставить($self->схема, 'связи', ["id1", "id2"], {"id1"=>$data->{'номенклатура/id'}, "id2"=> $r->{id},});
  $self->поступление_сырья(id=>$r->{id})->[0];
}

sub сохранить_номенклатуру {
  my ($self, $data, $prev) = @_;
  $prev ||= $self->номенклатура(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->dbh->selectrow_hashref($self->sth('проверить номенклатуру'), undef, ($data->{parent_id}, $data->{title}))
      || $self->вставить_или_обновить($self->схема, 'номенклатура', ["id"], $data);
  if ($prev && $prev->{parents_id} && $prev->{parents_id}[0]) {# связь с родителем или обновить или удалить
    my $ref = $self->_select($self->схема, 'связи', {"id1"=>$prev->{parents_id}[0], "id2"=>$data->{id}});
    $self->_update($self->схема, 'связи', {"id"=>$ref->{id}}, {"id1"=> $data->{parent_id},})
      if $data->{parent_id} && $ref->{id1} ne $data->{parent_id};
    $self->_delete($self->схема, 'связи', ["id"], {"id"=>$ref->{id}})
      if !$data->{parent_id};
  } elsif ($data->{parent_id}) {#insert
    $self->вставить_или_обновить($self->схема, 'связи', ["id1", "id2"],  {"id1" => $data->{parent_id}, "id2"=>$r->{id}, });
  }
  $self->номенклатура(id=>$r->{id})->[0];
}

sub поступление_сырья {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' s.id ' => $param->{id}) : (),
    $param->{"дата"} ? (' s."дата" ' => $param->{"дата"}) : (),
    $param->{where} ? %{$param->{where}} : (),
  });
  
  $self->dbh->selectall_arrayref($self->sth('поступление сырья', select=>$param->{select}, where=>$where, order_by=>$param->{order_by}), {Slice=>{}}, @bind);
}

sub сырье_остатки {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where1, @bind1) = $self->SqlAb->where({
    #~ $param->{id} ? (' id ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    $param->{'дата'} ? (q| "дата" | => \[ q| <= coalesce(?::date, now()::date) |, $param->{'дата'},]) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('остатки сырья', select=>$param->{select}, where=>$param->{where}, where1=>$where1, order_by=>$param->{order_by}), {Slice=>{}}, $param->{bind} || (), @bind1);
}

sub производство_продукции {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' p.id ' => $param->{id}) : (),
    $param->{"дата"} ? (' p."дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('производство продукции', select=>$param->{select}, where=>$where, order_by=>$param->{order_by}), {Slice=>{}}, @bind);
}

sub сохранить_сырье_производство {# позиция расхода
  my ($self, $data, $prev) = @_;
  $prev ||= $self->позиции_сырья_в_продукции(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->схема, 'продукция/сырье', ["id"], $data);
  
  #~ $self->app->log->error($self->app->dumper($r));
  
  if ($prev && $data->{'сырье/id'}) {
    my $ref = $self->_select($self->схема, 'связи', {"id1"=>$prev->{'сырье/id'}, "id2"=>$r->{id}});#$data->{'сырье/id'}
    $self->_update($self->схема, 'связи', {"id"=>$ref->{id}}, {"id1"=> $data->{'сырье/id'},})
      if $ref->{id1} ne $data->{'сырье/id'};
  } elsif ($data->{'сырье/id'}) {#insert
    my $ref = $self->вставить_или_обновить($self->схема, 'связи', ["id1", "id2"],  {"id1" => $data->{'сырье/id'}, "id2"=>$r->{id}, });
    #~ $self->app->log->error($self->app->dumper($ref));
  }
  return $self->позиции_сырья_в_продукции(id=>$r->{id})->[0];
}

sub позиции_сырья_в_продукции {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('позиции сырья в продукции', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
}

sub сохранить_продукцию {
  my ($self, $data, $prev) = @_;
  $prev ||= $self->производство_продукции(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->схема, 'продукция', ["id"], $data);
  
  $prev && $prev->{'номенклатура/id'} ne $data->{'номенклатура/id'}
    ? $self->_update($self->схема, 'связи',  {"id1"=>$prev->{'номенклатура/id'}, "id2"=> $r->{id},}, {"id1"=>$data->{'номенклатура/id'}})
    : $self->получить_или_вставить($self->схема, 'связи', ["id1", "id2"], {"id1"=>$data->{'номенклатура/id'}, "id2"=> $r->{id},});
  my %refs = ();
  map {
    my $stock_id = $_->{id};
    my $ref = $self->получить_или_вставить($self->схема, 'связи', ["id1", "id2"], {"id1" => $r->{id}, "id2" => $stock_id,});
    $refs{"$ref->{id1}:$ref->{id2}"}++;
  } @{ $data->{'@продукция/сырье'} || [] };
  #~ $self->app->log->error($self->app->dumper($prev->{'@продукция/сырье/id'}, \%refs))
    #~ if $prev;
  map {
    #~ $self->_delete($self->схема, 'связи', ["id1", "id2"], {"id1"=>$r->{id}, "id2"=>$_})
    $self->_удалить_строку("продукция/сырье", $_, "связи", $self->схема)
      unless $refs{"$r->{id}:$_"};
  } @{ $prev->{'@продукция/сырье/id'} || [] }
    if $prev;
  
  return $self->производство_продукции(id=>$r->{id})->[0];
}

sub почистить_номенклатуру {
  my ($self, $uid) = @_;
  1 while push my @r, @{$self->dbh->selectrow_array($self->sth('почистить номенклатуру'), undef, ($uid || $self->uid))};
  return \@r;
}

sub контрагенты {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{'чистый заголовок'} ? (q|"чистый контрагент"(title)| => \[ q| = "чистый контрагент"(?::text)|, $param->{'чистый заголовок'},]) : (),
  });
  
  $self->dbh->selectall_arrayref($self->sth('контрагенты', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
  
}


sub сохранить_контрагент {
  my ($self, $data) = @_;
  ($data->{id} && $self->контрагенты(id=>$data->{id})->[0])
  || $self->контрагенты('чистый заголовок'=>$data->{title})->[0]
  || $self->вставить_или_обновить($self->схема, "контрагенты", ["id"], $data);
  
}

sub продукция_остатки {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where1, @bind1) = $self->SqlAb->where({
    #~ $param->{id} ? (' id ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    $param->{'дата'} ? (q| "дата" | => \[ q| <= coalesce(?::date, now()::date) |, $param->{'дата'},]) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('остатки продукции', select=>$param->{select}, where=>$param->{where}, where1=>$where1, order_by=>$param->{order_by}), {Slice=>{}}, $param->{bind} || (), @bind1);
}

sub отгрузки {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('отгрузки', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
}

sub отгрузка_сводка {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    #~ $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{"дата"} ? (' ot."дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('сводка отгрузок', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
  
  
}

sub сохранить_позицию_отгрузки {# позиция
  my ($self, $data, $prev) = @_;
  $prev ||= $self->позиции_в_отгрузке(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->схема, 'отгрузка/позиции', ["id"], $data);
  
  #~ $self->app->log->error($self->app->dumper($r));
  
  if ($prev && $data->{'продукция или сырье/id'}) {
    my $ref = $self->_select($self->схема, 'связи', {"id1"=>$prev->{'продукция или сырье/id'}, "id2"=>$r->{id}});
    $self->_update($self->схема, 'связи', {"id"=>$ref->{id}}, {"id1"=> $data->{'продукция или сырье/id'},})
      if $ref->{id1} ne $data->{'продукция или сырье/id'};
  } elsif ($data->{'продукция или сырье/id'}) {#insert
    my $ref = $self->вставить_или_обновить($self->схема, 'связи', ["id1", "id2"],  {"id1" => $data->{'продукция или сырье/id'}, "id2"=>$r->{id}, });
  }
  return $self->позиции_в_отгрузке(id=>$r->{id})->[0];
}

sub позиции_в_отгрузке {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('позиции в отгрузке', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
}

sub сохранить_отгрузку {
  my ($self, $data, $prev) = @_;
  $prev ||= $self->отгрузки(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->схема, 'отгрузка', ["id"], $data);
  
  $prev && $prev->{'контрагент/id'} ne $data->{'контрагент/id'}
    ? $self->_update($self->схема, 'связи',  {"id1"=>$prev->{'контрагент/id'}, "id2"=> $r->{id},}, {"id1"=>$data->{'контрагент/id'}})
    : $self->получить_или_вставить($self->схема, 'связи', ["id1", "id2"], {"id1"=>$data->{'контрагент/id'}, "id2"=> $r->{id},});
  my %refs = ();
  map {
    my $id = $_->{id};
    my $ref = $self->получить_или_вставить($self->схема, 'связи', ["id1", "id2"], {"id1" => $r->{id}, "id2" => $id,});
    $refs{"$ref->{id1}:$ref->{id2}"}++;
  } @{ $data->{'@позиции'} || [] };
  
  map {
    $self->_удалить_строку("отгрузка/позиции", $_, "связи", $self->схема)
      unless $refs{"$r->{id}:$_"};
  } @{ $prev->{'@позиции/id'} || [] }
    if $prev;
  
  return $self->отгрузки(id=>$r->{id})->[0];
}

sub почистить_контрагентов {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('почистить контрагентов'), {Slice=>{}}, $self->uid);#  
}

sub движение_сырья {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' "сырье/id" ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  $self->dbh->selectall_arrayref($self->sth('позиции в отгрузке', select=>$param->{select}, where=>$where, order_by=>$param->{order_by}), {Slice=>{}}, @bind);
}

1;