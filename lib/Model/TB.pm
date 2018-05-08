package Model::TB;# охрана труда и техника безопасности
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];


sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "hgfjh" (
/*** 
связи:
id1("")->id2("")
id1("")->id2("") 
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),

);
