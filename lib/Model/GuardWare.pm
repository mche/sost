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
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('список спецодежды'), {Slice=>{}}, );
}

sub сохранить {
  my ($self, $data) = @_;
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена срок);
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'спецодежда', ["id"], $data, {'цена'=>' ?::numeric::money '});
  #~ my %ref = ();#
  map {# связи профилей
    my $pid = ref ? $_->{id} : $_;
    push @{$r->{'@профили/id'} ||= []}, $self->связь( $pid, $r->{id} )->{id1}
      if $pid;
  } @{$data->{'профили'} || []};
  my ($where, @bind) = $self->SqlAb->where({
    ' s."id" '=>$r->{id},
  });
  return $self->dbh->selectrow_hashref($self->sth('список спецодежды', where1=>$where), undef, @bind);;
}

sub удалить {
  my ($self, $data) = @_;
  return $self->_удалить_строку('спецодежда', $data->{id});
}

1;

__DATA__