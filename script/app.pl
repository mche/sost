#!/usr/bin/env perl
# find ~/perl5/lib/ -type f -exec grep -Hni 'Mojolicious (Perl)' {} \;

#~ use utf8::all;
#~ use warnings FATAL => 'all';
#~ use open ':encoding(UTF-8)';
#~ use open        qw< :std  :utf8     >;
#~ use open IO => ':encoding(UTF-8)';

use lib 'lib';
use Mojo::Base 'Mojolicious::Che';
use POSIX 'setsid';

my $app = __PACKAGE__->new(config =>'config/Config.pm',);
# set in Mojolicious as default
#~ $app->types(MojoX::MIME::Types->new);
# инициация моделей - Это обязательно для hypnotoad, который запускает параллельные процессы и возникают конфликты postgresql tuple concurrently updated
$app->init_models();
#~ $app->minion->reset;
#~ $app->log->info("MINION_PID: $ENV{MINION_PID}");
$app->minion->workers->manage();
$app->start();# did not return an application object.

__END__

if ( 0 && $app->renderer->get_helper('minion') && (!$ARGV[0] || $ARGV[0] eq 'daemon' || $ARGV[0] eq 'prefork') ) {
  my $pid_file = 'minion.pid';
  # hypnotoad || prefork должны всегда убить minion process
  # другие режимы не делают detach
  my $is_prefork = $ENV{HYPNOTOAD_APP} || ($ARGV[0] && $ARGV[0] eq 'prefork');
  # always shutdown prev worker (little downtime)
  if ( $is_prefork ) {
    #~ my $pid = run_pid($pid_file);
    #~ kill 'QUIT', $pid
      #~ if $pid;
    prefork($app, $pid_file);
    #~ 
    #~ my $subprocess = Mojo::IOLoop::Subprocess->new();
    #~ $subprocess->run(
      #~ sub {
        #~ my $subprocess = shift;
        #~ prefork($app, $pid_file);
        #~ return $$;
      #~ }, sub {1;});
    #~ $subprocess->ioloop->start
      #~ unless $subprocess->ioloop->is_running;
    
  } else {
  
    my $subprocess = Mojo::IOLoop::Subprocess->new();
    $subprocess->run(
      sub {
        my $subprocess = shift;
        
      #~ if ( $conf->{is_morbo} && check_pid($conf->{pid_file}) ) {
        #~ $minion->add_task(stop_worker => sub {
          #~ kill_pid($conf->{pid_file}, $app->log);
          #~ shift->finish;
        #~ });
        #~ $minion->enqueue(stop_worker => []);
      #~ }
        my $is_morbo = !$ENV{HYPNOTOAD_APP} && !@ARGV;
        if ( $is_morbo) {
          my $old_pid = run_pid($pid_file);
  
          kill 'QUIT', $old_pid
            and $app->log->error("Minion worker was stoped (pid $old_pid)")
            if $old_pid;
        }
        
        
          $app->log->error("Minion worker is starting as subchild (pid $$) ...");
          save_pid($pid_file, $$)
            if $is_morbo;
          $app->start('minion', 'worker');
          #~ exec 'perl', $script, 'minion', 'worker';
          #~ $app->minion->worker->run;
        #~ }
        
        #~ system 'perl', $script, 'minion', 'worker';
        #~ CORE::exit(0); # terminate the process
        return $$;
      },
      sub {# subprocess returns nothing
        #~ my ($subprocess, $err, @results) = @_;
        #~ $app->log->error("Minion worker has been done: @results");
        #~ say "Subprocess error: $err" and return if $err;
        1;
      }
    );
  #~ and ($ENV{HYPNOTOAD_APP} && ($subprocess->ioloop->is_running || $subprocess->ioloop->start))# Start event loop if necessary

  # Dont $subprocess->ioloop->start!
  #~ $subprocess->ioloop->start
    #~ if $is_prefork && !$subprocess->ioloop->is_running;
    
  }
}


#~ $app->log->error("Starting app $$ ...");#(delay = $delay)


sub prefork {
  my ($app, $pid_file) = @_;
  my $script = path($0)->to_abs->to_string;

  #  detach worker subchild
  #~ &daemonize()
    #~ or CORE::exit(0); # parent
    #~ or return;
  defined(my $pid = fork())   || die "Can't fork: $!";
  return
      if $pid;

  my $old_pid = run_pid($pid_file);
  
  kill 'QUIT', $old_pid
    and $app->log->error("Minion worker was stoped (pid $old_pid)")
    if $old_pid;
  
  unless ($ENV{HYPNOTOAD_STOP}) {
    save_pid($pid_file, $$)
      if $ENV{HYPNOTOAD_APP} && !$ENV{HYPNOTOAD_FOREGROUND};
    $app->log->error("Minion worker is starting (pid $$) ... [@ARGV]");
    $0 = "$0 minion worker";
    $app->minion->worker->run;
  } 
  CORE::exit(0);
}

 sub daemonize {
  my ($detach) = @_;
  #~ chdir("/")                  || die "can't chdir to /: $!";
  defined(my $pid = fork())   || die "can't fork: $!";
  return 0
    if $pid; # parent
  
  if ($detach) {
    require POSIX;
    (POSIX::setsid() != -1)               || die "Can't start a new session: $!";
    open(STDIN,  "< /dev/null")    || die "Can't read /dev/null: $!";
    open(STDOUT, "> /dev/null") || die "Can't write to /dev/null: $!";
    open(STDERR, ">&STDOUT")  || die "Can't dup stdout: $!";
  }
   return $$;
 }

# get prev worker pid
sub run_pid {
  my ($pid_file) = @_;
  return undef unless -r (my $file = path($pid_file));
  my $pid = $file->slurp;
  chomp $pid;
  $file->remove;# always recreate
 
  # Running
  return $pid if $pid && kill 0, $pid;
 
  # Not running
  return undef;
}

sub save_pid {
  my ($pid_file, $pid) = @_;
 
  my $file = path($pid_file);
 
  # Create PID file
  if (my $err = eval { $file->spurt("$pid\n")->chmod(0644) } ? undef : $@) {
    #~ $self->app->log->error(qq{Can't create process id file "$file": $err})
      #~ and 
      die qq{Can't create Minion worker process id file "$file": $err};
  }
  #~ $self->app->log->info(qq{Creating process id file "$file"});
  return $pid;
}

  init,1  
  |-/home/guest/Ost,29192                                                                                
  |-/home/guest/Ost,29194                                                                                              
  |   |-/home/guest/Ost,29195                                                                                              
  |   |-/home/guest/Ost,29196                                                                                              
  |   |-/home/guest/Ost,29197                                                                                              
  |   `-/home/guest/Ost,29198                                                                                              
  |

