package Discogs::Base;
use Mojo::Base::Che -base;
use Dbh;
use UA;
use Model::Discogs;
use Getopt::Long;
binmode(STDOUT, ":utf8");
binmode(STDERR, ":utf8");
#~ use Mojo::Util qw(html_unescape);

=pod

Базовый класс для работы модулей с сайтом дискогса

=cut

# хазы Getopt::Long
has [qw(debug year limit timeout count loop sms proxy proxy_config_file ua_max_try release_id master_id pg_host pg_port pg_user pg_dbname)];

has pg_max_connections => 1;
has pg_schema => 'discogs';

has dbh => sub {
  my $self=shift;
  Dbh->connect(map {$_=>$self->$_} grep $self->$_, qw(pg_host pg_port pg_user pg_dbname))->max_connections($self->pg_max_connections);
};

has ua => sub {shift->_ua};

# !!! в img.pl еще прокси ->ua_img($DI->ua_proxy);
#~ has ua_img => sub {shift->_ua}; #UA->new

has base_url => 'https://www.discogs.com';
has base_covers_dir => '/mnt/media/share/images/covers';

has model => sub {my $self = shift; Model::Discogs->new(pg_schema=>$self->pg_schema); };

sub _ua {
  my $self = shift;
  my $ua = UA->new;
  $ua->proxy($self->proxy)
    if $self->proxy;
  require Proxy
    and $ua->proxy_handler(Proxy->new(dbh=>$self->dbh))
    if $self->proxy_handler;
  #~ $ua->ua->proxy->http($self->proxy)->https($self->proxy) #
    #~ if $self->proxy;
  
  $ua->debug($self->debug)
    if $self->debug;
  
  $ua->max_try($self->ua_max_try)
    if $self->ua_max_try;
  
  $ua;
}

my %opt = (
  year=>undef,
  limit=>1, # sql
  timeout=>1,
  count => 0, # count(r.*) as cnt
  loop => 1,
  sms=>undef,# номер телефона
  release_id=>undef,
  master_id=>undef,
  proxy=>undef, #'socks://127.0.0.1:9050'
  proxy_config_file=>undef, # см. Mojo::UA::Che->new(proxy_module_has=>{config_file=>shift->proxy_config_file})
  debug=>undef,
);

sub new {
  my $self = shift->SUPER::new(@_);
  Model::Discogs->singleton(dbh=>$self->dbh);
  return $self;
}

sub new_opt {
  GetOptions (\%opt, 'year=i', 'limit=i', 'timeout=i', 'count', 'loop=i', 'sms=s', 'release_id=i', 'master_id=i', 'proxy=s', 'proxy_config_file=s', 'pg_host=s', 'pg_port=i', 'pg_dbname=s', 'pg_user=s',  'pg_schema=s','debug=i', 'ua_max_try=i',)       # 
    or die("Error in command line arguments\n");
  my $self = shift->new(%opt);
  #~ Model::Discogs->singleton(dbh=>$self->dbh);
  return $self;
}



#~ sub _html_unescape {shift; html_unescape shift;}

1;