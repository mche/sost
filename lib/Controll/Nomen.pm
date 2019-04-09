package Controll::Nomen;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Nomen'}};

sub list {
  my $c = shift;
  my $root = $c->vars('root');
  $c->render(json=>$c->model->список($root, {select=>' row_to_json(t) '},));
}

sub список_без_потомков {
  my $c = shift;
  my $root = $c->vars('root');
  $c->render(json=>$c->model->список_без_потомков($root, {select=>' row_to_json(t) '},));
}

sub справочник {
  my $c = shift;
  return $c->render('номенклатура/справочник',
    handler=>'ep',
    'header-title' => 'Справочник номенклатуры',
    assets=>["номенклатура/справочник.js",],
    );
}

sub переместить_позицию {# справочника
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->переместить_позицию($data);
  return $c->render(json=>{error=>"Ошибка перемещения: $r"})
    unless ref $r;
  $c->render(json=>{success=>$r});
}

sub изменить_название {
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->сохранить($data);
  return $c->render(json=>{error=>"Ошибка сохранения: $r"})
    unless ref $r;
  $c->render(json=>{success=>$r});
  
}


1;