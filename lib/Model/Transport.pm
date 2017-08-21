package Model::TMC;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

1;


__DATA__
@@ таблицы

