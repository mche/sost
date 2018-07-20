use Mojo::Base -strict;
use Mojo::Pg::Che;
Mojo::Pg::Che->connect('DBI:Pg:dbname=dev5', 'postgres', undef,)->max_connections(2);