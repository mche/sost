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

sub счет_оплата_docx {
  my ($self, $param,)  =  @_;
  my ($where, @bind) = $self->SqlAb->where({
    ' d.id ' => \[ ' = any(?) ', $param->{"договоры"} ],
    ' d.id ' => \[ ' = any(?) ', $param->{"договоры"} ],
    });
  unshift @bind, $param->{'месяц'}, $param->{'присвоить номера счетов'} ? $param->{"договоры"} : [], $param->{uid};
  my $data = $self->dbh->selectrow_array($self->sth('счета', where=>$where), undef, @bind);
  my $r = {};
  #~ my @data = map {
    #~ my $r = {};
    #~ $r->{'номер'} = 123;# номер счета
    #~ $r->{'дата'} = {"day"=>1, "месяц"=>"января", "year"=>"2019"}; # дата счета
    #~ $r->{'контрагент'} = $_->{'$контрагент/json'}
  #~ } @$data;
  
  $r->{docx_out_file} = "static/tmp/счет-$param->{uid}.docx";
  $r->{docx} = "счет-$param->{uid}.docx";
  $r->{data} = $data;
  $r->{python} = $self->dict->{'счет.docx'}->render(
    docx_template_file=>"static/аренда-счет.template.docx",
    docx_out_file=>$r->{docx_out_file},
    data=>$data,# $self->app->json->encode($data),
    buyer=>$self->dbh->selectrow_array('select k."реквизиты" from "контрагенты" k  where id=123222'),
    #~ date=>$r->{'$дата1/json'}, #$JSON->decode(),
    #~ profile=>$r->{'$снабженец/json'}, #$JSON->decode(),
    #~ num=>$id,
    #~ from=> $r->{'с объекта/id'} ? $self->model_obj->объекты_проекты($r->{'с объекта/id'})->[0] : $r->{'@грузоотправители/id'} && $r->{'@грузоотправители/id'}[0] ? $model_ka->позиция($r->{'@грузоотправители/id'}[0]) : {'title'=>'нет грузоотправителя?'},
    #~ to=>$self->model_obj->объекты_проекты($r->{'на объект/id'} || $r->{'позиции тмц/на первый объект/id'})->[0] || {name=>'куда? ошибка'}, # ,
    #~ pos=>$r->{pos},#{'@позиции тмц/json'},#$JSON->encode(
    #~ len=>$r->{len},
    #~ model=>$self,
  );
  
  return $r;#для отладки - коммент линию
}


1;