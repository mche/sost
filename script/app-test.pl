#####################################
package Model::Base;
use Mojo::Base -base;

sub bar {
  my $self = shift;
  return {"id"=>shift};
}

1;
#####################################
package Model::Test;
use Mojo::Base 'Model::Base';

sub test1 {
  my ($self, $id, $req_id) = @_;
  my $s = $id ? $self->foo($id) : $self->bar($req_id);
    #~ if $id;
  # вот эта строчка запускается только один раз
  # а нужно для каждого запроса без $id
  #~ $s ||= $self->bar($req_id); 
  return $s;
}

1;
################################
package main;
use Mojo::Base 'Mojolicious';
use Mojo::Util qw(dumper);

has model => sub { Model::Test->new };

sub startup {
  my $app = shift;
  $app->secrets(['My secret pa$$phrase']);
  my $r = $app->routes;
  $r->get('/' => sub {
    my $c = shift;
    my $r = $c->app->model->test1($c->session->{foo}, $c->req->request_id);
    $c->app->log->debug(dumper $r);
    $c->render(text => $r->{id});
  });
}

__PACKAGE__->new->start;