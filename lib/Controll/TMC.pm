package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'TMC'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('tmc/index',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub save_ask {
  my $c = shift;
  my $data = $c->req->json;
  $data->{uid} = $c->auth_user->{id};
  
  $c->render(json=>{success=>$c->model->сохранить_заявку($data)});
  
  
}

1;
