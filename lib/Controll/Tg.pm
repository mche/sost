package Controll::Tg;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Tg'}};

sub webhook {
  my $c = shift;
  my $token = $c->stash('token');
  
  $c->app->log->error("Bad Tg token=[$token]")
    and $c->reply->not_found
    unless $token eq $c->app->config->{'tg UniOST bot token'};
  
  my $data = $c->req->json;
  
  $c->app->log->info($c->dumper($data));
  
  $c->render(json=>{"ok"=>1});
}

1;