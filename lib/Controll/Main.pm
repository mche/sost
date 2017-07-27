package Controll::Main;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Main'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('main/home',
    #~ handler=>'ep',
    'header-title' => 'Старт');
    #~ if $c->is_user_authenticated;
}



sub trace {
  my $c = shift;
  #~ $c->render;
}

sub trace2 {
  my $c = shift;
  $c->render('main/trace');
}

sub prepared_st {
  my $c = shift;
  $c->render(format=>'txt',); #$c->access->plugin->oauth->model->dict, 
}

sub config {# версия и прочее
  my $c = shift;
  $c->render(json=>$c->model->конфиг());
}

1;

__DATA__
@@ main/prepared_st.txt.cgi.pl
#
$c->dumper($c->dbh->selectall_arrayref('select * from pg_prepared_statements;', {Slice=>{}},), $c->dbh->{queue}),
,
