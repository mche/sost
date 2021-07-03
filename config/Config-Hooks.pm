use Mojo::Base qw(-strict -signatures);


{
  "before_server_start" => [
    sub {
      my ($server, $app) = @_;
      $app->attr( 'сервер' => sub { $server } );# это  пригодится
      #~ $app->log->info("start ".$app->сервер);
      $app->models();
      

      #~ if ($server && $server->isa('Mojo::Server::Prefork')) {
        #~ $server->on(finish => sub {
          #~ $app->log->error("finish $server");
        #~ });
      #~ }
    },
  ],
  "after_build_tx000" => [
    sub {
      my ($tx, $app) = @_;
      # только в куске может определить
      $tx->once('chunk0000'=>sub {##изменить sub Mojo::Server::Daemon::_read выше
        my ($tx, $chunk) = @_;
        my $url = $tx->req->url->to_abs;
        my $feed = $url->path->to_route;
        #~ warn $feed, $tx->req->method;
        return 
          unless $url->path->to_route =~ /ffmpeg/
            and $tx->req->method eq 'POST';
        $feed = $app->feeds->{$feed} = {tx=>$tx, clients=>{}};
        #~ warn "add feed: ", $feed;
        $tx->req->max_message_size(0);
        #~ $tx->with_protocols('binary');
        #~ $app->log->error($app->dumper($tx->req->content->asset));
        $tx->req->content->asset->on(upgrade => sub {
          my ($mem, $file) = @_;
          #~ $file->path('/dev/null');
          $file->handle->close;
          $file->handle(IO::File->new("> /dev/null"));
        });
        $tx->on('chunk'=>sub {
          my ($tx, $chunk) = @_;
          #~ return
            #~ if length($chunk)<20;
          $_->tx->send({binary => $chunk})
            for (values %{$feed->{clients}});
        });
      });
    },
  ],
  #~ before_routes => [],
  "before_dispatch" => [
    sub {
      my $c = shift;
      my $origin = $c->req->headers->origin; # origin	null
      return 1
        if !defined $origin;
      $c->res->headers->header('Access-Control-Allow-Origin' => '*');#$origin
      1;
    },
    sub {# redirector
      my $c = shift;
      #~ return 1;
      my $url = $c->req->url->to_abs;
      #~ $c->app->log->debug($url->path->to_route);
      #~ return $c->redirect_to('ТМЦ объекты')
        #~ if $url->path->to_route eq '/тмц/база';
      #~ return $c->redirect_to('ТМЦ снабжение')
        #~ if $url->path->to_route eq '/тмц/снабжение';
      #~ return $c->redirect_to('ТМЦ склад')
        #~ if $url->path->to_route eq '/тмц/склад';
      #~ return 1;
      return 1
        if $url->scheme eq 'https' || $url->port;
      $url->scheme('https');
      $c->res->code('301');
      $c->redirect_to($url);
    },
    sub {#шаблоны и статика домена (лучше around_dispatch ниже - нет)
      my $c = shift;
      my $home = $c->app->home;
      my $s = $c->app->static->paths;
      my $t = $c->app->renderer->paths;
      
      # сначала почикать предыдущие
      ($t->[$_] // '') =~ /\/templates@/
        and splice(@$t, $_, 1)
        for (0..$#$t);
        
      ($s->[$_] // '') =~ /\/static@/
        and splice(@$s, $_, 1)
        for (0..$#$s);
      
      # теперь этот хост
      my $host = $c->req->url->to_abs->host;
      unshift @$t, $home->rel_file('templates@'.$host);
      unshift @$s, $home->rel_file('static@'.$host);
      $c->log->info(@$s, $host, @$t);
    },
  ],
  "after_dispatch" => [],
  "after_static" => [
    sub {
      my $c = shift;
      #~ $c->app->log->debug('after_static hook', $c->tx->res->code);
      $c->res->headers->cache_control('public, max-age=2592000, must-revalidate');
    },
  ],
  
  #"around_dispatch" => [
  #   sub ($next, $c) {#шаблоны и статика домена
  #     state $s = $c->app->static->paths;
  #     state $t = $c->app->renderer->paths;
  #     state $home = $c->app->home;
      
  #     my $host = $c->req->url->to_abs->host;
  #     unshift @$t, $home->rel_file('templates@'.$host);
  #     unshift @$s, $home->rel_file('static@'.$host);
  #     #~ $c->log->info("\n", @$s, $host, @$t);
  #     $next->();
      
  #     shift @$s;
  #     shift @$t;
  #     #~ $c->log->info("\n", @$s, $host, @$t);
  #   }
  # ],# end around_dispatch's

};