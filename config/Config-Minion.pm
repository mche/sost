use Mojo::Base -strict;
use Mojo::IOLoop;

['Minion::Workers' => {Pg => sub { warn @_; shift->dbh->{'main'}->pg }, workers=>2, manage=>1, tasks => {
  slow_log => sub { # SQLite => 'sqlite:minion.db',
    my ($job, $arg1) = @_;
    my $j = $job->app->dumper($job->info);
    $job->app->log->info(qq{slow_log ARG="$arg1", worker pid [$ENV{MINION_PID}] job: $j});#, keys %{$app->models}
    $job->finish;
  },
  tg_api_request => sub {#для вебхука
    my ($job, $method, $send) = @_;
    $job->app->log->info("api_request: $method ".$job->app->dumper($send));
    
    my $res = eval { $job->app->tg->api_request($method, $send) };
    $res = $@
      and $job->app->log->error($res)
      unless $res;
    $job->finish({error=>$res});
  },
},}];

__END__
my $cb = sub {
      my ($ua, $tx) = @_;
      $job->app->log->info($job->app->dumper($tx));
      #~ return 
        #~ unless $ua;
       $job->app->log->error($tx->error)
        if $tx->error;
      #~ say $tx->res->json->{ok} ? 'YAY!' : ':('; # Not production ready!
      my $res = $tx->res->json;
      $job->finish($res)
        if $res;
      $job->finish({error=>$tx->error || 'Ошибка запроса АПИ: '.$job->app->dumper($tx)});
    };
    Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
