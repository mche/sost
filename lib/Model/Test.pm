package Model::Test;
use Mojo::Base 'Model::TestBase';

sub test1 {
  my ($self, $id, $req_id) = @_;
  my $s = $self->foo($id)
    if $id;
  $s ||= $self->insert_default_values("public", "test", $req_id);
  return $s;
}



1;

__DATA__
@@ 1
2
