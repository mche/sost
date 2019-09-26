#~ use Mojo::Base::Che; # один патч для хазов
use Mojolicious::Lite;
use Mojo::Util qw(dumper);
use DBI;

use lib 'lib';
#~ app->config(hypnotoad => {
  #~ listen => ['http://*:8088'],
  #~ workers => 5,
  #~ pid_file => 'hypnotoad-8080.pid'
#~ });

app->attr(dbh=>sub{
  DBI->connect('dbi:Pg:dbname=dev2', 'postgres', undef,);
});

app->attr(sth=>sub{
  shift->dbh->prepare('insert into "медкол"."сессии" DEFAULT VALUES returning *');
});


app->attr(model => sub {
  require Model::Test;
  #~ state $m = 
  Model::Test->new(app=>$_[0]->app, dbh=>$_[0]->app->dbh);
});

get '/' => sub {
  my $c = shift;
  #~ my $session = $c->session;
  #~ my $r = $c->app->dbh->selectrow_hashref($c->app->sth);
  my $r = $c->app->model->test1(undef, $c->req->request_id);
  $c->app->log->info(dumper $r);
    #~ if $session;
  #~ $session->{foo}++;
  #~ $c->render(text => "<div>ALL GLORY TO GLORIA! $session->{foo}</div>");
  $c->render(text => $r->{id});
};

#~ app->mode('development');
app->log->level('info');
app->secrets(['My secret passphrase']);
app->start;

