package UA;
use Mojo::Base::Che -base;
use Mojo::UserAgent;
use Mojo::Util;
#~ binmode(STDOUT, ":utf8");
#~ binmode(STDERR, ":utf8");

#text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
has headers => sub { {Accept=>'*/*', 'Accept-Encoding'=>'gzip, deflate', 'Accept-Language'=>'en-US;q=0.8,en;q=0.6', 'Cache-Control'=>'max-age=0', }};#Connection=>'keep-alive',

my @ua_name = (
#http://digitorum.ru/blog/2012/12/02/User-Agent-Poiskovye-boty.phtml
#~ 'curl/7.22.0 (x86_64-pc-linux-gnu) libcurl/7.22.0 OpenSSL/1.0.1 zlib/1.2.3.4 libidn/1.23 librtmp/2.3',
  #~ 'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0',
#~ 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
#~ 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)',
'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'Googlebot-Video/1.0',
  'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  'Mozilla/5.0 (compatible; YandexMedia/3.0; +http://yandex.com/bots)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  
);

has name => sub {$ua_name[rand @ua_name];};

has max_redirects => 3;

has max_try => 3; # цикл попыток

has ua => sub {shift->new_ua};

has debug => 0;

has [qw'proxy_handler proxy connect_timeout'];

has proxy_not => sub {[]};

sub merge_headers {
  my $self = shift;
  return $self->headers
    unless (scalar @_ > 1) || defined $_[0];
  my %h = @_;
  @h{ keys %{ $self->headers } } = values %{ $self->headers };
  \%h;
}

sub new_ua {
  my $self = shift;
  my $ua = Mojo::UserAgent->new;
  # Ignore all cookies
  $ua->cookie_jar->ignore(sub { 1 });
  $ua->max_redirects($self->max_redirects);
  # Change name of user agent
  $ua->transactor->name($self->name);
  $ua->proxy->http($self->proxy)->https($self->proxy) #
    if $self->proxy;
  $ua->proxy->not($self->proxy_not)
    if $self->proxy_not;
  
  $ua->connect_timeout($self->connect_timeout)
    if $self->connect_timeout;
  $ua;
}

sub request {
  my $self = shift;
  
  my $ua_proxy = $self->ua->proxy;
  
  my $res;
  for (1..$self->max_try) {
    
    $self->change_proxy
      or warn "Не смог выставить прокси через proxy_handler"
      and return
      if ! ($ua_proxy->https ||  $ua_proxy->http) && $self->proxy_handler;
    
    $res = $self->_request(@_);
    
    if (ref $res || $res =~ m'404') {
      $self->proxy_handler->good_proxy($ua_proxy->https ||  $ua_proxy->http)
        if $self->proxy_handler;
      return $res;
    }
    elsif ($res =~ m'429|403') {
      last
        if  $self->proxy_handler;
      die "Бан $res";
    }
    
    print STDERR " попытка @{[$_+1 ]} причина[$res]...\n"
      unless $_ eq $self->max_try;
  }
  
  $self->change_proxy($ua_proxy->https ||  $ua_proxy->http)
    and return $self->request(@_);
  
  return $res;
}

sub change_proxy {
  my $self = shift;
  my $handler = $self->proxy_handler
    or return;
  
  my $proxy = shift;# || $self->ua->proxy->https ||  $self->ua->proxy->http;
  
  $handler->bad_proxy($proxy)
    if $proxy;
  
  $proxy = $handler->use_proxy
    or return;
  
  print STDERR "Поменял прокси [$proxy]\n"
    if $self->debug;
  
  $self->ua->proxy->http($proxy)->https($proxy);
  
  
}

sub _request {
  my ($self, $meth, $url, $headers) = map(shift, 0..3);
  my $ua = $self->ua;
  my ($res);
  
  print STDERR "Запрос $meth $url ..."
    if $self->debug;
  
  my $delay = Mojo::IOLoop->delay(
    sub { 
      my $delay = shift;
      $ua->$meth($url => $self->merge_headers(%$headers), @_, $delay->begin);
    },
    sub {
      my ($delay, $tx) = @_;
      
      #~ print STDERR &Mojo::Util::dumper($tx->req)
      $self->dump($tx->req)
        if $self->debug && $self->debug eq '2';
      
      unless ($tx && $tx->success) {
        my $err = $tx->error;
        $res = $err->{code} || $err->{message};
        utf8::decode($res);
        #~ print STDERR  "не смог: $res\n"
          #~ if $self->debug;
        
        $self->dump($tx->req)
          and die "Критичная ошибка"
          if $res =~ /отказано/ && !$self->proxy_handler;
        
        return $res;
      }
      
      $res = $tx->res;
    },
  );
  $delay->wait unless $delay->ioloop->is_running;
  $res;
}

sub dump {shift; say STDERR &Mojo::Util::dumper(@_);}

=pod
# Non-blocking request
$ua->get('mojolicious.org' => sub {
  my ($ua, $tx) = @_;
  say $tx->res->dom->at('title')->text;
});
Mojo::IOLoop->start unless Mojo::IOLoop->is_running;

any '/all' => sub {
  my $self = shift;
  $self->render_later;
  my $delay = Mojo::IOLoop->delay;
  $delay->on(finish => sub{
    my $delay = shift;
    my @titles = map { $_->res->dom->at('title')->text } @_;
    $self->render_dumper(@titles);
  });
  $self->ua->get( $_ => $delay->begin ) for @urls;
};

my $delay = Mojo::IOLoop->delay(
  sub { 
    my $delay = shift;
    $self->ua->get($url, $delay->begin);
  },
  sub {
    my ($delay, $tx) = @_;
    return $self->render_exception(scalar $tx->error)
      unless $tx->success;

    my $tweets = $tx->res->dom('li.js-stream-item .tweet .content');
    my $items  = $tweets->map(sub{$self->parse_tweet($_)});  

    $self->res->headers->cache_control("max-age=$max_age");
    $self->render( 'atom', format => 'rss', user => $user, items => $items );
  }
);
$delay->wait unless $delay->ioloop->is_running;

=cut

1;