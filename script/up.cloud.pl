use strict;
use utf8;
use Mailru::Cloud;


=pod

=head1 USAGE

perl up.cloud.pl login:pass local_file /cloud/dir/name

=cut

my ($login, $pw) = split ':', $ARGV[0];

my $cloud = Mailru::Cloud->new;
#Authorize on cloud.mail.ru
$cloud->login(-login => $login, -password => $pw)
  or die "Cant login on mail.ru";
 
#Upload file Temp.png to folder /folder on cloud.mail.ru
my $uploaded_name = $cloud->uploadFile(
  -file           => $ARGV[1],      # Path to file on localhost
  -path           => $ARGV[2] ,      # Path on cloud.
  -rename         => 1,               # Rename file if exists (default: overwrite exists file)
);