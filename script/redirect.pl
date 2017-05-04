use Mojolicious::Lite;

=pod

Usage:

  perl script/redirect.pl daemon  --listen http://*:80

Or uncomment listen option below and

  perl script/redirect.pl daemon

=cut

my $conf = {
  listen => 'http://*:80',
  scheme => 'https',
  #~ port => '443', !!! https scheme not need
  host => 'lovigazel.ru',
  code=> '301',# Moved code status
  server=>'ELK 3.7.11',
  mode => 'production',
};

push @ARGV, '--listen', $conf->{listen}
  if $conf->{listen};

hook before_dispatch => sub {
  my $c = shift;
  my $url = $c->req->url->to_abs;
  
  $url->can($_) && $url->$_($conf->{$_})
    for keys %$conf;
  
  #~ warn $url->to_string if $url->userinfo;
  $c->tx->res->headers->server($conf->{server});
  
  $c->res->code($conf->{code});
  $c->redirect_to($url);
};

app->mode($conf->{mode})->start;