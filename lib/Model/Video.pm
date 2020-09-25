package Model::Video;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Video.pm.dict.sql'];

has [qw(app)];

has cam1 => qq(ffmpeg  -i 'rtsp://192.168.128.10:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0   - 2>/dev/null |); #-s 1280x720 -crf  50 -an 


has feeds => sub {
  my $self = shift;
  my $feeds = {};
  
  my $cam1 = $self->stream($self->cam1);
  $self->start_feed('cam1', $cam1, $feeds);
  
  return $feeds;
};

has clients => sub { {} };

sub init {
  my $self = shift;
  #~ $self->disable_destroy(1);
  #~ $self->feeds; ## до форка не надо
  #~ $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->info("$self->initing ".);
  my $server = $self->app->сервер; # в хуке before_server_start
  if ($server->isa('Mojo::Server::Prefork')) {
    $server->on(finish => sub {
      #~ $self->destroy;
      die;
    });
  } elsif ($server->isa('Mojo::Server::Daemon')) {
    $server->ioloop->on(finish => sub {
      #~ $self->destroy;
      die;
    });
  }
  return $self;
}

sub stream {# создать поток
  my ($self, $cmd) = @_;
  open my $pipe, $cmd     or die "cant run [$cmd]: $!"; 
  binmode($pipe);
  my $stream = Mojo::IOLoop::Stream->new($pipe);
  $stream->start;
  
  return $stream;
}

sub start_feed {
  my ($self, $name, $stream, $feeds) = @_;
  my $app = $self->app;
  
  $app->log->info("Feed [$name] $stream started");
  
  $feeds ||= $self->feeds;#{'cam1'=>{tx=>$cam1, clients=>{},}};
  $feeds->{$name} = $stream;
  
  $stream->on(error => sub  {
    my ($stream, $err) = @_;
    $app->log->info("Feed [$name] $stream failed: [$err]");
  });
  
  #~ $stream->on(timeout => sub {
    #~ my ($stream) = @_;
    #~ $app->log->info("Feed [$name] $stream timeout");
  #~ });
  
  $stream->on(close => sub {# перезапустить поток
    #~ my ($stream) = @_;
    $app->log->info("Feed [$name] $stream close, restarting...");
    my $cam = $self->stream($self->$name);#cam_ip10
    $self->start_feed($name, $cam);
    #~ $_->finish
      #~ for values %$clients;
  });
  
  $stream->on(read => sub {
    my ($stream, $bytes) = @_;
      #~ warn "got bytes ", length($bytes);
      $_->tx->send({binary => $bytes})
          for (values %{$self->clients->{$name}});
  });
  
  return $feeds->{$name};
}

sub subws {
  my ($self, $ws, $feed) = @_;
  $ws->log->info("Client connect try feed=$feed, now feeds=[@{[ keys %{ $self->feeds} ]}]");
  
  my $stream = $self->feeds->{$feed}
    or return " no yet feed=[$feed]";#.$ws->param('feed')
  
  $self->clients->{$feed}{"$ws"} = $ws;
  $ws->log->info("Client connected: $ws; to: ".$stream. "; clients: @{[ scalar keys %{ $self->clients->{$feed} } ]}");
  return $stream;
}

sub unsubws {
  my ($self, $ws, $feed) = @_;
  
  delete $self->clients->{$feed}{ "$ws" };
  $ws->log->info("Client disconnected: $ws; clients: @{[ scalar keys %{ $self->clients->{$feed} } ]}");
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