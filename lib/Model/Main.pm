package Model::Main;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
#~ my $main_table = '';
has [qw(app)];


#~ sub new {
  #~ state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  #~ return $self;
#~ }

sub конфиг {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('конфиг'), {Slice=>{}},);
  
}


1;

__DATA__
@@ конфиг?cache=1&cached=1
select *
from "Конфиг"()
;


/* коммент чтобы не затирать версию, меняй в консоле
CREATE or REPLACE FUNCTION "Конфиг"()
RETURNS TABLE("key" text, "value" text) AS $func$
SELECT *
FROM (VALUES
  ('VERSION', '2017-07-27')
) AS s ("key", "value");
$func$ LANGUAGE SQL;

*/
