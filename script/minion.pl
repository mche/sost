use Mojolicious::Lite;
# Mojolicious::Lite (choose a backend)

warn @ARGV
  if @ARGV;

plugin Minion => {Pg => 'postgresql://postgres@/dev24'};

app->minion->app(app);

# Add tasks to your application
app->minion->add_task(slow_log => sub {
  my ($job, $msg) = @_;
  sleep 5;
  $job->app->log->debug(qq{Received message "$msg"});
});

get '/' => sub {
  my $c = shift;
  
  # Start jobs from anywhere in your application
  $c->minion->enqueue(slow_log => ['test 123']);
  
  $c->render(text=>'OK');
  
};

app->start;
