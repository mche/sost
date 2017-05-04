use IO::Socket::INET;
use IO::Async::Handle;
use IO::Async::Stream;
use IO::Async::Loop;

use IO::Socket::UNIX;

my $socket_path = '/tmp/mytest.sock';
unlink $socket_path if -e $socket_path;



my $loop = IO::Async::Loop->new;

# Создание сокета, ожидающего соединения на порт 1234
#~ my $socket = IO::Socket::INET->new( LocalPort => 1234, Listen => 1, ReuseAddr=>1 );
my $socket = IO::Socket::UNIX->new(
    Local  => $socket_path,
    #~ Type   => SOCK_STREAM,
    #~ Listen => SOMAXCONN,
    #~ ReuseAddr=>1
    Listen => 1,
) or die "Can't create socket: $!" unless $socket;

# Создание хендла для наблюдения за сокетом
my $handle = IO::Async::Handle->new(
    handle => $socket,
    on_read_ready  => sub {
      warn "start read @_";

        # Новое подключение. Вызов accept() на сокете
        my $client = $socket->accept or die $!;
        warn "client $client";

        # Создание потокового сервера
        my $stream; $stream = IO::Async::Stream->new(
            handle => $client,
            close_on_read_eof => 0,
            #~ autoflush => 1,

            # Читаем полученные данные
            on_read => sub {
              my ( $self, $buffref, $eof ) = @_;
              
              #~ $stream->write("HTTP/1.1 200 OK\n");
              #~ $stream->write("Content-Type: text/html;charset=UTF-8\n");
              #~ $stream->write("\r\n");

              # Читаем данные из буфера построчно
              # Пишем данные ответа в выходной буфер потока
              while( $$buffref =~ s/^(.*)\n// ) {
                 #~ $stream->write(scalar reverse "\n".$1);
                 $stream->write("\n".$1);
              }

              # Если получен EOF, то закрываем соединение,
              # как только все данные будут отправлены
              $stream->close_when_empty() if $eof;

              # не вызывать повторно эту функцию после EOF
              return 0;
           },
           on_outgoing_empty => sub {warn "on_outgoing_empty: @_";},
        );
        
        warn "stream $stream";

        # Добавляем поток в цикл
        $loop->add( $stream );
    },
    
    on_write_ready => sub {warn "write is ready"; 1;},
#~ A write handle was provided but neither a on_write_ready callback nor an ->on_write_ready method were. Perhaps you mean 'read_handle' instead? at /home/guest/LoviGazelle.ru/script/io-async.pl line 47.

);

# Добавление хендла в цикл
$loop->add( $handle );

# Запуск цикла
$loop->run