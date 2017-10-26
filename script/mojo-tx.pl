#~ //~ curl -vv -d "csrfmiddlewaretoken=cR29NHA9CNVUSVsEcqejzQvmLbSWcE8kzAdg8a1zHskdSNLdAC8kpb9tzg8szKzb&author=che&email=1%402.com&title=ok&message=ok" -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.105 Safari/537.36 Vivaldi/1.92.917.43" -H "Cookie: csrftoken=akwQDI27sFgUdkqIEp0LOGw4Aeh832iRx3HXYbtxxkFddcJh2BUME1abojxEq8JI" -X POST http://saturn721.pythonanywhere.com

use Mojo::Base -strict;
use Mojo::Transaction::HTTP;
use Mojo::UserAgent;
 
my $ua  = Mojo::UserAgent->new;

$ENV{MOJO_MAX_MESSAGE_SIZE} =1;

=pod
# Client
my $tx = Mojo::Transaction::HTTP->new;
$tx     = $tx->req(Mojo::Message::Request->new);
$tx->req->method('GET');
$tx->req->url->parse('http://saturn721.pythonanywhere.com');
#~ $tx->req->headers->accept('application/json');
say $tx->res->code;
say $tx->res->headers->content_type;
say $tx->res->body;
say $tx->remote_address;

=cut
# Interrupt response by raising an error
my $tx = $ua->build_tx(GET => 'http://saturn721.pythonanywhere.com');
#~ $tx->res->on(progress => sub {
  #~ my ($msg, $state, $offset) = @_;
  #~ say qq{Building "$state" at offset $offset};
#~ });
$tx->on(request000 => sub {
  my $tx = shift;
  say "TX resume";
  say $tx->res->headers;
  say $tx->res->body;
});
$tx->res->on(progress => sub {
  my $msg = shift;
  say qq{Building "@_"};
  say $msg->body;
  return unless my $len = $msg->headers->content_length;
  my $size = $msg->content->progress;
  say 'Progress: ', $size == $len ? 100 : int($size / ($len / 100)), '%';
  
});
#~ $tx->res->on(progress => sub {
  #~ my $res = shift;
  #~ return unless my $server = $res->headers->server;
  #~ $res->error({message => 'Oh noes, it is IIS!'}) if $server =~ /IIS/;
#~ });
$tx = $ua->start($tx);
say $tx->res->body;