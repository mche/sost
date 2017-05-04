use Mojolicious::Lite;


get '/' =>  sub {
  my $c = shift;
  my $data = 'выав выава';
  utf8::encode($data);

  $c->render(data=>$data);
};

app->start;

