use Mojolicious::Lite;

plugin Config => {
  default => {
    hypnotoad => {
      listen => ["http://127.0.0.1:8081",],
      #~ workers => 1
    }
  }
};

app->log->path('log/mojo.log');
app->log->level('debug');

get '/' => sub {
  my $c = shift;
  #~ $c->inactivity_timeout(60);
  sleep 30;
  $c->render(text => 'Hypnotoad!');
  
  
};

app->start;