package Controll::Waltex::Wallet;
use Mojo::Base 'Mojolicious::Controller';

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };
#~ has category_count => sub {$model->category_count};# hashref
has model => sub {shift->app->models->{'Wallet'}};

sub data {
  my $c= shift;
  my $project = $c->vars('project');
  
  #~ return $c->render(json=>[{id=>1, title=>'касса'},{id=>2, title=>"счет 2"}]);
  return $c->render(json=>$c->model->список($project));
}

1;