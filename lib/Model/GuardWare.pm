package Model::GuardWare;
use Mojo::Base 'Model::Base';
use Util;

our $DATA = ['GuardWare.pm.dict.sql'];

#~ has model_nomen => sub {shift->app->models->{'Nomen'}};


sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сотрудники {
  my $self = shift;
  
}

sub список_спецодежды {
  my ($self, $param, $cb) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    $param->{'наименование'} ? (' s."наименование" ' =>  $param->{'наименование'}) : () ,
    $param->{'профиль'} ? (' ?::int ' => \[ ' = any(p."@профили/id") ', $param->{'профиль'} ],) : (),
  });
  push @bind, $param->{limit} || 50, $param->{offset} || 0;
  $cb
    ? $self->dbh->pg->db->query($self->dict->render('список спецодежды', where=>$where, limit_offset=>"limit ? offset ?"), @bind, $cb)
    : $self->dbh->selectall_arrayref($self->sth('список спецодежды', where=>$where), {Slice=>{}}, @bind)
  ;
}

sub наименования_спецодежды {
  my ($self, $cb) = @_;
  $cb 
    ? $self->dbh->pg->db->query($self->dict->render('наименования спецодежды'), (), $cb)
    : $self->dbh->selectall_arrayref($self->sth('наименования спецодежды'), {Slice=>{}},)
  ;
}

#~ sub спецодежда_сотрудника {
  #~ my ($self, $param) = @_;
  #~ my ($where, @bind) = $self->SqlAb->where({
    #~ ' ?::int ' => \[ ' = any(p."@профили/id") ', $param->{pid} ],
  #~ });
  #~ $self->dbh->selectall_hashref($self->sth('список спецодежды', where1=>$where), 'key', undef, @bind);
#~ }

sub сохранить {
  my ($self, $data) = @_;
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена срок);
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'спецодежда', ["id"], $data, $data->{'цена'} ? {'цена'=>' ?::numeric::money '} : undef);
  #~ my %ref = ();#
  map {# связи профилей
    my $pid = ref ? $_->{id} : $_;
    push @{$r->{'@профили/id'} ||= []}, $self->связь( $pid, $r->{id} )->{id1}
      if $pid;
  } @{$data->{'профили'} || []};
  my ($where, @bind) = $self->SqlAb->where({
    ' s."id" '=>$r->{id},
  });
  return $self->dbh->selectrow_hashref($self->sth('список спецодежды', where=>$where), undef, @bind);
}

sub удалить {
  my ($self, $uid, $data) = @_;
  return $self->_удалить_строку($uid, 'спецодежда', $data->{id});
}

sub связь_создать_или_удалить {
  my ($self, $data) = @_;
  $self->_select($self->{template_vars}{schema}, 'спецодежда', ["id"], {id=>$_})
    or return {error=>"нет записи спецодежды id=[$_]"}
    for @{$data->{id2}};
  $self->_select($self->{template_vars}{schema}, 'профили', ["id"], {id=>$data->{id1}})
    or return {error=>"нет записи сотрудника"};
  #~ $self->app->log->error($self->app->dumper($data));
  my $save = {};
  $save->{remove} = $self->связи_удалить($data);
  #~ $self->app->log->error($self->app->dumper($data));
  delete @$data{qw(id)};# косяк-костыль
  push @{$save->{save} ||= []}, $self->связь($data->{id1}, $_)
    for grep {my $id2 = $_; not scalar grep {$_->{id1} eq $data->{id1} && $_->{id2} eq $id2} @{$save->{remove}}} @{$data->{id2}};
  return $save;
}

1;

__DATA__