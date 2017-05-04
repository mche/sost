package Controll::Project;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Project'}};

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