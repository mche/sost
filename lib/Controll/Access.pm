package Controll::Access;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'Access'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('access/index',
    handler=>'ep',
    'header-title' => 'Управление пользователями и доступ',
    assets=>["access.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub users {
  my $c = shift;
  my $data = $c->model->пользователи();
  $c->render(json=>$data);
}

sub roles {
  my $c = shift;
  my $data = $c->model->роли();
  $c->render(json=>$data);
}

sub routes {
  my $c = shift;
  my $data = $c->model->маршруты();
  $c->render(json=>$data);
}

sub user_save {
  my $c = shift;
  my $data = $c->req->json;
  
  delete $data->{ts};
  
  my $p = eval{$c->model->сохранить_профиль($data)}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@});
  
  my $l = eval{$c->model->сохранить_логин(%$data, id=>$data->{'login/id'}, )}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if grep(length > 3, map($data->{$_} =~ s/(^\s+|\s+$)//gr, qw(login pass)));
  
  my $r = $c->model->связь($p->{id}, $l->{id})
    if $p->{id} && $l->{id};
  @$p{qw(login pass login/id)} = @$l{qw(login pass id)}
    if $l && $l->{id};
  
  $c->render(json=>{success=>$p});
}

1;