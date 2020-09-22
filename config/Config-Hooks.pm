use Mojo::Base -strict;


{
  "before_server_start" => [
    sub {
      my ($server, $app) = @_;
      $app->attr( 'сервер' => sub { $server } );# это has, пригодится
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
      #~ $url->host('uniost.ru');
      $c->res->code('301');
      $c->redirect_to($url);
    },
    sub {#шаблоны и статика домена
      my $c = shift;
      my $home = $c->app->home;
      
      # сначала почикать предыдущие
      ($c->app->renderer->paths->[$_] // '') =~ /\/templates@/
        and splice(@{$c->app->renderer->paths}, $_, 1)
        for (0..$#{$c->app->renderer->paths});
        
      ($c->app->static->paths->[$_] // '') =~ /\/static@/
        and splice(@{$c->app->static->paths}, $_, 1)
        for (0..$#{$c->app->static->paths});
      
      # теперь этот хост
      my $host = $c->req->url->to_abs->host;
      unshift @{$c->app->renderer->paths}, $home->rel_file('templates@'.$host);
      unshift @{$c->app->static->paths}, $home->rel_file('static@'.$host);
      
      #~ $c->app->log->error("", @{$c->app->renderer->paths}, "\nstatic", @{$c->app->static->paths});
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

};