use IO::Async::Loop;
#~ use IO::Socket::UNIX;

my $loop = IO::Async::Loop->new;

# Создание объекта уведомителя MyListener,
# производного от IO::Async::Listener
my $myl = MyListener->new;

$loop->add($myl);

my $socket_path = '/tmp/mytest.sock';
unlink $socket_path if -e $socket_path;

#~ my $socket = IO::Socket::UNIX->new(
   #~ Local => $socket_path,
   #~ Listen => 1,
#~ ) or die "Cannot make UNIX socket - $!\n";
 

$myl->listen(
    #~ family   => "unix",
    #~ socktype => "stream",
    #~ service  => '/tmp/mytest.sock',
    #~ handle => $socket,
    addr => {
      family   => "inet",
      socktype => "stream",
      port     => 8008,
      ip       => "127.0.0.1",
   },
    on_resolve_error => sub { print STDERR "Cannot resolve - $_[0]\n"; },
    on_listen_error  => sub { print STDERR "Cannot listen\n"; },
);

$loop->run;

# Собственный модуль обработки потока
package MyListener;

# Наследуем от класса IO::Async::Listener
use base qw( IO::Async::Listener );

# Реализуем метод on_stream, вызываемый при подключении клиента
sub on_stream {
    my ($self, $stream) = @_;
    
my $socket = $stream->read_handle;
      my $peeraddr = $socket->peerhost . ":" . $socket->peerport;
 
      print STDERR "Accepted new connection from $peeraddr\n";

    $stream->configure(
        on_read => sub {
            #~ my ( $self, $buffref, $eof ) = @_;
            #~ warn "read - $$buffref";
            #~ $self->write( $$buffref );
            #~ $$buffref = "";

      my ( $self, $buffref, $eof ) = @_;
 
      while( $$buffref =~ s/^(.*\n)// ) {
         warn "Received a line $1";
      }
 
      if( $eof ) {
         warn "EOF; last partial line is $$buffref\n";
      }
 
            return 0;
         },
        #~ close_on_read_eof => 0
    );

    # Добавляем поток в цикл
    $self->loop->add( $stream );

    # Возвращается Future-объект для операции чтения потока до EOF
    my $f = $stream->read_until_eof;

    # Функция-колбек при завершении операции
    $f->on_done(sub {
        my ($buf, $eof) = @_;

        #~ while( $buf =~ s/^(.*)\n// ) {
            #~ $stream->write("\n".$1);
        #~ }
        warn "done $buf";
        
        #~ $stream->write("HTTP/1.1 301 OK\n");
        #~ $stream->write("Location: http://1.2.3.4/5/6.html\n");
      #~ $stream->write("Content-Type: text/html;charset=UTF-8\n");
      #~ $stream->write("\r\n");

        $stream->close_when_empty() if $eof;
        return 0;
    });
}

1;


__END__
sub on_stream {
    my ($self, $stream) = @_;

    $stream->configure(
        on_read => sub { 0 },
        close_on_read_eof => 0
    );

    # Добавляем поток в цикл
    $self->loop->add( $stream );

    # Возвращается Future-объект для операции чтения потока до EOF
    my $f = $stream->read_until_eof;

    # Функция-колбек при завершении операции
    $f->on_done(sub {
        my ($buf, $eof) = @_;

        while( $buf =~ s/^(.*)\n// ) {
            $stream->write("\n".$1);
        }

        $stream->close_when_empty() if $eof;
        return 0;
    });
}