use Mojo::Base -strict;
use DBI;
use Mojo::Util qw(dumper);

my $dbh = DBI->connect('dbi:Pg:dbname=dev2', 'postgres', undef,);

my $sth = $dbh->prepare_cached('insert into "медкол"."сессии" DEFAULT VALUES returning *');

my $r = $dbh->selectrow_hashref($sth);

say dumper $r;

$r = $dbh->selectrow_hashref($sth);

say dumper $r;