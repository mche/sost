package Controll::Video;
use Mojo::Base 'Mojolicious::Controller';

#~ has model => sub { $_[0]->app->models->{'Видео'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has pubsub => sub { $_[0]->app->models->{'PubSub'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };



sub cam1 {
  my $c = shift;
  #~ my $cam1 = $c->app->cam1;
  
  return $c->render('видео/cam1',
    handler=>'ep',
    'header-title' => 'Камера Вход 1',
    #~ stylesheets=>["uploader.css",],# 'js/dist/аренда/договор-форма.css',
    #~ assets=>["аренда.js",],# 'js/dist/аренда/договор-форма.js' 'lib/v-calendar/dist/v-calendar.umd.js'],#'lib/v-calendar/dist2/lib.js',
    );
}

sub ws_feed {
  my $ws = shift;
  #~ $ws->inactivity_timeout(300);# переподключение вебсокета
  $ws->tx->with_protocols('binary', 'null');# null - google chrome!
  
  my $feed = $ws->param('feed')
    or return $ws->send({json   => {error=>"none param feed?"}});#=> sub { $ws->log->error("Sended", $ws->req->headers->user_agent)});
  
  my $r = $ws->model->subws($ws, $feed);
  return $ws->send({json   => {error=>$r}})
    unless ref $r;
  
  $ws->on(
    finish => sub {
      #~ my( $ws, $code, $reason ) = @_ ;
      $ws->model->unsubws($ws, $feed);
    }
  );
  
}



=pod
sub ws_feed {
  my $c = shift;
  $c->log->error('cam1 websocket start', $c->app->cam1 // '');
  
  $c->inactivity_timeout(3600);
  
  my $tx = $c->tx;
  $tx->with_protocols('binary');
  
  #~ $c->render_later->on(finish => sub {
    #~ $c->log->error('cam1 websocket closed');
  #~ });
  
  $tx->on(finish => sub {
    $c->log->error('cam1 websocket tx finish');
  });
  
  $tx->on(read => sub {
      my ($x, $bytes) = @_;
      #~ $tx->send({binary => $bytes});
      $c->log->error('tx read ' . length($bytes));
  });
  
  return;
  
  my $pipe = $c->app->cam1
    || return $tx->send({binary => '0000000000000'});
  
  my $stream = Mojo::IOLoop::Stream->new($pipe);
  
  $stream->on(bytes => sub  {
    my ($stream, $bytes) = @_;
    warn 'stream bytes', length($bytes);
  });
  $stream->on(read => sub  {
    my ($stream, $bytes) = @_;
    warn 'stream read', length($bytes);
  });
  $stream->on(close => sub  {
    my ($stream) = @_;
    $c->log->error('stream closed', $stream);
  });
  $stream->on(error => sub  {
    my ($stream, $err) = @_;
    $c->log->error('stream error', $stream, $err);
    
  });
   
  # Start and stop watching for new data
  $stream->start;
  #~ $stream->stop;
   
  # Start reactor if necessary
  $stream->reactor->start unless $stream->reactor->is_running;
  
  #~ $c->app->ua->on('видеопоток /ffmpeg/cam1'=>sub {
    #~ my ($ua, $chunk)  = @_;
    #~ $c->log->error('on видеопоток /ffmpeg/cam1', length($chunk));
    #~ warn 'on видеопоток /ffmpeg/cam1 ', $ua, length($chunk);
    #~ $tx->send({binary => $chunk});
  #~ });
  
  #~ Mojo::IOLoop->delay->begin;
  #~ Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
}
=cut

sub pubsub1 {
  my $c = shift;
  return $c->render('видео/pubsub1',
    handler=>'ep',
    'header-title' => 'Оповещения',
    #~ stylesheets=>["uploader.css",],# 'js/dist/аренда/договор-форма.css',
    #~ assets=>["аренда.js",],# 'js/dist/аренда/договор-форма.js' 'lib/v-calendar/dist/v-calendar.umd.js'],#'lib/v-calendar/dist2/lib.js',
    );
}

sub ws_pubsub {
  my $c = shift;
  $c->inactivity_timeout(3600);
  my $custom = $c->param('custom');
  $c->pubsub->listen('channel');
  $c->pubsub->listen($custom)
    if $custom;
  $c->{chans} = ['channel', $custom // ()];
  
  my $n = $c->pubsub->subws($c);
  $c->on(finish => sub { shift->pubsub->unsubws($n) });
}

=pod
sub ffmpeg_cam1 {
  my $c = shift;
  $c->log->error('ffmpeg cam', $c->dumper($c->req));
  $c->inactivity_timeout(3600);
  $c->req->max_message_size(0);
  $c->render_later->on(finish => sub { $c->log->error('ffmpeg cam1 stream closing') });
  my $tx = $c->tx;
  #~ $tx->with_protocols('binary');
  
  $tx->on(read => sub {
      my ($x, $bytes) = @_;
      #~ $tx->send({binary => $bytes});
      $c->log->error('tx read ' . length($bytes));
  });
  
  $tx->on(binary => sub {
      my ($tx, $bytes) = @_;
      #~ $tcp->write($bytes);
      $c->log->error('tx binary ' . length($bytes));
  });
  
  $tx->on(finish => sub {
    $c->log->error('ffmpeg cam tx finish');
    undef $tx;
  });
}
=cut



1;