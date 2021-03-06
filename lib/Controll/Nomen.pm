package Controll::Nomen;
use Mojo::Base 'Mojolicious::Controller';


has model => sub { $_[0]->app->models->{'Nomen'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

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

sub повторы_на_концах {
  my $c = shift;
  my $r = $c->model->повторы_на_концах();
  $c->render(json=>{success=>$r});
  
}

sub удалить_концы {
  my $c = shift;
  my $r = $c->model->удалить_концы();#$c->auth_user->{id}
  $c->render(json=>{success=>$r});
}


1;