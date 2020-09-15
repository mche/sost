package Model::Video;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Video.pm.dict.sql'];

has [qw(app)];

has cam1 => sub {
  open my $pipe, qq(ffmpeg  -i 'rtsp://192.168.128.10:554/user=admin&password=&channel=1&stream=0.sdp?' -f mpegts -codec:v mpeg1video  -b:v 1200k  -bf 0 -an  -crf  50  - 2>/dev/null |)      or return;#die "cannot run command: $!";-s 1280x720
  binmode($pipe);
  my $stream = Mojo::IOLoop::Stream->new($pipe);
  $stream->start;
  return $stream;
  #~ return $pipe;
};

has feeds => sub {
  my $self = shift;
  my $app = $self->app;
  my $cam1 = $self->cam1;
  
  my $feeds = {'/feed/cam1'=>{tx=>$cam1, clients=>{}}};
  
  $cam1->on(read => sub {
    my ($stream, $bytes) = @_;
      #~ warn "got bytes ", length($bytes);
      $_->tx->send({binary => $bytes})
          for (values %{$feeds->{'/feed/cam1'}{clients}});
  });
  return $feeds;
};

sub init {
  my $self = shift;
  #~ $self->feeds; ## до форка
  #~ $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->error("init Model::Video", $self->dict->render('1'));
  #~ return $self;
}

sub subws {
  my ($self, $feed, $ws) = @_;
  $ws->log->error("Client connect try feed=$feed, now feeds=[@{[ keys %{ $self->feeds} ]}]");
  
  $feed = $self->feeds->{$feed}
    or return " no yet feed ";#.$ws->param('feed')
  
  $feed->{clients}{"$ws"} = $ws;
  $ws->log->error("Client connected: $ws; to feed: ".$feed->{tx}. "; clients: @{[ scalar keys %{ $feed->{clients} } ]}");
  return $feed;
}

sub unsubws {
  my ($self, $feed, $ws) = @_;
  
  delete $self->feeds->{$feed}{clients}{ "$ws" };
  $ws->log->error("Client disconnected: $ws; clients: @{[ scalar keys %{ $feed->{clients} } ]}");
}

sub DESTROY {
  my $self = shift;
  return unless $self->feeds;
  while (my ($path, $feed) = each %{$self->feeds}) {
    while (my ($client, $ws) = each %{ $feed->{clients} }) {
      delete $feed->{clients}{$client};
      $self->app->log->error("Client destroied; clients: @{[ scalar keys %{ $feed->{clients} } ]}");
    }
    $self->app->log->error("Feed [$path] stopped");
    $feed->tx->stop;
    $feed->tx->close;
    delete $self->feeds->{$path};
    $self->app->log->error("Feed [$path] destroied; feeds: @{[ scalar keys %{ $self->feeds } ]}");
  }
  
}

1;

__DATA__
@@ 1
ok;