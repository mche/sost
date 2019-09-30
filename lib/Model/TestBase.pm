package Model::TestBase;
use Mojo::Base -base;
use SQL::Abstract;

has [qw(app dbh)], undef, weak=>1;
has qw(sth_cached);# тотально для всех запросов
has SqlAb => sub { SQL::Abstract->new };

sub insert_default_values { shift->_insert_default_values(@_); }
sub _insert_default_values {
  my ($self, $schema, $table,) = splice @_,0, 3;
  warn ("_insert_default_values [$schema][$table] [@_]");
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL,
insert into "%s"."%s"
DEFAULT VALUES
returning *, ---pg_backend_pid()
random() as "pg_backend_pid";
END_SQL
  ( $schema, $table,))), undef,);#, 'cached'
}

sub _prepare {# sth
  my ($self, $sql, $cached) = @_;
  $cached //= $self->sth_cached;
  return $self->dbh->prepare_cached($sql)
    if $cached;
  return  $self->dbh->prepare($sql);
  
}

1;