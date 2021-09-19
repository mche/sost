package  Controll::Terminal;
use Mojo::Base 'Mojolicious::Controller';
use Terminal;
use IO::File;

=pod

=head1 SEE ALSO

  https://github.com/Prajithp/mojo-terminal

=cut

sub index {
    my $self = shift;
    $self->render(
        template => 'terminal/index',
        handler=>'ep',
        'header-title' => 'Консоль /bin/bash',
        assets=>["terminal.css",]
    );
};

sub websocket {
    my $self = shift;

    Mojo::IOLoop->stream( $self->tx->connection )->timeout(0);

    my $terminal = Terminal->new( cmd => '/bin/bash', app => $self->app );

    $terminal->on(
        row_changed => sub {
            my ( $event, $message ) = @_;

            $self->send(
                { json => { stdout => $message, type => 'terminal' } } );
        }
    );

    $self->on(
        json => sub {
            my ( $self, $message ) = @_;

            if ( exists $message->{'screen'} ) {
                my $screen = $message->{'screen'};

                $self->app->log->debug(
                    "setting screen size to $screen->{'rows'} X  $screen->{'cols'}"
                );
                $terminal->resize( $screen->{'rows'}, $screen->{'cols'} );
            }

            $terminal->write( $message->{'stdin'} )
                if exists $message->{'stdin'};
        }
    );

    $self->on(
        finish => sub {
            $self->app->log->debug('Client disconnected');
            $terminal->cleanup();
        }
    );

    $terminal->start() unless $terminal->is_spawned;
};

1;
