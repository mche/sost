package Dbh;
#~ use strict;
#~ use utf8;
#~ use DBI;
use Mojo::Pg::Che;
#~ use base 'DBI::db';
use Mojo::Base -base;
#~ binmode(STDOUT, ":utf8");
#~ binmode(STDERR, ":utf8");

#~ has pid =>  $$;

has [qw(pg_host pg_port pg_user pg_passwd pg_dbname max_connections)];

has pg_user => 'vinylhub';
has pg_dbname => 'vinylhub';

has dbh => sub {
  my $self = shift;
  my $pg = Mojo::Pg::Che->connect("DBI:Pg:dbname=@{[$self->pg_dbname]};@{[$self->pg_host ? 'host='.$self->pg_host.';' : '']}@{[$self->pg_port ? 'port='.$self->pg_port.';' : '']}", $self->pg_user, $self->pg_passwd,);# {
    #~ ShowErrorStatement => 1,
    #~ AutoCommit => 1,
    #~ RaiseError => 1,
    #~ PrintError => 1, 
    #~ pg_enable_utf8 => 1,
    #~ InactiveDestroy => 1,
    #~ AutoInactiveDestroy =>1,
  #~ });
  $pg->max_connections($self->max_connections)
    if $self->max_connections;
  $pg->do('set  datestyle to "ISO, DMY";',);
  #~ $db->{private_connect_pid} = $self->pid;
  warn "Соединился с базой ", $self->pg_dbname;
  $pg;
};

#~ my $pkg = __PACKAGE__;
#~ my $self = bless \$pkg, $pkg;
#~ my $self = bless {}, $pkg;
#~ bless $dbh => $pkg;


sub connect {
  my $self = ref($_[0]) ? shift : shift->new(@_);
  
  $self->dbh;
}

1;

__END__
sub DESTROY00 {
  my $dbh = shift;
  $dbh->disconnect;
  print "Отключился от базы vinylhub\n"
  
}
