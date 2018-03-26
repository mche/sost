package Controll::Contragent;
use Mojo::Base 'Mojolicious::Controller';

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };
#~ has category_count => sub {$model->category_count};# hashref
has model => sub {shift->app->models->{'Contragent'}};

sub data {
  my $c= shift;
  
  #~ return $c->render(json=>[{id=>1, title=>'касса'},{id=>2, title=>"счет 2"}]);
  my $param={select=>' row_to_json(k) '};
  return $c->render(json=>$c->model->список($param));
}

1;