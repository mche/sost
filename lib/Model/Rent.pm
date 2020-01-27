package Model::Rent;
use Mojo::Base 'Model::Base';
use Lingua::RU::Money::XS qw(rur2words);

our $DATA = ['Rent.pm.dict.sql'];

#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};
#~ has model_nomen => sub {shift->app->models->{'Nomen'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  $self->dbh->do($self->sth('таблицы'));
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
  my ($self, $data)  =  @_;
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' o.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('объекты/список или позиция', where=>$where), {Slice=>{}}, @bind);
}

sub сохранить_объект {
  my ($self, $data, $prev,)  =  @_;
  
  $prev ||= $self->список_объектов({id=>$data->{id}})->[0]
    if $data->{id};
  
  $data->{'адрес'} = $data->{'$объект'}{name}
    or return "Не указано название объекта";
  
  my $oid = $data->{'$объект'}{id}
    or return "Не указан объект";
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/объекты', ["id"], $data);
  
  $self->app->log->error($self->app->dumper($self->связь($oid, $r->{id})));
  $self->app->log->error($self->app->dumper($self->связь_удалить(id1=>$prev->{'объект/id'}, id2=>$r->{id})))
    if $prev && $prev->{'объект/id'} ne $oid;
  
  my %ref = ();
  map {
    my $r = $self->связь( $r->{id}, $_->{id});
    $ref{"$r->{id1}:$r->{id2}"}++
      if $r;
  } @{ $data->{'@кабинеты'}};
  map {
    $self->_удалить_строку('аренда/помещения', $_)
      unless $ref{"$r->{id}:$_"};
  } @{ $prev->{'@кабинеты/id'}}
    if $prev;
  
  $self->список_объектов({id=>$r->{id}})->[0];
  
}

sub сохранить_кабинет {
  my ($self, $data)  =  @_;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/помещения', ["id"], $data);
  return $r;
}

sub сохранить_помещение_договора {
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
  
  $prev ||= $self->список_договоров({id=>$data->{id}})->[0]
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
  
  my $rk = $self->связь($data->{'контрагент/id'}, $r->{id});
  $self->связь_удалить(id1=>$prev->{'контрагент/id'}, id2=>$r->{id})
    if $prev && $prev->{'контрагент/id'} ne $data->{'контрагент/id'};
  
  return $self->список_договоров({id=>$r->{id}})->[0];
  
}

sub список_договоров {
  my ($self, $data)  =  @_;
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' d.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('договоры', where=>$where), {Slice=>{}}, @bind);
}

sub удалить_объект {
  my ($self, $data,)  =  @_;
  my $r = $self->список_объектов({id=>$data->{id}})->[0];
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
  my ($self, $param,)  =  @_;
  
  # пришлось вынести вызов нумерации отдельно, функции чет косячно не возвращает строки
  $self->dbh->do(qq|select "номера счетов/аренда помещений"(?::date, ?::int[], ?::int)|, undef, $param->{'месяц'}, $param->{"договоры"}, $param->{uid})
    if $param->{'присвоить номера'} && $param->{'счет или акт'} eq 'счет';
  $self->dbh->do(qq|select "номера актов/аренда помещений"(?::date, ?::int[], ?::int)|, undef, $param->{'месяц'}, $param->{"договоры"}, $param->{uid})
    if $param->{'присвоить номера'} && $param->{'счет или акт'} eq 'акт';
  
  
  my ($where, @bind) = $self->SqlAb->where({
    ' d.id ' => \[ ' = any(?) ', $param->{"договоры"} ],
#    ' dp."объект/id" ' => \[ ' = any(?) ', $param->{"объекты"} ],
  });
  unshift @bind, $param->{'месяц'}, $param->{'счет или акт'} eq 'акт' ? 929979 : 0;# отключить обеспечит предоплата для актов, $param->{'присвоить номера'} ? $param->{"договоры"} : [], $param->{uid};
  my $data = $self->dbh->selectrow_array($self->sth('счета', where=>$where), undef, @bind);
  my $r = {};
  $r->{docx} = $param->{docx} || "счет-$param->{uid}.docx";
  $r->{docx_out_file} = "static/tmp/$r->{docx}";
  
  $r->{data} = $data;
  $r->{python} = $self->dict->{'счет.docx'}->render(
    docx_template_file=>$param->{docx_template_file} || "static/аренда-счет.template.docx",
    docx_out_file=>$r->{docx_out_file},
    data=>$data,# $self->app->json->encode($data),
    seller=>$self->dbh->selectrow_array('select k."реквизиты" from "контрагенты" k  where id=123222'),# пока один датель
    sign_image=>-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
  );
  
  return $r;#для отладки - коммент линию
}


1;