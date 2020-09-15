package Model::PubSub;
use Mojo::Base 'Model::Base';

#~ our $DATA = ['Video.pm.dict.sql'];

has [qw(app)];
has pubsub=> sub {
  state $p = $_[0]->dbh->pg->pubsub;#->listen('channel');
  #~ $p->listen('channel');
  #~ $_[0]->app->log->error($p);
  #~ return $p;
};
has ws => sub { [] };
has chans => sub { {} };

sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->error($self->dict->render('extra foo'));
  #~ return $self;
}


sub listen {
  my $self = shift;
  my $channel = shift;
  
  $self->pubsub
    ->json($channel)
    ->listen($channel => sub {
    my ($pubsub, $payload) = @_;
    $payload->{channel} = $channel;
    $payload->{time} = time;
    
    $_->send($self->app->json->encode( $payload))
      for grep $channel ~~ $_->{chans}, @{$self->ws};# grep etc
  })
    unless $self->chans->{$channel}++;
  $self;
}

# Subcribe/unsubscribe websockets
sub subws {
  my ($self, $ws) = @_;
  my $n = push @{$self->ws}, $ws;
  #~ $self->pubsub->notify($_ => {msg=>sprintf("Подписан вебсокет [%s]\t #%s\t pid %s", $ws, $n, $$),})
    #~ for @{$ws->{chans}};
  return $n;
}
sub unsubws {
  my ($self, $n) = @_;
  my $ws = splice(@{$self->ws}, $n - 1, 1);
  $self->pubsub->notify($_ => {msg=>sprintf("Отписан вебсокет [%s]\t #%s\t pid %s", $ws, $n, $$)})
    for @{$ws->{chans}};
}


1;

__DATA__

@@ 1
1;