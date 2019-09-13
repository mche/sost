use Mojo::Base -strict;

use JavaScript::Packer;
use JavaScript::Minifier::XS qw(minify);
 
my $packer = JavaScript::Packer->init();

$/ = undef;
my $javascript = <>;

#~ my $ret = $packer->minify( \$javascript, {} );


my $ret= minify($javascript);
say $ret;

