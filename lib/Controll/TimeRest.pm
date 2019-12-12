package Controll::TimeRest;
use Mojo::Base 'Mojolicious::Controller';


has model => sub { $_[0]->app->models->{'Отпуск'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
#~ has model_access => sub { $_[0]->app->models->{'Access'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
#~ has model_money => sub { $_[0]->app->models->{'Money'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
#~ has model_category => sub { $_[0]->app->models->{'Category'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
#~ has model_object => sub { $_[0]->app->models->{'Object'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {
  my $c = shift;
  return $c->render('отпуск/index',
    handler=>'ep',
    #~ title=>'',
    'header-title' => 'Отпускные календари сотрудников',
    assets=>["отпуск.js", "календарь.css"],
    );
}

sub отпуск {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->отпуск($param));
}

1;