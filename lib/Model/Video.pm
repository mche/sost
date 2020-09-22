package Model::Video;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Video.pm.dict.sql'];

has [qw(app)];

has cam_ip10 => sub {
  my $self = shift;
  open my $pipe, qq(ffmpeg  -i 'rtsp://192.168.128.10:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0   - 2>/dev/null |)      or return;#die "cannot run command: $!";-s 1280x720 -crf  50 -an 
  binmode($pipe);
  my $stream = Mojo::IOLoop::Stream->new($pipe);
  $stream->start;
  $self->app->log->info("Feed [cam1] $stream started");
  return $stream;
  #~ return $pipe;
};

has feeds => sub {
  my $self = shift;
  my $app = $self->app;
  my $cam1 = $self->cam_ip10;
  
  #~ my $clients = $self->clients->{'cam1'} = {};
  
  my $feeds = {'cam1'=>{tx=>$cam1, clients=>{},}};
  
  $cam1->on(read => sub {
    my ($stream, $bytes) = @_;
      #~ warn "got bytes ", length($bytes);
      $_->tx->send({binary => $bytes})
          for (values %{$feeds->{'cam1'}{clients}});
  });
  return $feeds;
};

#~ has clients => sub { {} };

#~ has disable_destroy => 0;#  пропускать DESTROY когда init 

sub init {
  my $self = shift;
  #~ $self->disable_destroy(1);
  #~ my $quit = $SIG{QUIT};
  #~ $SIG{QUIT} = sub { $self->DESTROY(); $quit->(); };
  #~ my $usr2 = $SIG{USR2};
  #~ $SIG{USR2} = sub { $self->DESTROY(); $usr2->(); };
  #~ $self->feeds; ## до форка не надо
  #~ $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->info("$self->initing ".);
  my $server = $self->app->сервер; # в хуке before_server_start
  if ($server->isa('Mojo::Server::Prefork')) {
    $server->on(finish => sub {
      $self->destroy;
    });
  } elsif ($server->isa('Mojo::Server::Daemon')) {
    $server->ioloop->on(finish => sub {
      $self->destroy;
    });
  }
  return $self;
}

sub subws {
  my ($self, $ws, $feed) = @_;
  $ws->log->info("Client connect try feed=$feed, now feeds=[@{[ keys %{ $self->feeds} ]}]");
  
  $feed = $self->feeds->{$feed}
    or return " no yet feed ";#.$ws->param('feed')
  
  $feed->{clients}{"$ws"} = $ws;
  $ws->log->info("Client connected: $ws; to feed: ".$feed->{tx}. "; clients: @{[ scalar keys %{ $feed->{clients} } ]}");
  return $feed;
}

sub unsubws {
  my ($self, $ws, $feed) = @_;
  
  delete $self->feeds->{$feed}{clients}{ "$ws" };
  $ws->log->info("Client disconnected: $ws; clients: @{[ scalar keys %{ $self->feeds->{$feed}{clients} } ]}");
}

sub destroy {
  my $self = shift;
  #~ sleep 1;
  die; ###!!!! Хе, вот так обрубить
  #~ warn "вырубаем вебсокеты камер", $self->app->dumper(self->clients);
  #~ return;# if $self->disable_destroy;
  #~ $self->app->log->error("DESTROY 2");
  my $feeds = $self->feeds;
    #~ or  $self->app->log->info('Нет фидов камер')
    #~ and return;
  while (my ($path, $feed) = each %$feeds) {
    while (my ($id, $ws) = each %{ $feed->{clients} }) {
      $ws->finish;
      delete $feed->{clients}{$id};
      $self->app->log->info("Client [$id] destroied; clients: @{[ scalar keys %{ $feed->{clients} } ]}");
    }
    delete $feeds->{$path} and   next unless $feed->tx;
    $self->app->log->info("Stream [$path] stopped");
    #~ $feed->tx->stop;
    $feed->tx->close;
    $self->app->log->info("Feed [$path] destroied; feeds: @{[ scalar keys %$feeds ]}");
  }
  
}

1;

__DATA__
@@ 1
ok;