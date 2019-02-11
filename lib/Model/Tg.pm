package Model::Tg;
use Mojo::Base 'Model::Base';
use Util;

our $DATA = ['Tg.pm.sql'];

sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}


1;