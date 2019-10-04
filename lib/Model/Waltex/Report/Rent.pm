package Model::Waltex::Report::Rent;
use Mojo::Base 'Model::Base';
#~ use Util;

our $DATA = ['Rent.pm.dict.sql'];

sub контрагенты {
  my $self = shift;
  $self->dbh->selectrow_array($self->sth('контрагенты'));
  
}

1;