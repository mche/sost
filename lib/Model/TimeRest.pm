package Model::TimeRest;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['TimeRest.pm.dict.sql'];

#~ has sth_cached => 1;
#~ my $main_table = 'табель';
#~ has model_obj => sub {shift->app->models->{'Object'}};


#~ sub new {
  #~ my $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ return $self;
#~ }
sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  
}

sub отпуск {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  
  $self->dbh->selectall_hashref($self->sth('отпускные дни'), 'year', undef, ($param->{id}) x 2);
  
}


1;