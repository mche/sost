package Controll::Project;
use Mojo::Base 'Mojolicious::Controller';


has model => sub { $_[0]->app->models->{'Project'}->uid($_[0]->auth_user && $_[0]->auth_user->{id})};

sub list {
  my $c = shift;
  
  return $c->render(json=>$c->model->список());
  
  
  
}

sub save {
  my $c = shift;
  my $data =  $c->req->json
    or return $c->render(json=>{error=>"нет данных"});
  
  return $c->render(json=>$c->model->сохранить($data));
  
}

1;