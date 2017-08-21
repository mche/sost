package Model::Profile;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'профили';
has [qw(app)];


sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{},}, (undef) x 2);
  
}


1;

__DATA__
@@ список или позиция
select *
from "профили"
where ?::int is null ---and not coalesce(disable, false))
  or id=?
order by names
;

