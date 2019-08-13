package Model::Rent;
use Mojo::Base 'Model::Base';

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

sub список_объектов {
  my ($self, $data)  =  @_;
  my ($where, @bind) = $self->SqlAb->where({
    $data->{id} ? (' o.id ' => $data->{id}) : (),
    });
  $self->dbh->selectall_arrayref($self->sth('объекты/список или позиция', where=>$where), {Slice=>{}}, @bind);
}

sub сохранить_объект {
  my ($self, $data, $prev)  =  @_;
  
  $prev ||= $self->список_объектов({id=>$data->{id}})->[0]
    if $data->{id};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'аренда/объекты', ["id"], $data);
  
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


1;