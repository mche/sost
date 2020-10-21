package Model::Video;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Video.pm.dict.sql'];

has [qw(app)];

has cam1 => qq(ffmpeg  -i 'rtsp://192.168.128.18:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0 -s 1280x720   - 2>/dev/null |); #-s 1280x720 -crf  50 -an 
has cam11 => qq(ffmpeg  -i 'rtsp://192.168.128.11:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0  -s 1280x720 - 2>/dev/null |); #-s 1280x720 -crf  50 -an 
has cam12 => qq(ffmpeg  -i 'rtsp://192.168.128.12:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0 -s 1280x720  - 2>/dev/null |); #-s 1280x720 -crf  50 -an 
has cam14 => qq(ffmpeg  -i 'rtsp://192.168.128.14:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0 -s 1280x720  - 2>/dev/null |);
has cam15 => qq(ffmpeg  -i 'rtsp://192.168.128.15:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0 -s 1280x720  - 2>/dev/null |); #-s 1280x720 -crf  50 -an 
has cam16 => qq(ffmpeg  -i 'rtsp://192.168.128.16:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k   -bf 0 -s 1280x720   - 2>/dev/null |); #-crf  50 -an 
has cam17 => qq(ffmpeg  -i 'rtsp://192.168.128.17:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k -s 1280x720  -bf 0   - 2>/dev/null |); 
#~ has cam18 => qq(ffmpeg  -i 'rtsp://192.168.128.18:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k -s 1280x720  -bf 0   - 2>/dev/null |); 
has cam19 => qq(ffmpeg  -i 'rtsp://192.168.128.19:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k -s 1280x720  -bf 0   - 2>/dev/null |); 
has cam20 => qq(ffmpeg  -i 'rtsp://192.168.128.20:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1300k -s 1280x720  -bf 0   - 2>/dev/null |); 

# https://ffmpeg.org/ffmpeg-filters.html#xstack
#~ has cams => qq(ffmpeg -i 'rtsp://192.168.128.16:554/user=admin&password=&channel=1&stream=0.sdp?'  -i 'rtsp://192.168.128.19:554/user=admin&password=&channel=1&stream=0.sdp?' -i 'rtsp://192.168.128.20:554/user=admin&password=&channel=1&stream=0.sdp?' -i 'rtsp://192.168.128.17:554/user=admin&password=&channel=1&stream=0.sdp?'   -filter_complex "xstack=inputs=4:layout=0_0|0_h0|0_h0+h1|0_h0+h1+h2" -f mpegts -codec:v mpeg1video  -s 1280x2160 -bf 0 - 2>/dev/null |); #[0:v]scale=1920:-1 [s0]; [3:v]scale=1920:-1 [s3] ;   [s0][1:v][2:v][s3]xstack=inputs=4:layout=0_0|0_h0|0_h0+h1|0_h0+h1+h2 тут масштабируеются две (0 и 3 инпуты) из 4х камер до ширины 1920 () и все в один столбик РАЗМЕР! не более 4095!!! для этого кодека

has feeds => sub {
  my $self = shift;
  my $feeds = {};
  
  map {
    my $cam = $self->stream($self->$_);
    $self->start_feed($_, $cam, $feeds);
    
  } qw(cam1 cam11 cam12 cam14 cam15 cam16 cam17 cam19 cam20);

  
  return $feeds;
};

has clients => sub { {} };

has restart_timeout => 3;

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
    $app->log->info("Feed [$name] $stream closed, and restarting...");
      $self->restart_timeout($self->restart_timeout +1 );
     Mojo::IOLoop->timer($self->restart_timeout => sub {
        my $cam = $self->stream($self->$name);#cam_ip10
        $self->start_feed($name, $cam);
      });
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