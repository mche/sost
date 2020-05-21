package Model::Rent;
use Mojo::Base 'Model::Base';
use Lingua::RU::Money::XS qw(rur2words);

our $DATA = ['Rent.pm.dict.sql'];

#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};
has model_category => sub {shift->app->models->{'Category'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->app->log->error("init", $self->dict->{'таблицы'}->mt->render_file('Rent.pm.views.sql'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub объекты_ук {
  my $self = shift;
  my ($where, @bind) = $self->SqlAb->where({
    ' parent ' => 713238,# Прокты-УК
    
  });
  $self->dbh->selectall_arrayref($self->sth('объекты УК', where=>$where, order_by=>' order by name '), {Slice=>{}}, @bind);
}

sub список_объектов {
  my $self  =  shift;
  my $data= ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' o.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('объекты/список или позиция', where=>$where, order_by_room=>q! order by case when p."номер-название"~'^\d' then repeat('0', 5 - char_length(regexp_replace(p."номер-название", '\D+', '', 'g'))) || p."номер-название" else p."номер-название" end !), {Slice=>{}}, @bind);
}

sub сохранить_объект {
  my ($self, $data, $prev,)  =  @_;
  
  $prev ||= $self->список_объектов( id=>$data->{id} )->[0]
    if $data->{id};
  
  $data->{'адрес'} = $data->{'$объект'}{name}
    or return "Не указано название объекта";
  
  my $oid = $data->{'$объект'}{id}
    or return "Не указан объект";
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/объекты', ["id"], $data);
  
  #~ $self->app->log->error(
  $self->app->dumper($self->связь($oid, $r->{id}));
  $self->app->log->error($self->app->dumper($self->связь_удалить(id1=>$prev->{'объект/id'}, id2=>$r->{id})))
    if $prev && $prev->{'объект/id'} ne $oid;
  
  my %ref = ();
  map {
    my $r = $self->связь( $r->{id}, $_->{id});
    $ref{"$r->{id1}:$r->{id2}"}++
      if $r;
  } @{ $data->{'@кабинеты'}};
  map {
    my $id = $prev->{'@кабинеты/id'}[$_];
    
    return "Нельзя удалять помещение @{[ %{ @{ $self->app->json->decode($prev->{'@кабинеты/json'}) }[$_] } ]}, уже в договоре"
      if !$ref{"$r->{id}:$id"} && $prev->{'@помещение в договоре аренды'} && $prev->{'@помещение в договоре аренды'}[$_];
      
    $self->_удалить_строку('аренда/помещения', $id)
      unless $ref{"$r->{id}:$id"};
  } (0..$#{ $prev->{'@кабинеты/id'}})
    if $prev;
  
  $self->список_объектов( id=>$r->{id} )->[0];
  
}

sub сохранить_кабинет {
  my ($self, $data)  =  @_;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/помещения', ["id"], $data);
  return $r;
}

sub сохранить_помещение_договора {# и доп соглашения
  my ($self, $data, $prev)  =  @_;
  $prev ||= $self->помещения_договора(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/договоры-помещения', ["id"], $data);
  $self->связь($data->{'помещение/id'}, $r->{id});
  $self->связь_удалить(id1=>$prev->{'помещение/id'}, id2=>$r->{id})
    if $prev && $prev->{'помещение/id'} ne $data->{'помещение/id'};
  return $r;
}

sub помещения_договора {
  my $self  =  shift;
  my $data = ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' r.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('договоры/помещения', where=>$where), {Slice=>{}}, @bind);
  
}

sub сохранить_договор {
  my ($self, $data, $prev)  =  @_;
  
  $prev ||= $self->список_договоров( id=>$data->{id} )->[0]
    if $data->{id};
  
  #~ $self->app->log->error($self->app->dumper($data->{'@помещения'}, $prev && $prev->{'@договоры/помещения/id'}));
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/договоры', ["id"], $data);
  my %refs = ();
  map {
    my $rr  = $self->связь($r->{id}, $_->{id});
    $refs{"$rr->{id1}:$rr->{id2}"}++;
  } @{ $data->{'@помещения'} };
  
  map {
    $self->_удалить_строку('аренда/договоры-помещения', $_)
      unless $refs{"$r->{id}:$_"};
  } @{$prev->{'@договоры/помещения/id'}}# @кабинеты/id
    if $prev;
  
  map {
    my $rk = $self->связь($data->{"$_/id"}, $r->{id});
    $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id})
      if $prev && $prev->{"$_/id"} ne $data->{"$_/id"};
  } qw(проект контрагент);
  
  return $self->список_договоров( id=>$r->{id} )->[0];
  
}

sub сохранить_доп_соглашения {# список
  my ($self, $data, $prev)  =  @_;
  my %refs = ();
  map {# тут только связи с договором, каждое доп соглашение уже сохранено
    
    my $r  = $self->связь($data->{id}, $_->{id});
    $refs{"$r->{id1}:$r->{id2}"}++;

  } @{ $data->{'@доп.соглашения'} || [] };
  
  if ($prev && $prev->{'@доп.соглашения/json'}) {# удаление доп.соглашений
    $prev->{'@доп.соглашения'} = $self->app->json->decode($prev->{'@доп.соглашения/json'});
    map {
      unless ($refs{"$prev->{id}:$_->{id}"}) {
        $self->_удалить_строку('аренда/договоры-помещения', $_)
          for @{$_->{'@договоры/помещения/id'}};
        $self->_удалить_строку('аренда/договоры/доп.согл.', $_->{id});
      }
    } @{ $prev->{'@доп.соглашения'} || [] };
    
  }
  
  return [];# список доп вроде не нужен
}

sub сохранить_доп_соглашение {# одно
  my ($self, $data, $prev)  =  @_;
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/договоры/доп.согл.', ["id"], $data);
  my %refs = ();
  map {
    my $rr  = $self->связь($r->{id}, $_->{id});
    $refs{"$rr->{id1}:$rr->{id2}"}++;
  } @{ $data->{'@помещения'} || [] };
  
  map {
    $self->_удалить_строку('аренда/договоры-помещения', $_)
      unless $refs{"$r->{id}:$_"};
  } @{$data->{'@договоры/помещения/id'} || []};
    #~ if $prev; тут труднее получить предыдущие позиции (пока так)
  return $r;
}

sub список_договоров {
  my $self  =  shift;
  my $data= ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' d.id ' => $data->{id}) : (),
    $data->{'договоры на дату'} ? (qq{ date_trunc('month', ?::date) } => { -between => \[qq{ date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') }, , $data->{'договоры на дату'}] }) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('договоры', where=>$where, $data->{order_by} ? (order_by=>$data->{order_by}) : ()), {Slice=>{}}, @bind);
}

sub удалить_объект {
  my ($self, $data,)  =  @_;
  my $r = $self->список_объектов( id=>$data->{id} )->[0];
  map {
    my ($where, @bind) = $self->SqlAb->where({
      ' p.id ' => $_,
    });
    my $r = $self->dbh->selectrow_hashref($self->sth('договоры/помещения', where=>$where), undef, @bind);
    return "Помещение @{[ %$r ]} записано в договоре"
      if $r;
    $self->_удалить_строку('аренда/помещения', $_);
  } @{ $r->{'@кабинеты/id'}};
  $self->_удалить_строку('аренда/объекты', $data->{id});
  return $r;
}

sub счет_оплата_docx {# и акты
  my $self  =  shift;
  my $param = ref $_[0] ? shift : {@_};
  
  # пришлось вынести вызов нумерации отдельно, функции чет косячно не возвращает строки
  $self->dbh->do(qq|select "номера счетов/аренда помещений"(?::date, ?::int[], ?::int)|, undef, $param->{'месяц'}, $param->{"договоры"}, $param->{uid})
    if $param->{'присвоить номера'} && $param->{'счет или акт'} eq 'счет';
  $self->dbh->do(qq|select "номера актов/аренда помещений"(?::date, ?::int[], ?::int)|, undef, $param->{'месяц'}, $param->{"договоры"}, $param->{uid})
    if $param->{'присвоить номера'} && $param->{'счет или акт'} eq 'акт';
  
  
  my ($where, @bind) = $self->SqlAb->where({
    $param->{"договоры"} ? (' d.id ' => \[ ' = any(?) ', $param->{"договоры"} ]) : (),
    q| not coalesce((coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо'), 'false')::boolean |=>\[],
#    ' dp."объект/id" ' => \[ ' = any(?) ', $param->{"объекты"} ],
  });
  unshift @bind, $param->{'месяц'}, $param->{'счет или акт'} eq 'акт' ? 929979 : 0;# отключить обеспечит предоплата для актов, $param->{'присвоить номера'} ? $param->{"договоры"} : [], $param->{uid};
  my $data = $self->dbh->selectrow_array($self->sth('счета и акты', select=>' jsonb_agg(s) as "json" ', where=>$where), undef, @bind);
  my $r = {};
  $r->{docx} = $param->{docx} || "счет-$param->{uid}.docx";
  $r->{docx_out_file} = "static/tmp/$r->{docx}";
  
  $r->{data} = $data;
  $r->{python} = $self->dict->{'счет.docx'}->render(
    docx_template_file=>$param->{docx_template_file} || "static/аренда-счет.template.docx",
    docx_out_file=>$r->{docx_out_file},
    data=>$data,# $self->app->json->encode($data),
    seller=>{},#$self->dbh->selectrow_array(q<select k."реквизиты"||to_jsonb(k) from "контрагенты" k  where id=123222>),# арендодатель по умолчанию
    #~ sign_image=>-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
    #~ {% if item['$арендодатель'] and sign_images.get(str(item['$арендодатель']['id'])) %} {{ sign_images.get(str(item['$арендодатель']['id'])) }} {% elif sign_images.get(str(seller['id'])) %} {{ sign_images.get(str(seller['id'])) }} {% endif %}
  );
  
  #~ $self->app->log->error($r->{python});
  
  return $r;#для отладки - коммент линию
}

sub счет_расходы_docx {
  my $self  =  shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    # ничего
  });
  unshift @bind, $param->{'месяц'}, $param->{'аренда/расходы/id'};
  my $data = $self->dbh->selectrow_array($self->sth('счета и акты/доп расходы', select=>' jsonb_agg(a) as "json" ', where=>$where), undef, @bind);
  #~ return $data;
  my $r = {};
  $r->{docx} = $param->{docx} || "счет-$param->{uid}.docx";
  $r->{docx_out_file} = "static/tmp/$r->{docx}";
  
  $r->{data} = $data;
  $r->{python} = $self->dict->{'счет.docx'}->render(
    docx_template_file=>$param->{docx_template_file} || "static/аренда-счет.template.docx",
    docx_out_file=>$r->{docx_out_file},
    data=>$data,# $self->app->json->encode($data),
    seller=>'{}', #$self->dbh->selectrow_array('select k."реквизиты" from "контрагенты" k  where id=123222'),# пока один датель
    #~ sign_image=>undef, #-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
  );
  
  return $r;#для отладки - коммент линию
}

sub реестр_актов {
  my $self  =  shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = $self->SqlAb->where({
    $param->{"договоры"} ? (' d.id ' => \[ ' = any(?) ', $param->{"договоры"} ]) : (),
    q| not coalesce((coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо'), 'false')::boolean |=>\[],
#    ' dp."объект/id" ' => \[ ' = any(?) ', $param->{"объекты"} ],
  });
  unshift @bind, $param->{'месяц'}, $param->{'счет или акт'} eq 'акт' ? 929979 : 0;# отключить обеспечит предоплата для актов, $param->{'присвоить номера'} ? $param->{"договоры"} : [], $param->{uid};
  $self->dbh->selectall_arrayref($self->sth('счета и акты', where=>$where), {Slice=>{}}, @bind);
}

sub расходы_категории {
  my $self  =  shift;
  my $param = ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    #~ ' cat."parents_title"[2:3] ' => \[ ' = ?::text[] ', ['аренда офисов', 'дополнительные платежи']],
    ' cat."parents_title"[2] ' => \[ ' = ?::text ', 'коммунальные платежи'],
    #~ '  c.childs ' => undef #  is null
  });
  
  $self->dbh->selectall_arrayref($self->sth('категории', select=>$param->{select} || '*', where=>$where, order_by=>' order by "parents_title" || title '), {Slice=>{}}, @bind);
}

sub сохранить_категорию {
  my $self  =  shift;
  my $data = ref $_[0] ? shift : {@_};
  #~ $self->app->log->error($self->app->dumper($data));
  $data->{newItems} = [$data]
    unless $data->{id};
  #~ $data->{parent} = 1009623; # дополнительные платежи
  $data->{parent} = 353551; # коммунальные платежи
  $self->model_category->сохранить_категорию($data);
}

sub сохранить_позицию_расхода {
  my ($self, $data, $prev)  =  @_;
  $prev ||= $self->позиции_расхода(id=>$data->{id})->[0]
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/расходы/позиции', ["id"], $data);
  $self->связь($data->{'категория/id'}, $r->{id});
  $self->связь_удалить(id1=>$prev->{'категория/id'}, id2=>$r->{id})
    if $prev && $prev->{'категория/id'} ne $data->{'категория/id'};
  return $r;
}

sub позиции_расхода {
  my $self  =  shift;
  my $data = ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' pos.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('расходы/позиции', where=>$where), {Slice=>{}}, @bind);

}

sub сохранить_расход {
  my ($self, $data, $prev)  =  @_;
  
  $prev ||= $self->список_расходов( id=>$data->{id} )->[0]
    if $data->{id};
  
  #~ $self->app->log->error($self->dbh);#$self->app->dumper($data->{'@помещения'}, $prev && $prev->{'@договоры/помещения/id'}));
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/расходы', ["id"], $data);
  my %refs = ();
  map {
    my $rr  = $self->связь($r->{id}, $_->{id});
    $refs{"$rr->{id1}:$rr->{id2}"}++;
  } @{ $data->{'@позиции'} };
  
  map {
    $self->_удалить_строку('аренда/расходы/позиции', $_)
      unless $refs{"$r->{id}:$_"};
  } @{$prev->{'@позиции/id'}}
    if $prev;
  
  map {
  $self->связь($data->{"$_/id"}, $r->{id});
  
  $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id})
    if $prev && $prev->{"$_/id"} ne $data->{"$_/id"};
  } qw(проект договор);
  #~ $self->app->log->error('сохранить_расход', $self->app->dumper($r));
  
  return $self->список_расходов( id=>$r->{id} )->[0];
}

sub список_расходов {
  my $self  =  shift;
  my $data= ref $_[0] ? shift : {@_};
  my $pid = $data->{'проект/id'} || ($data->{'проект'} && $data->{'проект'}{id});
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' r.id ' => $data->{id}) : (),
    $pid ? (' pr.id '=> $pid) : (),
    $data->{'месяц'} ? (qq{ date_trunc('month', r."дата") } => \[qq{ = date_trunc('month', ?::date) }, $data->{'месяц'}] ) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('расходы', where=>$where, $data->{order_by} ? (order_by=>$data->{order_by}) : ()), {Slice=>{}}, @bind);
  
}

1;