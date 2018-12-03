package Model::Util;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Util.pm.dict.sql'];

has [qw(app)];


sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->error($self->dict->render('extra foo'));
  #~ return $self;
}

1;

__DATA__
@@ функции
---