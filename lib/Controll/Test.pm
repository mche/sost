package Controll::Test;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::Util qw(dumper);
use Model::Test;

has model => sub {
  state $m = Model::Test->new(dbh=>shift->app->dbh);
};

sub test1 {
  my $c = shift;
  #~ my $r = $c->app->dbh->selectrow_hashref($c->app->sth);
  my $r = $c->model->test1(undef, $c->req->request_id);#_insert_default_values
  $c->app->log->info(dumper $r);
  $c->render(text => $r->{id});
  
}

1;