package Proxy;
use Mojo::Base -base;
use UA;
use Model::Proxy;

has qw(dbh);
has ua => sub { 
  UA->new(
    #~ name=>'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0',
    name=>'SuperAgent 0.07',
    max_redirects=>0,
    proxy_not => ['hideme.ru'],
    #~ connect_timeout=>30,
    #~ debug=>1,
    max_try=>3,
  );
};

has proxy_url => 'http://hideme.ru/proxy-list/?type=45#list';
has check_url => 'https://discogs.com/blunder-bus-for-worlds-';

has model => sub {  Model::Proxy->new(dbh=>shift->dbh); };

sub proxy_list {
  my $self = shift;
  $self->model->proxy_list;
}


sub proxy_load {# загрузка списка
  my $self = shift;
  my $res = $self->ua->request('get', $self->proxy_url,);
  die sprintf("Ошибка запроса [%s] списка проксей: %s", $self->proxy_url, $res)
    unless ref $res;
  my $sth_new = $self->model->sth('new proxy');
  my $sth_get = $self->model->sth('get proxy');
  $res->dom->find('table.proxy__t tbody tr')->map(sub {
    my $ip = $_->at('td.tdl');
    my $port = $ip->next_node;
    my $type = lc((split /,/, $_->child_nodes->[-3]->content)[-1]) ;
    my $proxy = $ip->content.':'.$port->content;
    #~ return [$ip->content, $port->content, $type->content];
    $self->dbh->selectrow_hashref($sth_new, undef, ($proxy, $type)) # смотри запрос! не вставит дубль
      || $self->dbh->selectrow_hashref($sth_get, undef, $proxy);
    
  })->each;
}

sub use_proxy {
  my $self = shift;
  my $r = $self->model->use_proxy
    || ($self->proxy_load && $self->model->use_proxy);
  #~ $self->render(json=>$r);
  #~ $self->check_proxy($r);
  return 'socks://' . $r->{proxy};
}

sub check_proxy {
  my ($self, $proxy) = @_;
  my $save_proxy = $self->ua->ua->proxy->https;
  #~ my $schema = lc((split /,/, $proxy->{type})[-1]);
  $self->ua->ua->proxy->https($proxy);
  my $res = $self->ua->request('get', $self->check_url. (rand =~ /(\d{3,7})/)[0],);
  $self->ua->ua->proxy->https($save_proxy);
  #~ die sprintf("Ошибка запроса [%s] проверки прокси: %s", $self->check_url, $res)
  #~ $self->model->status_proxy(ref $res ? 'G' : 'B', $proxy);
  ref $res ? $self->good_proxy($proxy)
    : $self->bad_proxy($proxy);
  #~ return $self->dumper();
    #~ unless ref $res;
  #~ $res->code;
}

sub good_proxy {
  my ($self, $proxy) = @_;
  $proxy = ( $proxy =~ /([\d\.]+:\d+)$/ )[0]
    or return;
  $self->model->status_proxy('G', $proxy);
}

sub bad_proxy {
  my ($self, $proxy) = @_;
  $proxy = ( $proxy =~ /([\d\.]+:\d+)$/ )[0]
    or return;
  $self->model->status_proxy('B', $proxy);
}



1;