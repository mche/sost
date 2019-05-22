package Model::GuardWare;
use Mojo::Base 'Model::Base';
use Util;

our $DATA = ['GuardWare.pm.dict.sql'];

#~ has model_nomen => sub {shift->app->models->{'Nomen'}};


sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сотрудники {
  my $self = shift;
  
}

1;

__DATA__