package Model::Profile;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'профили';
has [qw(app)];


sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}
sub init {
  my $self = shift;
  
}

sub список {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{},}, (undef) x 2);
  
}

sub задать_пароль {
  my ($self, $login, $pass) = @_;
  $self->dbh->selectall_arrayref($self->sth('задать пароль'), {Slice=>{},}, $pass, $login);
}


1;

__DATA__
@@ изменения
alter table "профили" add column tel text[];
alter table "профили" add column descr text;
alter table "профили" add column "дата рождения" date;

alter table "профили" add unique(names);

@@ список или позиция
select *
from "профили"
where ?::int is null ---and not coalesce(disable, false))
  or id=?
order by names
;

@@ задать пароль
update "logins"
set pass=?
where login=?
returning *;
