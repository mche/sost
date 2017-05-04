use Mojolicious::Lite;
use Mojo::Util qw(dumper);
 
app->config(hypnotoad => {
  #~ listen => ['http://*:8088'],
  #~ workers => 5,
  pid_file => 'hypnotoad-8080.pid'
});
 
#~ get '/' => {text => };

get '/' => sub {
  my $c = shift;
  my $session = $c->session;
  #~ $c->app->log->info(dumper $session)
    #~ if $session;
  $session->{foo}++;
  $c->render(text => "<div>ALL GLORY TO GLORIA! $session->{foo}</div>");
};

app->mode('development');
app->log->level('info');
app->secrets(['My secret passphrase ok']);
app->start;