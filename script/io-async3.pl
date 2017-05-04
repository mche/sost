use IO::Async::Listener;
#~ use IO::Socket::UNIX;
use IO::Async::Loop;

my $socket_path = '/tmp/mytest.sock';
unlink $socket_path if -e $socket_path;


my $loop = IO::Async::Loop->new;
 
my $listener = IO::Async::Listener->new(
   on_stream => sub {
      my ( undef, $stream ) = @_;

#~ my $socket = $stream->read_handle;
      #~ my $peeraddr = $socket->peerhost . ":" . $socket->peerport;
 
      #~ print STDERR "Accepted new connection from $peeraddr\n";

      $stream->configure(
         on_read => sub {
            my ( $self, $buffref, $eof ) = @_;
            #~ $self->write("HTTP/1.1 301 Moved\n");
            #~ $self->write("Location: http://1.2.3.4/5/6.html\n");
            $self->write("HTTP/1.1 200 OK\r\n");
              $self->write("Content-Type: text/html;charset=UTF-8\r\n");
              $self->write("Content-Length: 10\r\n");
              $self->write("Conection: close\r\n");
              $self->write("\r\n");
              $self->write("123456789\n");
            #~ warn "read buffer: $$buffref";
            #~ $self->write( $$buffref );
            $$buffref = "";
            #~ $stream->close_when_empty
              #~ if $eof;
            return 0;
         },
         on_read_eof => sub {
            my ( $self, ) = @_;
            #~ warn "on_read_eof => @_";
            0;},
         #~ on_write_eof => sub {warn "close @_"; shift->close;},
         #~ close_on_read_eof => 0,
      );
 
      $loop->add( $stream );
   },
);
 
$loop->add( $listener );
 
#~ my $socket = IO::Socket::UNIX->new(
   #~ Local => $socket_path,
   #~ Listen => 1,
#~ ) or die "Cannot make UNIX socket - $!\n";
 
$listener->listen(
   #~ handle => $socket,
   addr => {
      #~ family   => "unix",
      #~ socktype => "stream",
      #~ path     => $socket_path,
      
      family   => "inet",
      socktype => "stream",
      port     => 8008,
      ip       => "127.0.0.1",
   },
  on_resolve_error => sub { print STDERR "Cannot resolve - $_[0]\n"; },
  on_listen_error  => sub { print STDERR "Cannot listen - @_\n"; },
);
 
$loop->run;