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
    ? $self->_update($self->схема, 'связи', ["id1", "id2"], {"id1"=>$prev->{'номенклатура/id'}, "id2"=> $r->{id},}, {"id1"=>$data->{'номенклатура/id'}})
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
    my $ref = $self->_select($self->схема, 'связи', ["id1","id2"], {"id1"=>$prev->{parents_id}[0], "id2"=>$data->{id}});
    $self->_update($self->схема, 'связи', ["id"], {"id"=>$ref->{id}, "id1"=> $data->{parent_id},})
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
    $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('поступление сырья', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
}

sub сырье_остатки {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  #~ my ($where, @bind) = $self->SqlAb->where({
    #~ $param->{id} ? (' id ' => $param->{id}) : (),
    #~ $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  #~ });
  
  $self->dbh->selectall_arrayref($self->sth('остатки сырья', select=>$param->{select}, where=>$param->{where}), {Slice=>{}}, ($param->{"дата"}));
  
}

sub производство_продукции {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my ($where, @bind) = $self->SqlAb->where({
    $param->{id} ? (' id ' => $param->{id}) : (),
    $param->{"дата"} ? (' "дата" ' => $param->{"дата"}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('производство продукции', select=>$param->{select}, where=>$where), {Slice=>{}}, @bind);
  
}

1;